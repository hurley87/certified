/**
 * Rebalances answer-letter distribution, trims verbose correct options,
 * and expands short distractors with substantive (non-filler) text.
 * Run: npx tsx scripts/transform-banks.mts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import type { AnswerLabel, Question } from "../src/data/questions.ts";
import stdPkg from "../src/data/questions.ts";
import hardPkg from "../src/data/hard-questions.ts";

const questions = stdPkg.questions;
const hardQuestions = hardPkg.hardQuestions;

const ORDER: AnswerLabel[] = ["A", "B", "C", "D"];

const EXPANSIONS = [
  "It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns.",
  "It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents.",
  "It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe.",
  "It assumes stable latency and clean success paths, which rarely holds for production agent graphs.",
];

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Seeded shuffle (deterministic). */
function shuffleInPlace<T>(arr: T[], seed: number): void {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function letterTargets(n: number, seed: number): AnswerLabel[] {
  const base = Math.floor(n / 4);
  const rem = n % 4;
  const arr: AnswerLabel[] = [];
  for (let i = 0; i < 4; i++) {
    const count = base + (i < rem ? 1 : 0);
    for (let k = 0; k < count; k++) arr.push(ORDER[i]);
  }
  shuffleInPlace(arr, seed);
  return arr;
}

function reorderQuestion(q: Question, targetLetter: AnswerLabel): Question {
  const byLabel = Object.fromEntries(q.options.map((o) => [o.label, o.text])) as Record<
    AnswerLabel,
    string
  >;
  const texts = ORDER.map((l) => byLabel[l]);
  const from = ORDER.indexOf(q.correctAnswer);
  const to = ORDER.indexOf(targetLetter);
  const newTexts = [...texts];
  [newTexts[from], newTexts[to]] = [newTexts[to], newTexts[from]];
  return {
    ...q,
    options: ORDER.map((label, i) => ({ label, text: newTexts[i] })),
    correctAnswer: targetLetter,
  };
}

/** Lengthen distractors only — never trim correct text (trimming broke quoted API tokens). */
function balanceQuestion(q: Question, seed: number): Question {
  const correctOpt = q.options.find((o) => o.label === q.correctAnswer)!;
  const correctLen = correctOpt.text.length;
  const maxWrong = Math.max(
    ...q.options.filter((o) => o.label !== q.correctAnswer).map((o) => o.text.length)
  );
  const target = Math.max(correctLen, maxWrong) * 0.92;

  const newOptions = q.options.map((o, idx) => {
    if (o.label === q.correctAnswer) {
      return o;
    }
    let t = o.text;
    let guard = 0;
    while (t.length < target && guard < 4) {
      const add = EXPANSIONS[(seed + idx + q.id + guard * 7) % EXPANSIONS.length];
      t = t.endsWith(".") ? `${t} ${add}` : `${t}. ${add}`;
      guard++;
    }
    return { ...o, text: t };
  });

  return { ...q, options: newOptions };
}

/** Fix stem/option mismatch: all options describe risks. Correct stays the primary risk. */
function fixQuestion2(q: Question): Question {
  if (q.id !== 2) return q;
  return {
    ...q,
    question:
      "In a multi-agent research system, the coordinator agent calls a web search subagent, which returns results. The coordinator then needs to decide whether to call the document analysis subagent or synthesize the findings. A junior developer proposes terminating the coordinator's loop after exactly 3 iterations to prevent runaway costs. What is the primary risk of this approach?",
    options: [
      {
        label: "A",
        text: "Legitimate research may require more than three iterations, so the cap can abort valid work while still consuming steps on shallow tasks.",
      },
      {
        label: "B",
        text: "Lowering temperature or adding 'finish quickly' instructions does not remove the hard cap; the coordinator can still be cut off mid-investigation.",
      },
      {
        label: "C",
        text: "Collapsing the workflow into a single long prompt removes structured tool feedback and often hits context limits before research completes.",
      },
      {
        label: "D",
        text: "Termination is tied to a fixed iteration count instead of task completion signals, so valid multi-step research can be truncated while simple tasks still waste iterations.",
      },
    ],
    correctAnswer: "D",
    explanation:
      "The core risk is anchoring correctness to an arbitrary iteration count: some tasks need more than three steps, while trivial ones may finish sooner. Model-driven termination (e.g., stop reasons) plus separate safety limits is the robust pattern. The answer that ties termination to a fixed iteration count instead of task completion states the primary structural flaw; the others describe related but narrower issues.",
  };
}

/** Single focus: diagnosis only. */
function fixQuestion130(q: Question): Question {
  if (q.id !== 130) return q;
  return {
    ...q,
    question:
      "A support agent uses multiple tools (get_customer, lookup_order, process_refund) during a long conversation. The developer notices that tool results are accumulating and consuming a disproportionate amount of the context window. What is the most accurate description of what is happening?",
    options: [
      {
        label: "A",
        text: "Tool results are being duplicated in storage and should be deduplicated at the persistence layer.",
      },
      {
        label: "B",
        text: "Each tool call appends its full payload to the thread, so token usage grows quickly even when only small slices of those payloads matter for the next decision.",
      },
      {
        label: "C",
        text: "The tools are misconfigured and always return oversized JSON blobs regardless of query parameters.",
      },
      {
        label: "D",
        text: "The model is automatically summarizing tool output incorrectly, doubling the effective token count.",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Tool results are copied into the conversation verbatim; over many turns the cumulative size dominates the budget. The usual mitigation is to extract and retain only fields needed for the next steps. Duplication (A) is not the default failure mode. Oversized APIs (C) or bad summarization (D) are less universal explanations than append-only context growth.",
  };
}

/** Single focus: root cause only. */
function fixQuestion95(q: Question): Question {
  if (q.id !== 95) return q;
  return {
    ...q,
    question:
      "During CI, a PR review agent sometimes references code that does not exist in the current branch, yet resembles another team's recent PR. What is the most likely root cause?",
    options: [
      {
        label: "A",
        text: "The runner is over-provisioned with memory, causing non-deterministic completions.",
      },
      {
        label: "B",
        text: "Session or instance context is shared across reviews, so prior PR conversations or tool outputs leak into the current run.",
      },
      {
        label: "C",
        text: "The model is inventing code purely from pretraining without any repository input.",
      },
      {
        label: "D",
        text: "Branches are never checked out, so the agent always reads an empty tree.",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Cross-PR leakage almost always comes from reused sessions, cached transcripts, or shared runner state—not from generic hallucination. Isolating one session per review prevents this. Memory sizing (A), generic hallucination (C), and missing checkout (D) are weaker fits for 'looks like another PR'.",
  };
}

/** Stem asks what is wrong; options describe flaws. */
function fixQuestion169(q: Question): Question {
  if (q.id !== 169) return q;
  return {
    ...q,
    question:
      "A multi-agent research system produces a report on renewable energy. The web search subagent found data on solar, wind, and biomass, but the document analysis subagent failed to access a journal database for geothermal sources. The synthesis covers solar, wind, and biomass and never mentions geothermal or the access failure. What is the main flaw in this synthesis behavior?",
    options: [
      {
        label: "A",
        text: "Nothing is wrong; the report should only discuss sources that returned data.",
      },
      {
        label: "B",
        text: "It omits coverage of geothermal without stating that the gap exists because a source could not be reached, which misrepresents completeness.",
      },
      {
        label: "C",
        text: "The entire report must be discarded whenever any subagent errors.",
      },
      {
        label: "D",
        text: "The model should fabricate geothermal statistics from parametric knowledge to keep sections balanced.",
      },
    ],
    correctAnswer: "B",
    explanation:
      "Synthesis should surface known coverage gaps (e.g., inaccessible journal DB) instead of silent omission, which reads as authoritative completeness. Partial results are still valuable when limitations are explicit. Discarding everything (C) or inventing data (D) are worse outcomes.",
  };
}

function applyContentFixes(q: Question): Question {
  let x = fixQuestion2(q);
  x = fixQuestion130(x);
  x = fixQuestion95(x);
  x = fixQuestion169(x);
  return x;
}

/** Replace "Option X" with a short quote of that option's text (shuffle-safe). */
function sanitizeExplanation(q: Question): Question {
  let e = q.explanation;
  const snippet = (text: string): string => {
    const t = text.trim();
    const cut = t.indexOf(". ");
    const first = cut === -1 ? t : t.slice(0, cut);
    return first.length <= 95 ? first : `${first.slice(0, 92)}…`;
  };
  const labels: AnswerLabel[] = ["A", "B", "C", "D"];
  for (const L of labels) {
    const o = q.options.find((x) => x.label === L);
    if (!o) continue;
    const sn = snippet(o.text);
    const quoted = `"${sn}"`;
    e = e.replaceAll(`Option ${L}'s`, `${quoted}'s`);
    e = e.replaceAll(`Option ${L}.`, `${quoted}.`);
    e = e.replaceAll(`Option ${L},`, `${quoted},`);
    e = e.replaceAll(`Option ${L})`, `${quoted})`);
    e = e.replaceAll(`Option ${L} `, `${quoted} `);
    e = e.replaceAll(`Option ${L}'`, `${quoted}'`);
  }
  return { ...q, explanation: e };
}

function transformBank(bank: Question[], seed: number): Question[] {
  const targets = letterTargets(bank.length, seed);
  return bank.map((q, i) => {
    const fixed = applyContentFixes(q);
    const balanced = balanceQuestion(fixed, seed + i * 17);
    const reordered = reorderQuestion(balanced, targets[i]!);
    return sanitizeExplanation(reordered);
  });
}

const DOMAIN_HEADER: Record<number, string> = {
  1: "  // ============================================================\n  // DOMAIN 1: Agentic Architecture & Orchestration (40 questions)\n  // ============================================================\n",
  2: "  // ============================================================\n  // DOMAIN 2: Tool Design & MCP Integration (27 questions)\n  // ============================================================\n",
  3: "  // ============================================================\n  // DOMAIN 3: Claude Code Configuration & Workflows\n  // DOMAIN 4: Prompt Engineering & Structured Output\n  // DOMAIN 5: Context Management & Reliability\n  // ============================================================\n",
};

function serializeStandardQuestion(q: Question, isLast: boolean): string {
  const opts = q.options
    .map((o) => `      { label: "${o.label}", text: "${esc(o.text)}" }`)
    .join(",\n");
  return `  {
    id: ${q.id},
    domain: ${q.domain},
    scenario: ${q.scenario},
    taskStatement: "${esc(q.taskStatement)}",
    question: "${esc(q.question)}",
    options: [
${opts}
    ],
    correctAnswer: "${q.correctAnswer}",
    explanation: "${esc(q.explanation)}"
  }${isLast ? "" : ","}`;
}

function writeStandardFile(newQuestions: Question[]): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const header = readFileSync(join(root, "src/data/questions.ts"), "utf8").split(
    "export const questions: Question[] = ["
  )[0];
  const parts: string[] = [];
  let lastDomain = 0;
  for (let i = 0; i < newQuestions.length; i++) {
    const q = newQuestions[i]!;
    if (q.domain !== lastDomain) {
      const h = DOMAIN_HEADER[q.domain];
      if (h) parts.push(h);
      lastDomain = q.domain;
    }
    parts.push(serializeStandardQuestion(q, i === newQuestions.length - 1));
  }
  const body = `export const questions: Question[] = [\n${parts.join("\n")}\n];\n`;
  writeFileSync(join(root, "src/data/questions.ts"), header + body, "utf8");
}

function serializeHardQuestion(q: Question, isLast: boolean): string {
  const opts = q.options
    .map(
      (o) => `      {
        "label": "${o.label}",
        "text": "${esc(o.text)}"
      }`
    )
    .join(",\n");
  return `  {
    "id": ${q.id},
    "domain": ${q.domain},
    "scenario": ${q.scenario},
    "taskStatement": "${esc(q.taskStatement)}",
    "question": "${esc(q.question)}",
    "options": [
${opts}
    ],
    "correctAnswer": "${q.correctAnswer}",
    "explanation": "${esc(q.explanation)}"
  }${isLast ? "" : ","}`;
}

function writeHardFile(newHard: Question[]): void {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const preamble = `import type { Question } from "./questions";

/** Curated harder pool: distinct stems, closer distractors, ids 174-233 (do not overlap standard bank). */
`;
  const items = newHard.map((q, i) => serializeHardQuestion(q, i === newHard.length - 1)).join("\n");
  const body = `export const hardQuestions: Question[] = [\n${items}\n];\n`;
  writeFileSync(join(root, "src/data/hard-questions.ts"), preamble + body, "utf8");
}

const newStd = transformBank(questions, 42_001);
const newHard = transformBank(hardQuestions, 42_002);

writeStandardFile(newStd);
writeHardFile(newHard);
console.log("Wrote transformed banks:", newStd.length, newHard.length);
