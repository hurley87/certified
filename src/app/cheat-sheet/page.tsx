import Link from "next/link";
import { DOMAINS } from "@/lib/constants";

const DOMAIN_FACTS: Record<number, string[]> = {
  1: [
    'Agentic loop: check stop_reason field — "tool_use" = continue, "end_turn" = stop',
    "Anti-patterns: parsing NL for termination, arbitrary iteration caps, checking text content type",
    "Hub-and-spoke: ALL communication flows through coordinator — subagents never talk directly",
    "Subagents do NOT inherit coordinator context — every piece of info must be passed explicitly",
    "Task tool must be in allowedTools for an agent to spawn subagents",
    "Parallel spawning: emit multiple Task calls in a single coordinator response",
    "fork_session: independent branches from a shared analysis baseline",
    "Enforcement spectrum: programmatic hooks for high-stakes (financial, security, compliance) — prompts for low-stakes",
    "Handoff summary must be self-contained — human agent has NO access to conversation transcript",
    "PostToolUse hooks: normalize data after tool execution (e.g., date formats, phone numbers)",
    "Pre-execution hooks: block policy-violating tool calls BEFORE they execute",
    "Fixed pipeline (prompt chaining): predictable, structured tasks with clear dependencies",
    "Dynamic adaptive decomposition: open-ended investigation tasks that adapt to findings",
    "Attention dilution fix: per-file local analysis + separate cross-file integration pass",
    "--resume preserves full conversation history; fresh start + summary injection for stale context",
    "Model-driven decisions for flexibility; programmatic enforcement for critical business logic",
    "Coordinator prompts should specify research goals and quality criteria, NOT step-by-step procedures",
  ],
  2: [
    "Tool descriptions are THE primary mechanism for LLM tool selection — not tool names",
    "Good descriptions include: purpose, input formats, example queries, edge cases, boundaries vs similar tools",
    "Fix misrouting with better descriptions FIRST — not routing classifiers, not few-shot, not consolidation",
    "System prompt keyword-sensitive instructions can create unintended tool associations — review for conflicts",
    "4 error categories: transient (retryable), validation (fix input & retry), business (NOT retryable), permission (escalate)",
    "Critical distinction: access failure (couldn't reach source = consider retry) vs valid empty result (no matches = don't retry)",
    "MCP structured errors: isError flag + errorCategory + isRetryable boolean + human-readable message",
    "Optimal: 4-5 tools per agent, scoped to its role — 18+ tools degrades selection reliability",
    'tool_choice: "auto" (default) | "any" (must call a tool) | {type:"tool",name:"X"} (force specific tool)',
    ".mcp.json = project-level (version-controlled, shared) | ~/.claude.json = user-level (personal, NOT shared)",
    "${VARIABLE_NAME} syntax in .mcp.json for credentials — keeps secrets out of version control",
    "MCP resources = content catalogs (browsable data) | MCP tools = actions | MCP prompts = templates",
    "Use community MCP servers first — only build custom for team-specific workflows",
    "Grep = search file CONTENTS | Glob = search file PATHS by naming patterns",
    "Edit fails on non-unique match → add more surrounding context or fall back to Read + Write",
    "Incremental exploration: Grep for entry points → Read to trace flows — do NOT read all files upfront",
    "MCP inspector/dev workflow: test tool schemas and outputs directly before production integration",
  ],
  3: [
    "CLAUDE.md hierarchy: ~/.claude/CLAUDE.md (personal) → project root (shared) → directory-level (specific)",
    "All CLAUDE.md levels accumulate — they don't override each other",
    "@import syntax to reference separate modular files from main CLAUDE.md",
    ".claude/commands/ = project-level commands (shared via git with team)",
    "~/.claude/commands/ = personal commands (not shared, not version-controlled)",
    "Skills priority order: Enterprise > Personal > Project > Plugins",
    "SKILL.md frontmatter: context: fork for isolation, allowed-tools: [...] for tool restrictions",
    ".claude/rules/ with YAML paths field + glob patterns for file-type-specific rules (e.g., **/*.test.tsx)",
    "Path-specific rules load ONLY when editing files matching the glob pattern",
    "Plan mode: multi-file changes, multiple valid approaches, coordination needed",
    "Direct execution: simple, well-scoped changes (e.g., rename a variable)",
    "Explore subagent: verbose codebase discovery without making changes",
    "Concrete input/output examples > prose descriptions for prompt refinement",
    "Interview pattern: Claude asks clarifying questions before implementing",
    "-p (--print) flag = non-interactive mode for CI/CD pipelines",
    "--output-format json + --json-schema = structured CI output matching specific schema",
    "Session isolation: separate Claude Code instances per CI task — prevents context leakage",
    "PreToolUse hooks = blocking (prevent writes) | PostToolUse hooks = feedback (formatting checks)",
    "SDK least-privilege: default to read-only, explicitly allow write tools only when needed",
  ],
  4: [
    'Explicit criteria obliterate vague instructions — "flag when behavior contradicts docs" not "be conservative"',
    "High false positives in one category destroy trust in ALL categories",
    "Fix: temporarily disable high-FP categories while improving prompts — restores trust while you iterate",
    "Severity calibration: use concrete CODE EXAMPLES for each level, not prose descriptions",
    "Few-shot examples (2-4) = most effective technique for consistency, NOT more instructions",
    "Few-shot enables generalization to novel patterns, not just pattern matching",
    "Few-shot with null/missing fields teaches model to output null rather than hallucinate",
    "tool_use + JSON schema = eliminates syntax errors entirely (but NOT semantic errors)",
    "Nullable/optional fields prevent fabrication when source lacks the information",
    '"unclear" enum value for ambiguous cases | "other" + freeform detail string for extensibility',
    "Validation-retry: send original document + failed extraction + specific validation error",
    "Retries effective for: format mismatches, structural errors | INEFFECTIVE for: missing information",
    "detected_pattern field: track what triggers findings, analyze dismissal patterns, improve prompts",
    "Self-correction: calculated_total (sum of line items) vs stated_total — flag discrepancies",
    "Message Batches API: 50% cost savings, up to 24h processing, NO multi-turn tool calling, NO latency SLA",
    "custom_id field for correlating batch request/response pairs",
    "Sync API = blocking workflows (pre-merge checks) | Batch API = latency-tolerant (nightly reports)",
    "Self-review is limited — model retains reasoning bias → use independent review instances",
    "Multi-pass review: per-file local analysis + cross-file integration pass",
    "Format normalization rules in prompts alongside strict schemas for consistent output",
  ],
  5: [
    'Progressive summarization loses numbers/dates → persistent "case facts" block, never summarize it',
    '"Lost in the middle": models attend to beginning + end — findings in the middle get missed',
    "Fix: place key findings summaries at the BEGINNING, use explicit section headers",
    "Trim tool results to relevant fields BEFORE appending to context — prevents token exhaustion",
    "Upstream agent optimization: return structured data (facts, citations, scores) not verbose reasoning",
    "3 valid escalation triggers: explicit human request, policy gap, inability to make progress",
    "2 unreliable triggers: sentiment-based escalation, self-reported confidence scores",
    'Explicit "I want a human" → escalate IMMEDIATELY, no investigation first',
    "Frustrated but straightforward issue → acknowledge frustration and resolve, don't auto-escalate",
    "Ambiguous customer match → ask for additional identifiers, do NOT select by heuristics",
    "Error anti-patterns: silent suppression (hides failures), workflow termination (discards partial results)",
    "Access failure (retry) vs valid empty result (don't retry) — confusing these breaks recovery logic",
    'Coverage annotations: "Section limited due to unavailable journal access" > silently omitting',
    "Context degradation in long sessions: scratchpad files, subagent delegation, summary injection, /compact",
    "Crash recovery: structured state persistence to a manifest file — resume by loading it",
    "97% aggregate accuracy can hide 40% error rate on specific document types → stratify by type",
    "Calibrate confidence scores using labelled validation sets (ground truth data)",
    "Claim-source mappings: claim + source URL + document name + excerpt + publication date",
    "Conflicting sources: annotate BOTH with source attribution — let consumer decide, don't pick one",
    "Temporal awareness: require publication dates — different dates explain different numbers, not contradictions",
    "Content-appropriate rendering: tables for financial data, prose for news, structured lists for technical",
    "Prompt caching: keep stable prefix unchanged across requests, put dynamic content after the cached prefix",
  ],
};

export default function CheatSheet() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-3xl px-4 py-12 sm:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            CCA-F Cheat Sheet
          </h1>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400">
            Key facts to memorize for the exam
          </p>
        </div>

        <div className="space-y-8">
          {DOMAINS.map((domain) => {
            const facts = DOMAIN_FACTS[domain.id] ?? [];
            return (
              <section key={domain.id}>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3 sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-2 z-10">
                  Domain {domain.id} ({Math.round(domain.weight * 100)}%) &mdash; {domain.name}
                </h2>
                <ul className="space-y-2">
                  {facts.map((fact, i) => (
                    <li
                      key={i}
                      className="flex gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <span className="shrink-0 mt-0.5 text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums w-5 text-right">
                        {i + 1}
                      </span>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {fact}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
