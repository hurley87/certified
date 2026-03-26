import assert from "node:assert/strict";

import { questions } from "../data/questions";
import { generateExam, calculateScore } from "./exam";
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
  const skewRatio = minCount === 0 ? Number.POSITIVE_INFINITY : maxCount / minCount;
  if (skewRatio > 3) {
    console.warn(
      `Warning: source answer-key distribution is imbalanced (${JSON.stringify(
        keyDistribution
      )}).`
    );
  }
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
testExamGenerationAndScoring();
console.log("All exam validations passed.");
