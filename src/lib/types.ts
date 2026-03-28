import type { DomainId, ScenarioId, AnswerLabel, Question } from "@/data/questions";

export type { DomainId, ScenarioId, AnswerLabel, Question };

/** Practice exam difficulty; standard uses the main bank, hard uses the curated hard pool. */
export type ExamMode = "standard" | "hard";

export interface StartExamOptions {
  questionCount: number;
  mode: ExamMode;
}

export interface DomainInfo {
  id: DomainId;
  name: string;
  weight: number;
  questionTarget: number;
}

export interface ScenarioInfo {
  id: ScenarioId;
  name: string;
  description: string;
  primaryDomains: DomainId[];
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: AnswerLabel | null;
  isCorrect: boolean;
}

export interface DomainResult {
  domain: DomainId;
  domainName: string;
  weight: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export interface ExamSession {
  mode: ExamMode;
  questions: Question[];
  answers: UserAnswer[];
  currentQuestionIndex: number;
  reviewMode: boolean;
  domainResults: DomainResult[];
  rawScore: number;
  scaledScore: number;
  passed: boolean;
  timeLimitMs: number | null;
  startedAt: number | null;
}
