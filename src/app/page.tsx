"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { DOMAINS, EXAM_TIME_LIMITS } from "@/lib/constants";
import { questions } from "@/data/questions";
import { hardQuestions } from "@/data/hard-questions";
import type { ExamMode } from "@/lib/types";

function buildQuestionCountOptions(poolSize: number): { label: string; value: number }[] {
  const opts = [15, 30, 60]
    .filter((n) => n <= poolSize)
    .map((n) => ({ label: String(n), value: n }));
  opts.push({ label: "All", value: poolSize });
  return opts;
}

function formatTimeLimit(questionCount: number): string {
  const ms = EXAM_TIME_LIMITS[questionCount];
  if (!ms) return "No time limit";
  const minutes = ms / 60_000;
  if (minutes >= 60) return `${minutes / 60} hour${minutes > 60 ? "s" : ""}`;
  return `${minutes} minutes`;
}

export default function Home() {
  const [examMode, setExamMode] = useState<ExamMode>("standard");
  const poolSize = examMode === "hard" ? hardQuestions.length : questions.length;
  const questionCountOptions = useMemo(() => buildQuestionCountOptions(poolSize), [poolSize]);
  const [questionCount, setQuestionCount] = useState(30);
  const resolvedQuestionCount = useMemo(() => {
    if (questionCountOptions.some((o) => o.value === questionCount)) {
      return questionCount;
    }
    return (
      questionCountOptions.find((o) => o.value === 30)?.value ??
      questionCountOptions[0]?.value ??
      30
    );
  }, [questionCount, questionCountOptions]);
  const { startExam } = useExam();
  const router = useRouter();

  function handleStart() {
    startExam({ questionCount: resolvedQuestionCount, mode: examMode });
    router.push("/exam");
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-3xl px-4 py-12 sm:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            CCA-F Practice Exam
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Claude Certified Architect - Foundations
          </p>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
            Test your knowledge across 5 domains covering Claude Code, the Agent SDK,
            the Claude API, and Model Context Protocol. Each exam draws from a bank of {poolSize}{" "}
            questions
            {examMode === "hard" ? " (hard mode)" : ""} with randomized answer order.
          </p>
        </div>

        <details className="mb-10 overflow-hidden rounded-lg border border-zinc-200 bg-white open:[&_summary_svg]:rotate-180 dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60 [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Exam Domains
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </summary>
          <div className="space-y-3 border-t border-zinc-200 px-4 pb-4 pt-3 dark:border-zinc-800">
            {DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50"
              >
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {domain.name}
                </span>
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
                  {Math.round(domain.weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </details>

        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Difficulty
          </h2>
          <div className="flex gap-2 mb-6">
            {(
              [
                { label: "Standard", value: "standard" as const },
                { label: "Hard", value: "hard" as const },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExamMode(opt.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  examMode === opt.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Questions
          </h2>
          <div className="flex gap-2">
            {questionCountOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setQuestionCount(opt.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  resolvedQuestionCount === opt.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {formatTimeLimit(resolvedQuestionCount)}
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full rounded-lg bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Start Exam
        </button>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cheat-sheet"
            className="block w-full rounded-lg border border-zinc-200 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 sm:flex-1"
          >
            Cheat Sheet
          </Link>
          <Link
            href="/notes"
            className="block w-full rounded-lg border border-zinc-200 bg-white px-6 py-3 text-center text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 sm:flex-1"
          >
            Study Notes
          </Link>
        </div>
      </main>
    </div>
  );
}
