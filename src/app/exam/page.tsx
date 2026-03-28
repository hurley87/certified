"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { SCENARIO_NAMES } from "@/data/questions";

function formatTime(ms: number): string {
  if (ms <= 0) return "0:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

export default function ExamPage() {
  const router = useRouter();
  const {
    session,
    answerMap,
    currentQuestion,
    currentAnswer,
    scenarioDescription,
    isLastQuestion,
    answerQuestion,
    nextQuestion,
    goToQuestion,
    timeUp,
  } = useExam();

  // Redirect to home if no active session
  useEffect(() => {
    if (!session) router.replace("/");
  }, [session, router]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!currentQuestion || !session) return;

      // Answer with A-D keys
      if (!currentAnswer) {
        const key = e.key.toUpperCase();
        if (["A", "B", "C", "D"].includes(key)) {
          answerQuestion(key as "A" | "B" | "C" | "D");
        }
      }

      // Navigate with Enter or ArrowRight after answering
      if (currentAnswer && (e.key === "Enter" || e.key === "ArrowRight")) {
        if (isLastQuestion) {
          router.push("/exam/results");
        } else {
          nextQuestion();
        }
      }

      // Navigate back with ArrowLeft
      if (e.key === "ArrowLeft" && session.currentQuestionIndex > 0) {
        goToQuestion(session.currentQuestionIndex - 1);
      }
    },
    [currentQuestion, currentAnswer, session, isLastQuestion, answerQuestion, nextQuestion, goToQuestion, router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Countdown timer
  const hasTimer = !!(session?.timeLimitMs && session?.startedAt);
  const [remainingMs, setRemainingMs] = useState(() => {
    if (session?.timeLimitMs && session?.startedAt) {
      return Math.max(0, session.timeLimitMs - (Date.now() - session.startedAt));
    }
    return 0;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeUpFired = useRef(false);

  useEffect(() => {
    if (!hasTimer || !session?.startedAt || !session?.timeLimitMs) return;

    const tick = () => {
      const remaining = Math.max(0, session.timeLimitMs! - (Date.now() - session.startedAt!));
      setRemainingMs(remaining);
      if (remaining <= 0 && !timeUpFired.current) {
        timeUpFired.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeUp();
        router.push("/exam/results");
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasTimer, session?.startedAt, session?.timeLimitMs, timeUp, router]);

  if (!session || !currentQuestion) return null;

  const progress = session.currentQuestionIndex + 1;
  const total = session.questions.length;
  const scenarioName = SCENARIO_NAMES[currentQuestion.scenario];
  const isAnswered = !!currentAnswer;
  const isReviewMode = session.reviewMode;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-3xl px-4 py-6 sm:px-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex flex-wrap items-center gap-2">
              Question {progress} of {total}
              {session.mode === "hard" && (
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200">
                  Hard mode
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              {hasTimer && !isReviewMode && (
                <span
                  className={`text-sm font-mono font-semibold tabular-nums ${
                    remainingMs <= 5 * 60 * 1000
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {formatTime(remainingMs)}
                </span>
              )}
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {scenarioName}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Scenario banner */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 mb-6 dark:bg-blue-950/30 dark:border-blue-900/50">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
            {scenarioName}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            {scenarioDescription}
          </p>
        </div>

        {/* Question */}
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed mb-6">
          {currentQuestion.question}
        </h2>

        {/* Answer options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => {
            const isSelected = currentAnswer?.selectedAnswer === option.label;
            const isCorrect = option.label === currentQuestion.correctAnswer;
            const showResult = isAnswered || isReviewMode;

            let cardClass =
              "w-full text-left rounded-lg border px-4 py-3 transition-all duration-150 ";

            if (!showResult) {
              cardClass +=
                "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500 dark:hover:bg-zinc-800 cursor-pointer";
            } else if (isCorrect) {
              cardClass +=
                "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950/40";
            } else if (isSelected) {
              cardClass +=
                "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950/40";
            } else {
              cardClass +=
                "border-zinc-100 bg-zinc-50 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50";
            }

            return (
              <button
                key={option.label}
                onClick={() => !isAnswered && !isReviewMode && answerQuestion(option.label)}
                disabled={isAnswered || isReviewMode}
                className={cardClass}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      showResult && isCorrect
                        ? "bg-green-500 text-white"
                        : showResult && isSelected && !isCorrect
                        ? "bg-red-500 text-white"
                        : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {showResult && isCorrect
                      ? "\u2713"
                      : showResult && isSelected && !isCorrect
                      ? "\u2717"
                      : option.label}
                  </span>
                  <span className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    {option.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation panel */}
        {(isAnswered || isReviewMode) && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 mb-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Explanation
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Next / View Results button */}
        {isAnswered && !isReviewMode && (
          <button
            onClick={() => {
              if (isLastQuestion) {
                router.push("/exam/results");
              } else {
                nextQuestion();
              }
            }}
            className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isLastQuestion ? "View Results" : "Next Question"}
          </button>
        )}

        {/* Review mode nav */}
        {isReviewMode && (
          <div className="flex gap-3">
            {session.currentQuestionIndex > 0 && (
              <button
                onClick={() => goToQuestion(session.currentQuestionIndex - 1)}
                className="flex-1 rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Previous
              </button>
            )}
            {!isLastQuestion && (
              <button
                onClick={() => goToQuestion(session.currentQuestionIndex + 1)}
                className="flex-1 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Question nav dots */}
        <div className="mt-8 flex flex-wrap gap-1.5 justify-center">
          {session.questions.map((q, i) => {
            const answer = answerMap.get(q.id);
            const isCurrent = i === session.currentQuestionIndex;

            let dotClass = "w-7 h-7 rounded-full text-xs font-medium transition-colors flex items-center justify-center ";
            if (isCurrent) {
              dotClass += "ring-2 ring-zinc-900 dark:ring-zinc-100 ";
            }
            if (answer?.isCorrect) {
              dotClass += "bg-green-500 text-white";
            } else if (answer && !answer.isCorrect) {
              dotClass += "bg-red-500 text-white";
            } else {
              dotClass += "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";
            }

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(i)}
                className={dotClass}
                aria-label={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
