import type { DomainId, ScenarioId, AnswerLabel, Question } from "@/data/questions";

export type { DomainId, ScenarioId, AnswerLabel, Question };

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
  questions: Question[];
  answers: UserAnswer[];
  currentQuestionIndex: number;
  reviewMode: boolean;
  domainResults: DomainResult[];
  rawScore: number;
  scaledScore: number;
  passed: boolean;
}
