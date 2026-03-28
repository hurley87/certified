import type {
  Question,
  DomainId,
  AnswerLabel,
  DomainResult,
  UserAnswer,
  ExamMode,
} from "./types";
import { questions } from "@/data/questions";
import { hardQuestions } from "@/data/hard-questions";
import { DOMAINS, MIN_SCALED_SCORE, MAX_SCALED_SCORE, PASSING_SCORE } from "./constants";

/** Question bank for the selected exam mode (standard vs hard pool). */
export function getQuestionBank(mode: ExamMode): Question[] {
  return mode === "hard" ? hardQuestions : questions;
}

const ANSWER_LABELS: AnswerLabel[] = ["A", "B", "C", "D"];

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateExam(questionCount: number, allQuestions: Question[]): Question[] {
  if (questionCount >= allQuestions.length) {
    return shuffle(allQuestions).map(shuffleOptions);
  }

  const targets = calculateDomainTargets(questionCount);
  const selected: Question[] = [];
  const usedIds = new Set<number>();

  // Select questions per domain according to weighted targets
  for (const { id, target } of targets) {
    const domainQuestions = shuffle(
      allQuestions.filter((q) => q.domain === id && !usedIds.has(q.id))
    );
    const toTake = Math.min(target, domainQuestions.length);
    for (let i = 0; i < toTake; i++) {
      selected.push(domainQuestions[i]);
      usedIds.add(domainQuestions[i].id);
    }
  }

  // Fill remaining slots from unused questions
  if (selected.length < questionCount) {
    const remaining = shuffle(allQuestions.filter((q) => !usedIds.has(q.id)));
    const needed = questionCount - selected.length;
    for (let i = 0; i < needed && i < remaining.length; i++) {
      selected.push(remaining[i]);
    }
  }

  return shuffle(selected).map(shuffleOptions);
}

function calculateDomainTargets(questionCount: number): { id: DomainId; target: number }[] {
  const raw = DOMAINS.map((d) => ({
    id: d.id,
    target: Math.round(questionCount * d.weight),
    weight: d.weight,
  }));

  // Adjust so totals sum to questionCount
  let total = raw.reduce((sum, d) => sum + d.target, 0);
  const sorted = [...raw].sort((a, b) => b.weight - a.weight);

  while (total > questionCount) {
    for (const d of sorted) {
      if (total <= questionCount) break;
      if (d.target > 0) {
        d.target--;
        total--;
      }
    }
  }
  while (total < questionCount) {
    for (const d of sorted) {
      if (total >= questionCount) break;
      d.target++;
      total++;
    }
  }

  return raw.map(({ id, target }) => ({ id, target }));
}

export function shuffleOptions(question: Question): Question {
  const indices = shuffle([0, 1, 2, 3]);
  const newOptions = indices.map((oldIndex, newIndex) => ({
    label: ANSWER_LABELS[newIndex],
    text: question.options[oldIndex].text,
  }));

  const correctOriginalIndex = question.options.findIndex(
    (o) => o.label === question.correctAnswer
  );
  const newCorrectIndex = indices.indexOf(correctOriginalIndex);

  return {
    ...question,
    options: newOptions,
    correctAnswer: ANSWER_LABELS[newCorrectIndex],
  };
}

export function calculateScore(
  questions: Question[],
  answers: UserAnswer[]
): {
  rawScore: number;
  scaledScore: number;
  passed: boolean;
  domainResults: DomainResult[];
} {
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  const rawScore = questions.length > 0 ? (totalCorrect / questions.length) * 100 : 0;
  const scaledScore = Math.round(
    MIN_SCALED_SCORE + (rawScore / 100) * (MAX_SCALED_SCORE - MIN_SCALED_SCORE)
  );
  const passed = scaledScore >= PASSING_SCORE;

  const domainResults: DomainResult[] = DOMAINS.map((domain) => {
    const domainQuestions = questions.filter((q) => q.domain === domain.id);
    const domainAnswers = answers.filter((a) =>
      domainQuestions.some((q) => q.id === a.questionId)
    );
    const correctAnswers = domainAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = domainQuestions.length;

    return {
      domain: domain.id,
      domainName: domain.name,
      weight: domain.weight,
      totalQuestions,
      correctAnswers,
      percentage: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
    };
  });

  return { rawScore, scaledScore, passed, domainResults };
}
