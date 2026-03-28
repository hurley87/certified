import assert from "node:assert/strict";

import { questions } from "../data/questions";
import { hardQuestions } from "../data/hard-questions";
import { generateExam, calculateScore, getQuestionBank } from "./exam";
import { DOMAINS, SCENARIOS } from "./constants";

function countBy<T extends string | number>(values: T[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[String(value)] = (acc[String(value)] ?? 0) + 1;
    return acc;
  }, {});
}

function validateQuestionBank(): void {
  assert.ok(questions.length >= 150, "Question bank must contain at least 150 questions");

  const ids = questions.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "Question IDs must be unique");
  assert.equal(Math.min(...ids), 1, "Question IDs should start at 1");
  assert.equal(Math.max(...ids), ids.length, "Question IDs should be contiguous");

  for (const question of questions) {
    assert.equal(
      question.options.length,
      4,
      `Question ${question.id} must have exactly 4 options`
    );
    assert.deepEqual(
      question.options.map((o) => o.label).sort(),
      ["A", "B", "C", "D"],
      `Question ${question.id} must include labels A-D exactly once`
    );
    assert.ok(
      question.options.some((o) => o.label === question.correctAnswer),
      `Question ${question.id} has invalid correctAnswer`
    );
    assert.ok(
      question.explanation.trim().length > 30,
      `Question ${question.id} explanation appears too short`
    );
  }

  const domainCounts = countBy(questions.map((q) => q.domain));
  const domainMinimums: Record<number, number> = { 1: 40, 2: 27, 3: 30, 4: 30, 5: 23 };
  for (const domain of DOMAINS) {
    const minRequired = domainMinimums[domain.id];
    assert.ok(minRequired !== undefined, `Missing minimum for domain ${domain.id}`);
    const count = domainCounts[String(domain.id)] ?? 0;
    assert.ok(
      count >= minRequired,
      `Domain ${domain.id} (${domain.name}) must contain at least ${minRequired} questions, found ${count}`
    );
  }

  const scenarioCounts = countBy(questions.map((q) => q.scenario));
  for (const scenario of SCENARIOS) {
    assert.ok(
      (scenarioCounts[String(scenario.id)] ?? 0) > 0,
      `Scenario ${scenario.id} (${scenario.name}) must be represented in the question bank`
    );
  }

  const taskCounts = countBy(questions.map((q) => q.taskStatement));
  assert.equal(Object.keys(taskCounts).length, 30, "Expected exactly 30 task statements");
  for (const [task, taskCount] of Object.entries(taskCounts)) {
    assert.ok(taskCount >= 2, `Task statement "${task}" must have at least 2 questions`);
  }

  const keyDistribution = countBy(questions.map((q) => q.correctAnswer));
  const maxCount = Math.max(...Object.values(keyDistribution));
  const minCount = Math.min(...Object.values(keyDistribution));
  const totalQuestions = questions.length;
  const maxShare = maxCount / totalQuestions;
  const minShare = minCount / totalQuestions;
  assert.ok(
    maxShare <= 0.8,
    `Answer-key distribution is overly concentrated (${JSON.stringify(keyDistribution)})`
  );
  assert.ok(
    minShare >= 0.01,
    `Every answer label must be represented (found ${JSON.stringify(keyDistribution)})`
  );

  // Heuristic quality checks to prevent easily gameable options.
  // These thresholds are intentionally conservative: they should catch regressions
  // without blocking iterative content improvements.
  const optionLengthStats = questions.map((question) => {
    const lengthsByLabel = question.options.reduce<Record<string, number>>((acc, option) => {
      acc[option.label] = option.text.length;
      return acc;
    }, {});
    const correctLength = lengthsByLabel[question.correctAnswer];
    const distractorLengths = question.options
      .filter((option) => option.label !== question.correctAnswer)
      .map((option) => option.text.length);
    const maxLength = Math.max(...Object.values(lengthsByLabel));
    return {
      isCorrectLongest: correctLength === maxLength,
      correctLength,
      avgDistractorLength:
        distractorLengths.reduce((sum, value) => sum + value, 0) / distractorLengths.length,
    };
  });

  const correctLongestRatio =
    optionLengthStats.filter((entry) => entry.isCorrectLongest).length / optionLengthStats.length;
  assert.ok(
    correctLongestRatio <= 0.93,
    `Correct options are too often the longest choice (${(correctLongestRatio * 100).toFixed(1)}%)`
  );

  const avgCorrectLength =
    optionLengthStats.reduce((sum, entry) => sum + entry.correctLength, 0) / optionLengthStats.length;
  const avgDistractorLength =
    optionLengthStats.reduce((sum, entry) => sum + entry.avgDistractorLength, 0) /
    optionLengthStats.length;
  assert.ok(
    avgCorrectLength <= avgDistractorLength * 2.4,
    `Correct options are disproportionately verbose (avg ${avgCorrectLength.toFixed(
      1
    )} vs distractors ${avgDistractorLength.toFixed(1)})`
  );
}

const HARD_FIRST_ID = 174;
const STANDARD_MAX_ID = Math.max(...questions.map((q) => q.id));

function validateHardQuestionBank(): void {
  assert.ok(hardQuestions.length >= 60, "Hard pool must support 60-question exams");

  assert.ok(
    STANDARD_MAX_ID < HARD_FIRST_ID,
    `Hard question ids must start after standard bank (standard max ${STANDARD_MAX_ID}, hard starts ${HARD_FIRST_ID})`
  );

  const ids = hardQuestions.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length, "Hard question IDs must be unique");
  assert.equal(Math.min(...ids), HARD_FIRST_ID, "Hard IDs should start at 174");
  assert.equal(Math.max(...ids), HARD_FIRST_ID + hardQuestions.length - 1, "Hard IDs should be contiguous");

  for (const question of hardQuestions) {
    assert.equal(
      question.options.length,
      4,
      `Hard question ${question.id} must have exactly 4 options`
    );
    assert.deepEqual(
      question.options.map((o) => o.label).sort(),
      ["A", "B", "C", "D"],
      `Hard question ${question.id} must include labels A-D exactly once`
    );
    assert.ok(
      question.options.some((o) => o.label === question.correctAnswer),
      `Hard question ${question.id} has invalid correctAnswer`
    );
    assert.ok(
      question.explanation.trim().length > 30,
      `Hard question ${question.id} explanation appears too short`
    );
  }

  const hardDomainMinimums: Record<number, number> = { 1: 14, 2: 9, 3: 10, 4: 10, 5: 7 };
  const hardDomainCounts = countBy(hardQuestions.map((q) => q.domain));
  for (const domain of DOMAINS) {
    const minRequired = hardDomainMinimums[domain.id];
    assert.ok(minRequired !== undefined, `Missing hard-pool minimum for domain ${domain.id}`);
    const count = hardDomainCounts[String(domain.id)] ?? 0;
    assert.ok(
      count >= minRequired,
      `Hard pool domain ${domain.id} (${domain.name}) must contain at least ${minRequired} questions, found ${count}`
    );
  }

  const hardScenarioCounts = countBy(hardQuestions.map((q) => q.scenario));
  for (const scenario of SCENARIOS) {
    assert.ok(
      (hardScenarioCounts[String(scenario.id)] ?? 0) > 0,
      `Hard pool must represent scenario ${scenario.id} (${scenario.name})`
    );
  }

  const hardKeyDistribution = countBy(hardQuestions.map((q) => q.correctAnswer));
  const hardTotal = hardQuestions.length;
  const hardMaxShare = Math.max(...Object.values(hardKeyDistribution)) / hardTotal;
  const hardMinShare = Math.min(...Object.values(hardKeyDistribution)) / hardTotal;
  assert.ok(
    hardMaxShare <= 0.8,
    `Hard answer-key distribution is overly concentrated (${JSON.stringify(hardKeyDistribution)})`
  );
  assert.ok(
    hardMinShare >= 0.01,
    `Every answer label must appear in hard pool (found ${JSON.stringify(hardKeyDistribution)})`
  );

  const hardOptionLengthStats = hardQuestions.map((question) => {
    const lengthsByLabel = question.options.reduce<Record<string, number>>((acc, option) => {
      acc[option.label] = option.text.length;
      return acc;
    }, {});
    const correctLength = lengthsByLabel[question.correctAnswer];
    const distractorLengths = question.options
      .filter((option) => option.label !== question.correctAnswer)
      .map((option) => option.text.length);
    const maxLength = Math.max(...Object.values(lengthsByLabel));
    return {
      isCorrectLongest: correctLength === maxLength,
      correctLength,
      avgDistractorLength:
        distractorLengths.reduce((sum, value) => sum + value, 0) / distractorLengths.length,
    };
  });

  const hardCorrectLongestRatio =
    hardOptionLengthStats.filter((entry) => entry.isCorrectLongest).length / hardOptionLengthStats.length;
  assert.ok(
    hardCorrectLongestRatio <= 0.93,
    `Hard pool: correct options are too often the longest choice (${(hardCorrectLongestRatio * 100).toFixed(1)}%)`
  );

  const hardAvgCorrectLength =
    hardOptionLengthStats.reduce((sum, entry) => sum + entry.correctLength, 0) / hardOptionLengthStats.length;
  const hardAvgDistractorLength =
    hardOptionLengthStats.reduce((sum, entry) => sum + entry.avgDistractorLength, 0) /
    hardOptionLengthStats.length;
  assert.ok(
    hardAvgCorrectLength <= hardAvgDistractorLength * 2.4,
    `Hard pool: correct options are disproportionately verbose (avg ${hardAvgCorrectLength.toFixed(
      1
    )} vs distractors ${hardAvgDistractorLength.toFixed(1)})`
  );
}

function testHardExamGenerationAndScoring(): void {
  assert.equal(getQuestionBank("standard"), questions);
  assert.equal(getQuestionBank("hard"), hardQuestions);

  for (const n of [15, 30, 60]) {
    assert.ok(
      n <= hardQuestions.length,
      `Hard pool must have at least ${n} questions for fixed-length exams`
    );
    const examN = generateExam(n, hardQuestions);
    assert.equal(examN.length, n, `${n}-question hard exam should contain ${n} questions`);
    assert.equal(
      new Set(examN.map((q) => q.id)).size,
      n,
      `${n}-question hard exam should not include duplicates`
    );
  }

  const allHard = generateExam(999, hardQuestions);
  assert.equal(allHard.length, hardQuestions.length, "Hard 'all questions' draw should include full pool");
}

function testExamGenerationAndScoring(): void {
  const exam30 = generateExam(30, questions);
  assert.equal(exam30.length, 30, "30-question exam should contain 30 questions");
  assert.equal(
    new Set(exam30.map((q) => q.id)).size,
    30,
    "Generated 30-question exam should not include duplicates"
  );

  const allExam = generateExam(999, questions);
  assert.equal(
    allExam.length,
    questions.length,
    "Large requested exam should include all available questions"
  );

  const zeroAnswers = exam30.map((q) => ({
    questionId: q.id,
    selectedAnswer: null,
    isCorrect: false,
  }));
  const zeroScore = calculateScore(exam30, zeroAnswers);
  assert.equal(zeroScore.scaledScore, 100, "0% raw score should map to 100 scaled");

  const perfectAnswers = exam30.map((q) => ({
    questionId: q.id,
    selectedAnswer: q.correctAnswer,
    isCorrect: true,
  }));
  const perfectScore = calculateScore(exam30, perfectAnswers);
  assert.equal(perfectScore.scaledScore, 1000, "100% raw score should map to 1000 scaled");
}

validateQuestionBank();
validateHardQuestionBank();
testExamGenerationAndScoring();
testHardExamGenerationAndScoring();
console.log("All exam validations passed.");
