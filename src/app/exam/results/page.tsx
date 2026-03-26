"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { SCENARIO_NAMES } from "@/data/questions";

export default function ResultsPage() {
  const router = useRouter();
  const { session, answerMap, resetExam, enterReviewMode } = useExam();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!session || session.answers.length === 0) {
      router.replace("/");
    }
  }, [session, router]);

  const totalCorrect = useMemo(
    () => session?.answers.filter((a) => a.isCorrect).length ?? 0,
    [session?.answers]
  );

  const missedQuestions = useMemo(
    () =>
      session?.questions.filter((q) => {
        const answer = answerMap.get(q.id);
        return answer && !answer.isCorrect;
      }) ?? [],
    [session?.questions, answerMap]
  );

  if (!session || session.domainResults.length === 0) return null;

  const { scaledScore, passed, rawScore, domainResults, questions, answers } = session;

  function toggleExpanded(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function scoreColor(pct: number) {
    if (pct >= 72) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  function scoreTextColor(pct: number) {
    if (pct >= 72) return "text-green-600 dark:text-green-400";
    if (pct >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-3xl px-4 py-12 sm:px-8">
        {/* Score hero */}
        <div className="text-center mb-10">
          <div className="text-6xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
            {scaledScore}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            out of 1000
          </div>
          <div
            className={`inline-block mt-3 rounded-full px-4 py-1 text-sm font-bold ${
              passed
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {passed ? "PASS" : "FAIL"}
          </div>
          <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            {totalCorrect} of {questions.length} correct ({Math.round(rawScore)}%)
          </div>
        </div>

        {/* Domain breakdown */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Domain Breakdown
          </h2>
          <div className="space-y-3">
            {domainResults.map((dr) => {
              const pct = Math.round(dr.percentage);
              return (
                <div
                  key={dr.domain}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {dr.domainName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {dr.correctAnswers}/{dr.totalQuestions}
                      </span>
                      <span className={`text-sm font-semibold tabular-nums ${scoreTextColor(pct)}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-1.5 rounded-full transition-all ${scoreColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Missed questions */}
        {missedQuestions.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Missed Questions ({missedQuestions.length})
            </h2>
            <div className="space-y-2">
              {missedQuestions.map((q) => {
                const answer = answerMap.get(q.id);
                const isExpanded = expandedIds.has(q.id);
                const selectedOption = q.options.find(
                  (o) => o.label === answer?.selectedAnswer
                );
                const correctOption = q.options.find(
                  (o) => o.label === q.correctAnswer
                );

                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(q.id)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                          {SCENARIO_NAMES[q.scenario]}
                        </span>
                        <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate">
                          {q.question}
                        </p>
                      </div>
                      <span className="ml-2 text-zinc-400 text-xs">
                        {isExpanded ? "\u25B2" : "\u25BC"}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                            {"\u2717"}
                          </span>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            <span className="font-medium">Your answer ({answer?.selectedAnswer}):</span>{" "}
                            {selectedOption?.text}
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                            {"\u2713"}
                          </span>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <span className="font-medium">Correct answer ({q.correctAnswer}):</span>{" "}
                            {correctOption?.text}
                          </p>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetExam();
              router.push("/");
            }}
            className="flex-1 rounded-lg border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Retake Exam
          </button>
          <button
            onClick={() => {
              enterReviewMode();
              router.push("/exam");
            }}
            className="flex-1 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Review All Questions
          </button>
        </div>
      </div>
    </div>
  );
}
