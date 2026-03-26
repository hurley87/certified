"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { DOMAINS } from "@/lib/constants";
import { questions } from "@/data/questions";

const QUESTION_COUNTS = [
  { label: "15", value: 15 },
  { label: "30", value: 30 },
  { label: "All", value: questions.length },
];

export default function Home() {
  const [questionCount, setQuestionCount] = useState(30);
  const { startExam } = useExam();
  const router = useRouter();

  function handleStart() {
    startExam(questionCount);
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
            the Claude API, and Model Context Protocol. Each exam draws from a bank of {questions.length} questions
            with randomized answer order.
          </p>
        </div>

        <div className="space-y-3 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Exam Domains
          </h2>
          {DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
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

        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
            Questions
          </h2>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => setQuestionCount(opt.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  questionCount === opt.value
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full rounded-lg bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Start Exam
        </button>
      </main>
    </div>
  );
}
