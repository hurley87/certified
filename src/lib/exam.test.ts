import { questions } from "../data/questions";
import { generateExam, calculateScore } from "./exam";

// Test generateExam with 30 questions
const exam = generateExam(30, questions);
console.log("Generated exam:", exam.length, "questions");

// Check no duplicates
const ids = exam.map((q) => q.id);
const unique = new Set(ids);
console.log("Unique IDs:", unique.size, "=== 30?", unique.size === 30);

// Check domain distribution
const domainCounts: Record<number, number> = {};
for (const q of exam) {
  domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1;
}
console.log("Domain distribution:", domainCounts);

// Check answer shuffling - verify correctAnswer still points to the right text
const sourceQ = questions[0];
const examQ = exam.find((q) => q.id === sourceQ.id);
if (examQ) {
  const sourceCorrectText = sourceQ.options.find((o) => o.label === sourceQ.correctAnswer)?.text;
  const examCorrectText = examQ.options.find((o) => o.label === examQ.correctAnswer)?.text;
  console.log("Correct answer text match:", sourceCorrectText === examCorrectText);
}

// Test calculateScore
const answers = exam.map((q, i) => ({
  questionId: q.id,
  selectedAnswer: i < 22 ? q.correctAnswer : ("A" as const),
  isCorrect: i < 22,
}));
const score = calculateScore(exam, answers);
console.log("Score:", {
  raw: score.rawScore.toFixed(1),
  scaled: score.scaledScore,
  passed: score.passed,
});
console.log(
  "Domain results:",
  score.domainResults.map((d) => `${d.domainName}: ${d.correctAnswers}/${d.totalQuestions}`)
);

// Test "All" mode
const allExam = generateExam(999, questions);
console.log("All questions exam:", allExam.length, "=== total?", allExam.length === questions.length);

// Test 15 questions
const small = generateExam(15, questions);
console.log("15-question exam:", small.length);

// Edge case: 0% and 100%
const zeroAnswers = exam.map((q) => ({
  questionId: q.id,
  selectedAnswer: null,
  isCorrect: false,
}));
const zeroScore = calculateScore(exam, zeroAnswers);
console.log("0% score:", zeroScore.scaledScore, "=== 100?", zeroScore.scaledScore === 100);

const perfectAnswers = exam.map((q) => ({
  questionId: q.id,
  selectedAnswer: q.correctAnswer,
  isCorrect: true,
}));
const perfectScore = calculateScore(exam, perfectAnswers);
console.log("100% score:", perfectScore.scaledScore, "=== 1000?", perfectScore.scaledScore === 1000);
