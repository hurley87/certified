import hardPkg from "../src/data/hard-questions.ts";
import stdPkg from "../src/data/questions.ts";
const hardQuestions = hardPkg.hardQuestions;
const questions = stdPkg.questions;

function analyze(label: string, bank: typeof questions) {
  let longest = 0;
  const dist = { A: 0, B: 0, C: 0, D: 0 };
  let sumCorrect = 0;
  let sumDist = 0;
  for (const q of bank) {
    const byLabel = Object.fromEntries(q.options.map((o) => [o.label, o.text.length])) as Record<
      string,
      number
    >;
    const c = byLabel[q.correctAnswer];
    const max = Math.max(...q.options.map((o) => o.text.length));
    if (c === max) longest++;
    dist[q.correctAnswer]++;
    sumCorrect += c;
    const distractors = q.options.filter((o) => o.label !== q.correctAnswer);
    sumDist += distractors.reduce((s, o) => s + o.text.length, 0) / 3;
  }
  const n = bank.length;
  console.log(label, {
    correctLongestPct: ((longest / n) * 100).toFixed(1),
    letters: dist,
    avgCorrect: (sumCorrect / n).toFixed(1),
    avgDistractor: (sumDist / n).toFixed(1),
    ratio: (sumCorrect / sumDist).toFixed(2),
  });
}

analyze("standard", questions);
analyze("hard", hardQuestions);
