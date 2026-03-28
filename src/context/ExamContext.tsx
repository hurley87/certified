"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type {
  Question,
  AnswerLabel,
  ExamSession,
  UserAnswer,
  StartExamOptions,
} from "@/lib/types";
import { generateExam, calculateScore, getQuestionBank } from "@/lib/exam";
import { SCENARIOS, EXAM_TIME_LIMITS } from "@/lib/constants";

interface ExamContextValue {
  session: ExamSession | null;
  answerMap: Map<number, UserAnswer>;
  startExam: (options: StartExamOptions) => void;
  answerQuestion: (answer: AnswerLabel) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  enterReviewMode: () => void;
  resetExam: () => void;
  timeUp: () => void;
  currentQuestion: Question | null;
  currentAnswer: UserAnswer | null;
  scenarioDescription: string;
  isLastQuestion: boolean;
}

const ExamContext = createContext<ExamContextValue | null>(null);

function finalizeSession(prev: ExamSession, answers: UserAnswer[]): ExamSession {
  const { rawScore, scaledScore, passed, domainResults } = calculateScore(prev.questions, answers);
  return { ...prev, answers, rawScore, scaledScore, passed, domainResults };
}

export function ExamProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ExamSession | null>(null);

  const startExam = useCallback(({ questionCount, mode }: StartExamOptions) => {
    const pool = getQuestionBank(mode);
    const examQuestions = generateExam(questionCount, pool);
    const timeLimitMs = EXAM_TIME_LIMITS[questionCount] ?? null;
    setSession({
      mode,
      questions: examQuestions,
      answers: [],
      currentQuestionIndex: 0,
      reviewMode: false,
      domainResults: [],
      rawScore: 0,
      scaledScore: 0,
      passed: false,
      timeLimitMs,
      startedAt: timeLimitMs ? Date.now() : null,
    });
  }, []);

  const answerQuestion = useCallback((answer: AnswerLabel) => {
    setSession((prev) => {
      if (!prev || prev.reviewMode) return prev;
      const question = prev.questions[prev.currentQuestionIndex];
      if (prev.answers.some((a) => a.questionId === question.id)) return prev;

      const isCorrect = answer === question.correctAnswer;
      const newAnswer: UserAnswer = {
        questionId: question.id,
        selectedAnswer: answer,
        isCorrect,
      };
      const newAnswers = [...prev.answers, newAnswer];

      if (newAnswers.length === prev.questions.length) {
        return finalizeSession(prev, newAnswers);
      }

      return { ...prev, answers: newAnswers };
    });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (index < 0 || index >= prev.questions.length) return prev;
      return { ...prev, currentQuestionIndex: index };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.currentQuestionIndex < prev.questions.length - 1) {
        return { ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 };
      }
      return prev;
    });
  }, []);

  const timeUp = useCallback(() => {
    setSession((prev) => {
      if (!prev || prev.reviewMode) return prev;
      if (prev.answers.length === prev.questions.length) {
        return finalizeSession(prev, prev.answers);
      }
      const answeredIds = new Set(prev.answers.map((a) => a.questionId));
      const filledAnswers: UserAnswer[] = [...prev.answers];
      for (const q of prev.questions) {
        if (!answeredIds.has(q.id)) {
          filledAnswers.push({ questionId: q.id, selectedAnswer: null, isCorrect: false });
        }
      }
      return finalizeSession(prev, filledAnswers);
    });
  }, []);

  const enterReviewMode = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      return { ...prev, reviewMode: true, currentQuestionIndex: 0 };
    });
  }, []);

  const resetExam = useCallback(() => {
    setSession(null);
  }, []);

  // O(1) answer lookups instead of repeated .find() scans
  const answerMap = useMemo(
    () => new Map(session?.answers.map((a) => [a.questionId, a]) ?? []),
    [session?.answers]
  );

  const currentQuestion = session
    ? session.questions[session.currentQuestionIndex] ?? null
    : null;

  const currentAnswer = currentQuestion
    ? answerMap.get(currentQuestion.id) ?? null
    : null;

  const scenarioDescription = currentQuestion
    ? SCENARIOS.find((s) => s.id === currentQuestion.scenario)?.description ?? ""
    : "";

  const isLastQuestion = session
    ? session.currentQuestionIndex === session.questions.length - 1
    : false;

  const value = useMemo<ExamContextValue>(
    () => ({
      session,
      answerMap,
      startExam,
      answerQuestion,
      goToQuestion,
      nextQuestion,
      enterReviewMode,
      resetExam,
      timeUp,
      currentQuestion,
      currentAnswer,
      scenarioDescription,
      isLastQuestion,
    }),
    [session, answerMap, startExam, answerQuestion, goToQuestion, nextQuestion, enterReviewMode, resetExam, timeUp, currentQuestion, currentAnswer, scenarioDescription, isLastQuestion]
  );

  return (
    <ExamContext value={value}>
      {children}
    </ExamContext>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
