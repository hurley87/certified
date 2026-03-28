import type { Question } from "./questions";

/** Curated harder pool: distinct stems, closer distractors, ids 174-233 (do not overlap standard bank). */
export const hardQuestions: Question[] = [
  {
    "id": 174,
    "domain": 1,
    "scenario": 3,
    "taskStatement": "H1.1: Coordinator concurrency",
    "question": "Two subagents finish at different times and their tool_result blocks arrive interleaved with another subagent still running. The coordinator must compose the next user-visible update. What is the most reliable rule?",
    "options": [
      {
        "label": "A",
        "text": "Buffer completed subagent outputs, track which tool_use ids are satisfied, and only synthesize when the planned set for this round is complete or a timeout policy fires."
      },
      {
        "label": "B",
        "text": "Emit partial synthesis as soon as any subagent returns, ignoring pending runs."
      },
      {
        "label": "C",
        "text": "Reorder messages by wall-clock receive time and treat that order as causal truth. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "D",
        "text": "Strip tool_result content to titles only until all subagents finish to save tokens. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      }
    ],
    "correctAnswer": "A",
    "explanation": "Gating synthesis on completed tool_use pairs and explicit round completion preserves causal correctness; partial updates misrepresent in-flight work. Wall-clock receive order is not semantic ordering. Stripping tool evidence to titles invites unfounded claims."
  },
  {
    "id": 175,
    "domain": 1,
    "scenario": 1,
    "taskStatement": "H1.2: Loop termination under mixed modalities",
    "question": "An agent alternates between tool_use and end_turn in the same session. A dashboard shows stop_reason flapping between values when the model briefly outputs text-only end_turn then re-enters tool_use on retry. What should drive the outer loop?",
    "options": [
      {
        "label": "A",
        "text": "Use the API stop_reason on the latest response plus your own state machine: continue while tool execution is pending or the model requests tools; exit on end_turn with no pending tool work."
      },
      {
        "label": "B",
        "text": "Terminate whenever any end_turn appears, even if a retry reopens tool use. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      },
      {
        "label": "C",
        "text": "Always run exactly N turns regardless of stop_reason to stabilize behavior. This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness."
      },
      {
        "label": "D",
        "text": "Prefer client-side parsing of assistant prose like 'done' over stop_reason. Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      }
    ],
    "correctAnswer": "A",
    "explanation": "Retries and UI noise can surface misleading intermediate states. The loop should reconcile API signals with explicit pending-tool state. Fixed N ignores task complexity. Natural-language 'done' is brittle compared to structured stop reasons plus bookkeeping."
  },
  {
    "id": 176,
    "domain": 1,
    "scenario": 4,
    "taskStatement": "H1.3: Exploration vs exploitation",
    "question": "A codebase agent keeps opening the same three files because they rank highly in search, missing the module that actually defines the bug. Which change best fixes the search strategy without freezing exploration?",
    "options": [
      {
        "label": "A",
        "text": "Cap total file reads at five for the whole task."
      },
      {
        "label": "B",
        "text": "Disable ranking and read files in alphabetical order. This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness."
      },
      {
        "label": "C",
        "text": "Maintain a visited-path set and deprioritize repeats unless new evidence references them; widen query terms when no new symbols appear after two rounds."
      },
      {
        "label": "D",
        "text": "Ask the user which file contains the bug before any search. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      }
    ],
    "correctAnswer": "C",
    "explanation": "Retrieval loops need memory of what was already inspected plus widening queries when exploration stalls; that escapes local optima without forbidding justified revisits. Hard caps can truncate legitimate deep dives. Alphabetical walks ignore relevance. Forcing the human to name the file undermines autonomous search."
  },
  {
    "id": 177,
    "domain": 1,
    "scenario": 2,
    "taskStatement": "H1.4: Delegation boundaries",
    "question": "You split planning and coding into two agents with separate system prompts. Plans often omit edge cases the coder discovers, causing churn. What boundary adjustment reduces rework most?",
    "options": [
      {
        "label": "A",
        "text": "Merge into one monolithic agent with a longer system prompt."
      },
      {
        "label": "B",
        "text": "Have the planner write code directly and remove the coder."
      },
      {
        "label": "C",
        "text": "Forbid the coder from editing the plan; only the planner may update it."
      },
      {
        "label": "D",
        "text": "Require the planner to output explicit invariants, failure modes, and test hooks; the coder must cite which invariant each change satisfies."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Shared invariants, failure modes, and test hooks create an explicit contract between planner and implementer, reducing silent mismatch. Monolithic merges or removing separation do not fix the missing interface. Freezing the plan blocks legitimate updates when facts change."
  },
  {
    "id": 178,
    "domain": 1,
    "scenario": 5,
    "taskStatement": "H1.5: CI agent safety",
    "question": "A CI agent comments on PRs and sometimes suggests deleting test files when coverage fails. You want fewer destructive suggestions without blocking useful refactors. What guardrail fits best?",
    "options": [
      {
        "label": "A",
        "text": "Disable the agent whenever coverage drops. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      },
      {
        "label": "B",
        "text": "Post the raw model output without diff context so reviewers skim faster. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "C",
        "text": "Tell the model 'never change tests' in the system prompt. Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain."
      },
      {
        "label": "D",
        "text": "Add a policy layer: classify suggestions as destructive vs safe; require human confirmation or a second agent review for destructive file ops."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Classify destructive edits, require confirmation or secondary review, and keep safe refactors fast. Blanket test bans in prompts block legitimate changes. Shutting the agent off on coverage dips is blunt. Raw comments without diffs waste reviewer time."
  },
  {
    "id": 179,
    "domain": 1,
    "scenario": 6,
    "taskStatement": "H1.6: Multi-step extraction agents",
    "question": "An extraction agent chains OCR, table detection, and schema validation. OCR confidence is low on scanned footnotes. The pipeline currently drops fields below 0.85 confidence. Users complain about missing legal clauses. What is the best tradeoff?",
    "options": [
      {
        "label": "A",
        "text": "Lower the global threshold to 0.5 for every field."
      },
      {
        "label": "B",
        "text": "Replace OCR with the model guessing text from thumbnails. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "C",
        "text": "Skip validation entirely when OCR is uncertain."
      },
      {
        "label": "D",
        "text": "Keep strict thresholds for amounts and IDs; route low-confidence legal text to a secondary pass with layout-aware prompting and flag uncertain spans in output."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Tier thresholds by field risk: keep numeric or identity fields strict while sending fuzzy legal clauses through a second pass with uncertainty flags. Uniform lowering injects noise. Skipping validation or guessing from pixels erodes trust."
  },
  {
    "id": 180,
    "domain": 1,
    "scenario": 1,
    "taskStatement": "H1.7: Human escalation policy",
    "question": "Support tickets vary from password resets to billing disputes. Sentiment is noisy. You want consistent escalation. Which policy is least gameable and most fair?",
    "options": [
      {
        "label": "A",
        "text": "Escalate if frustration keywords appear twice."
      },
      {
        "label": "B",
        "text": "Randomly sample 10% for human review to calibrate quality. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      },
      {
        "label": "C",
        "text": "Escalate all tickets over 200 tokens.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "D",
        "text": "Escalate on explicit human request, policy exception, or repeated failed automated resolution after documented attempts; sentiment informs tone, not routing."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Route on explicit human intent, policy exceptions, and demonstrated automation failure—not token length or keyword tallies that are easy to game. Sentiment should adjust empathy, not ownership. Random sampling helps calibration, not primary fairness."
  },
  {
    "id": 181,
    "domain": 1,
    "scenario": 3,
    "taskStatement": "H1.8: Research synthesis integrity",
    "question": "Subagents return conflicting numbers for the same metric. Each cites a different source date and methodology footnote. The coordinator must produce one answer. What should it do first?",
    "options": [
      {
        "label": "A",
        "text": "Average the numbers and present a single figure."
      },
      {
        "label": "B",
        "text": "Pick the highest value to avoid underestimating impact. It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover."
      },
      {
        "label": "C",
        "text": "Preserve both figures with source metadata, date, and methodology notes; explain reconciliation rules or state that metrics are not directly comparable."
      },
      {
        "label": "D",
        "text": "Discard all numbers and answer qualitatively only. This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals."
      }
    ],
    "correctAnswer": "C",
    "explanation": "Conflicts often reflect incomparable definitions, not random error. Transparent provenance beats false precision. Averaging (A) or max-picking (B) invents authority. Dropping numbers entirely (D) may omit stakeholder-critical quantitative context."
  },
  {
    "id": 182,
    "domain": 1,
    "scenario": 4,
    "taskStatement": "H1.9: Long-horizon tasks",
    "question": "An agent working on a 40-step migration runs out of context halfway. Checkpoints exist on disk. What recovery pattern is sound?",
    "options": [
      {
        "label": "A",
        "text": "Restart from scratch with a shorter system prompt."
      },
      {
        "label": "B",
        "text": "Append the entire git history into the prompt for context. Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain."
      },
      {
        "label": "C",
        "text": "Ask the model to memorize completed steps without external state. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "D",
        "text": "Reload structured state (completed steps, file hashes, open risks) from checkpoint; continue with a concise plan diff, not full chat replay."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Reload structured checkpoints and plan deltas instead of replaying entire chats or git history. Cold restarts waste progress. Memorization without durable state drifts. Massive history dumps bury signal in noise."
  },
  {
    "id": 183,
    "domain": 1,
    "scenario": 2,
    "taskStatement": "H1.10: Tool preconditions",
    "question": "A deploy tool requires environment name, version, and approval token. The model sometimes calls it after only reading version from a README. What design tightens preconditions without blocking valid deploys?",
    "options": [
      {
        "label": "A",
        "text": "Remove the approval token to reduce friction."
      },
      {
        "label": "B",
        "text": "Retry the tool silently until it succeeds."
      },
      {
        "label": "C",
        "text": "Let the tool infer environment from branch name always. It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover."
      },
      {
        "label": "D",
        "text": "Implement server-side validation that rejects missing fields with structured errors; expose a cheap 'dry_run_validate' tool the model must pass first."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Validate arguments server-side with structured errors and offer an explicit dry-run tool so the model completes prerequisites. Dropping approvals weakens governance. Branch-name guessing fails for multi-environment repos. Silent retries mask bad prompts."
  },
  {
    "id": 184,
    "domain": 1,
    "scenario": 3,
    "taskStatement": "H1.11: Parallel tool fan-out",
    "question": "A coordinator fires three read-only searches in parallel. One subagent returns an error payload, two succeed. How should aggregation proceed?",
    "options": [
      {
        "label": "A",
        "text": "Ignore errors if any success exists.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "B",
        "text": "Replace the failed leg with a hallucinated plausible summary."
      },
      {
        "label": "C",
        "text": "Abort the entire synthesis on any single error."
      },
      {
        "label": "D",
        "text": "Treat partial failure as first-class: retry or substitute the failed leg, annotate coverage gaps in the merged result, never pretend the failed scope was checked."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Model partial failures explicitly: retry, substitute, and label coverage gaps so downstream reasoning knows what was verified. Ignoring failures implies false completeness. Hard aborts waste good data. Fabricated summaries are unacceptable."
  },
  {
    "id": 185,
    "domain": 1,
    "scenario": 1,
    "taskStatement": "H1.12: Cost vs quality",
    "question": "Ticket volume spikes nightly. Full reasoning on every message doubles cost with marginal accuracy gains on simple FAQs. What pattern balances SLA and spend?",
    "options": [
      {
        "label": "A",
        "text": "Route all traffic to the largest model.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "B",
        "text": "Answer FAQs with static macros only and disable the model."
      },
      {
        "label": "C",
        "text": "Truncate user messages to 200 characters nightly."
      },
      {
        "label": "D",
        "text": "Use a fast classifier or router to handle deterministic FAQs with templates; reserve deeper agents for ambiguous, high-risk, or high-value threads."
      }
    ],
    "correctAnswer": "D",
    "explanation": "Route cheap deterministic work to lightweight paths and reserve heavy agents for ambiguous or high-impact threads. Always using the largest model wastes budget. Truncating user text harms comprehension. Macro-only systems miss novel edge cases."
  },
  {
    "id": 186,
    "domain": 1,
    "scenario": 4,
    "taskStatement": "H1.13: Knowledge cutoffs",
    "question": "A coding agent suggests an API that existed in training data but was deprecated last month in your org's fork. What combination reduces stale guidance?",
    "options": [
      {
        "label": "A",
        "text": "Rely on the model's internal knowledge only. It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover."
      },
      {
        "label": "B",
        "text": "Inject current internal docs via RAG or MCP doc tools and require citations to local symbols for any API recommendation."
      },
      {
        "label": "C",
        "text": "Increase temperature so answers vary more."
      },
      {
        "label": "D",
        "text": "Disable linters so fewer warnings confuse the model. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Grounding to authoritative internal sources beats parametric memory for fast-moving APIs. Temperature (C) does not fix staleness. Disabling linters (D) removes useful guardrails."
  },
  {
    "id": 187,
    "domain": 1,
    "scenario": 5,
    "taskStatement": "H1.14: Review tone",
    "question": "CI comments feel abrasive and reviewers dismiss them. The content is often technically correct. What change most improves adoption?",
    "options": [
      {
        "label": "A",
        "text": "Remove positives and list only issues to save tokens."
      },
      {
        "label": "B",
        "text": "Tune prompts for collaborative tone, separate severity labels, and tie each note to reproducible evidence (file, line, log snippet). Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines."
      },
      {
        "label": "C",
        "text": "Post comments only on failing builds, never on passes."
      },
      {
        "label": "D",
        "text": "Use all caps for critical findings.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Trust combines tone, severity, and traceability. Evidence-linked feedback is actionable. All caps (D) and negativity-only (A) reduce engagement. Only failing builds (C) misses teachable green-path improvements."
  },
  {
    "id": 188,
    "domain": 1,
    "scenario": 6,
    "taskStatement": "H1.15: Schema drift",
    "question": "Downstream consumers expect optional fields, but the model starts omitting them entirely after a prompt tweak. Validation still passes. What is the best fix?",
    "options": [
      {
        "label": "A",
        "text": "Make all fields required in the JSON schema even if semantically optional. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      },
      {
        "label": "B",
        "text": "Document canonical 'empty' sentinels, add examples showing explicit nulls or empty arrays, and test golden outputs after prompt changes."
      },
      {
        "label": "C",
        "text": "Remove schema validation to avoid false positives."
      },
      {
        "label": "D",
        "text": "Ask users to mentally infer missing fields."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Optional in JSON Schema often means absent OR null; teams need explicit conventions. Examples and regression tests catch silent drift. Forcing required (A) may break backward compatibility. Dropping validation (C) hides errors."
  },
  {
    "id": 189,
    "domain": 1,
    "scenario": 3,
    "taskStatement": "H1.16: Debate and consensus",
    "question": "You run two critic agents that disagree on security impact. Majority vote would pick the wrong answer. What orchestration is better?",
    "options": [
      {
        "label": "A",
        "text": "Always take the first critic's answer for speed. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      },
      {
        "label": "B",
        "text": "Escalate disagreements to a structured rubric (threat model, blast radius, exploitability) and require each side to cite evidence; if still split, default to safer posture with explicit residual risk note."
      },
      {
        "label": "C",
        "text": "Average the severity scores numerically.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      },
      {
        "label": "D",
        "text": "Ignore critics when they disagree.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Security disagreements need explicit criteria, not voting theater. Safer defaults with documented risk beat arbitrary tie-breaks. First answer (A) and ignoring splits (D) are brittle. Averaging severities (C) is meaningless without calibrated scales."
  },
  {
    "id": 190,
    "domain": 2,
    "scenario": 1,
    "taskStatement": "H2.1: Tool contracts",
    "question": "An MCP tool description promises idempotency but the backing HTTP API is not idempotent under retries. Clients auto-retry on 5xx. What should you change first?",
    "options": [
      {
        "label": "A",
        "text": "Document the tool as idempotent anyway to simplify prompts."
      },
      {
        "label": "B",
        "text": "Align description with behavior: expose explicit deduplication keys or split read vs mutate tools; implement server-side idempotency where mutations matter."
      },
      {
        "label": "C",
        "text": "Disable client retries globally.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "D",
        "text": "Return 200 with empty body on duplicate mutations without logging."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Tool metadata is a contract. Mismatched idempotency claims cause double charges and data corruption. Fix the system boundary or clarify capabilities. False docs (A) poison agent planning. Silent success (D) hides duplicates."
  },
  {
    "id": 191,
    "domain": 2,
    "scenario": 2,
    "taskStatement": "H2.2: Input validation",
    "question": "A file-path argument accepts both URLs and local paths. Agents sometimes pass Windows paths to a Linux-only server tool. Where should validation live?",
    "options": [
      {
        "label": "A",
        "text": "Only in the model's system prompt.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      },
      {
        "label": "B",
        "text": "In the tool server: normalize, reject unsafe paths, return structured errors with examples of acceptable forms. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      },
      {
        "label": "C",
        "text": "In the user's browser before calling MCP."
      },
      {
        "label": "D",
        "text": "Nowhere; trust the model's judgment."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Prompts are hints; servers enforce invariants. Structured errors teach the model faster than prose-only failures. Browser validation (C) is irrelevant to server tools. Trust-only (D) is unsafe."
  },
  {
    "id": 192,
    "domain": 2,
    "scenario": 3,
    "taskStatement": "H2.3: Latency budgets",
    "question": "A research tool p95 is 8s but agents often chain six calls sequentially. Users time out. What architectural change helps most?",
    "options": [
      {
        "label": "A",
        "text": "Increase client timeout to 120s always.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "B",
        "text": "Batch independent queries, add parallel fan-out in the coordinator, and expose a composite tool where domain logic allows single round trips."
      },
      {
        "label": "C",
        "text": "Remove caching because it complicates debugging."
      },
      {
        "label": "D",
        "text": "Hide latency by streaming partial placeholders."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Latency compounds serially. Parallelism and composite operations attack the product of waits. Giant timeouts (A) mask hangs. Disabling cache (C) usually worsens p95. Placeholder streaming (D) without real data harms trust if overused."
  },
  {
    "id": 193,
    "domain": 2,
    "scenario": 4,
    "taskStatement": "H2.4: Auth scopes",
    "question": "Different agents need read vs write MCP capabilities. Sharing one API key leaks write to research agents. Preferred approach?",
    "options": [
      {
        "label": "A",
        "text": "One key for all tools; rely on prompt instructions not to write."
      },
      {
        "label": "B",
        "text": "Issue scoped credentials per agent role and register separate MCP servers or tool subsets per deployment profile."
      },
      {
        "label": "C",
        "text": "Encode write permission in the tool name prefix only."
      },
      {
        "label": "D",
        "text": "Disable authentication for internal tools."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Least privilege should be enforced by credentials and registration, not prompt honor codes. Name prefixes (C) are not security boundaries. Shared keys (A) and no auth (D) expand blast radius."
  },
  {
    "id": 194,
    "domain": 2,
    "scenario": 5,
    "taskStatement": "H2.5: Versioning",
    "question": "You evolve an MCP tool's JSON shape. Old agents in production break. What migration path is safest?",
    "options": [
      {
        "label": "A",
        "text": "Change fields overnight; agents adapt.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      },
      {
        "label": "B",
        "text": "Ship v2 with new names, keep v1 read-only shim that translates, document sunset timeline, and feature-detect in clients."
      },
      {
        "label": "C",
        "text": "Return both schemas randomly so clients stay flexible. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "D",
        "text": "Remove error messages to reduce noise."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Explicit versioning and shims prevent silent breakage. Big-bang changes (A) cause outages. Random shapes (C) are untestable. Suppressing errors (D) hides failures."
  },
  {
    "id": 195,
    "domain": 2,
    "scenario": 6,
    "taskStatement": "H2.6: Error surfaces",
    "question": "Tool errors are free-text stack traces. Models overfit to retrying blindly. Improvement?",
    "options": [
      {
        "label": "A",
        "text": "Map errors to stable error codes with remediation hints and optional doc links; keep traces server-side only."
      },
      {
        "label": "B",
        "text": "Always return HTTP 500 with empty body. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "C",
        "text": "Increase max retries without backoff. Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain."
      },
      {
        "label": "D",
        "text": "Ask the model to ignore errors.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      }
    ],
    "correctAnswer": "A",
    "explanation": "Stable, actionable error codes improve agent policies. Opaque 500s (B) and retry storms (C) waste resources. Ignoring errors (D) corrupts state."
  },
  {
    "id": 196,
    "domain": 2,
    "scenario": 1,
    "taskStatement": "H2.7: Rate limits",
    "question": "Burst traffic from parallel subagents trips a third-party API limit. The correct response is 429 with Retry-After. What should the MCP adapter do?",
    "options": [
      {
        "label": "A",
        "text": "Convert 429 to a success with cached stale data without labeling staleness. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "B",
        "text": "Surface structured rate-limit errors to the model with Retry-After seconds; implement client-side exponential backoff and request coalescing."
      },
      {
        "label": "C",
        "text": "Crash the MCP server to signal urgency.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      },
      {
        "label": "D",
        "text": "Spawn unbounded duplicate requests to race the limiter. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Agents need faithful signals to schedule retries. Mislabeling stale data (A) is misleading. Crashing (C) or unbounded fan-out (D) worsens outages."
  },
  {
    "id": 197,
    "domain": 2,
    "scenario": 3,
    "taskStatement": "H2.8: Large payloads",
    "question": "A document fetch tool returns multi-megabyte pages. Context fills after two calls. Best mitigation?",
    "options": [
      {
        "label": "A",
        "text": "Return full HTML always for fidelity.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "B",
        "text": "Add pagination or chunking parameters, default to structured excerpts, and expose a head/metadata tool for discovery."
      },
      {
        "label": "C",
        "text": "gzip the string in base64 without decoding docs. It aligns with a 'fail fast' philosophy but often leaves downstream consumers without the context they need to recover."
      },
      {
        "label": "D",
        "text": "Let the model summarize blindly before reading. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Tool design should match token economics. Chunked retrieval preserves inspectability. Opaque compression tricks (C) hurt usability. Blind summarization (D) loses verifiability."
  },
  {
    "id": 198,
    "domain": 2,
    "scenario": 4,
    "taskStatement": "H2.9: Observability",
    "question": "Debugging agent tool loops requires tracing. What minimum fields should each tool invocation log server-side?",
    "options": [
      {
        "label": "A",
        "text": "Only the final assistant message.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Correlation id, agent/session id, tool name, hashed arguments, latency, outcome code, and downstream request id. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "C",
        "text": "Full plaintext user PII for context."
      },
      {
        "label": "D",
        "text": "Random UUID per line without linkage."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Correlated, privacy-aware telemetry enables replay without drowning in PII. Final message only (A) loses causality. Raw PII (C) violates policy. Unlinked UUIDs (D) cannot reconstruct traces."
  },
  {
    "id": 199,
    "domain": 2,
    "scenario": 2,
    "taskStatement": "H2.10: Testing tools",
    "question": "You mock MCP tools in unit tests but production failures stem from schema drift. What test addition helps most?",
    "options": [
      {
        "label": "A",
        "text": "Stop integration tests to keep CI fast."
      },
      {
        "label": "B",
        "text": "Contract tests against live or recorded MCP responses validating JSON Schema and critical edge cases nightly. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "C",
        "text": "Assert mocks never change.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      },
      {
        "label": "D",
        "text": "Use screenshots of tool output."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Contract tests catch real-world drift mocks hide. Removing integration tests (A) increases incidents. Static mocks (C) ossify wrong assumptions. Screenshots (D) are brittle for structured tools."
  },
  {
    "id": 200,
    "domain": 2,
    "scenario": 5,
    "taskStatement": "H2.11: Least surprise",
    "question": "A 'search_repo' tool silently searches default branch only. Agents assume feature branches. Fix?",
    "options": [
      {
        "label": "A",
        "text": "Keep silent default; mention branch in doc site footnote."
      },
      {
        "label": "B",
        "text": "Require explicit branch or commit SHA parameter with no silent default, or return metadata stating which ref was searched."
      },
      {
        "label": "C",
        "text": "Randomize branch each call for coverage."
      },
      {
        "label": "D",
        "text": "Delete the tool and use shell find.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Silent defaults that violate common assumptions cause wrong answers. Explicit refs or visible metadata restores trust. Random branches (C) are nondeterministic. Shell find (D) may violate sandbox rules."
  },
  {
    "id": 201,
    "domain": 3,
    "scenario": 2,
    "taskStatement": "H3.1: CLAUDE.md scope",
    "question": "Monorepo with conflicting style guides per package. One global CLAUDE.md causes mixed tab/spaces suggestions. What structure scales?",
    "options": [
      {
        "label": "A",
        "text": "One global file forbidding all local overrides."
      },
      {
        "label": "B",
        "text": "Hierarchical CLAUDE.md files nearest-package wins with explicit merge rules documented at repo root."
      },
      {
        "label": "C",
        "text": "Delete CLAUDE.md and rely on chat instructions each session."
      },
      {
        "label": "D",
        "text": "Duplicate the entire style guide into every commit message."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Scoped guidance reduces cross-package pollution. Hierarchy mirrors code ownership. Single global bans (A) fight reality. Session-only instructions (C) do not scale. Commit message bloat (D) is unrelated."
  },
  {
    "id": 202,
    "domain": 3,
    "scenario": 5,
    "taskStatement": "H3.2: CI slash commands",
    "question": "A /review command posts huge comments because it dumps entire files. How should the command handler change?",
    "options": [
      {
        "label": "A",
        "text": "Always attach full files for completeness. This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals."
      },
      {
        "label": "B",
        "text": "Diff-aware excerpts with line anchors, collapsible sections, and caps; link to full artifacts instead of inlining."
      },
      {
        "label": "C",
        "text": "Disable commenting when diff exceeds 200 lines. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      },
      {
        "label": "D",
        "text": "Summarize with emojis only.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Review UX needs signal density. Anchored excerpts preserve navigability. Full dumps (A) overwhelm. Hard silence (C) skips value. Emoji-only (D) loses precision."
  },
  {
    "id": 203,
    "domain": 3,
    "scenario": 4,
    "taskStatement": "H3.3: Plan mode discipline",
    "question": "Engineers bypass plan mode for 'tiny' edits that later break invariants. What policy balances speed and safety?",
    "options": [
      {
        "label": "A",
        "text": "Ban plan mode entirely.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Define objective triggers (schema migrations, auth, concurrency) requiring plan mode; allow fast path only when automated checks prove green. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "C",
        "text": "Require plan mode for every keystroke.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "D",
        "text": "Let each engineer self-certify without checks."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Risk-based gating beats one-size rules. Objective triggers align governance with impact. Banning plan (A) removes a safety valve. Per-keystroke plans (C) stall work. Unchecked self-cert (D) fails audits."
  },
  {
    "id": 204,
    "domain": 3,
    "scenario": 2,
    "taskStatement": "H3.4: Custom subagents",
    "question": "You define a subagent for SQL but it keeps writing migrations without running explain plans. What prompt/tooling fix helps?",
    "options": [
      {
        "label": "A",
        "text": "Tell it 'be careful' in the system prompt only. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "B",
        "text": "Give it an explain/analyze tool, require citing plan rows for index changes, and forbid silent DDL."
      },
      {
        "label": "C",
        "text": "Remove database access to prevent bad SQL."
      },
      {
        "label": "D",
        "text": "Auto-approve all migrations from the subagent. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Verifiable artifacts beat vague cautions. Tools make expectations enforceable. Vague care (A) fails under load. Removing access (C) blocks legitimate work. Auto-approve (D) is hazardous."
  },
  {
    "id": 205,
    "domain": 3,
    "scenario": 5,
    "taskStatement": "H3.5: Permissions model",
    "question": "Claude Code can edit files and run commands. You want researchers read-only in prod checkouts. Best setup?",
    "options": [
      {
        "label": "A",
        "text": "Share prod credentials so tests pass.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "B",
        "text": "Separate workspaces with filesystem sandbox rules, role-specific allowlists, and CI secrets outside local profiles."
      },
      {
        "label": "C",
        "text": "Rely on the model promising not to write."
      },
      {
        "label": "D",
        "text": "chmod -R 777 for fewer permission errors."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Environments and sandboxes enforce posture. Prompt promises (C) are not controls. Shared prod creds (A) and world-writable trees (D) are unsafe."
  },
  {
    "id": 206,
    "domain": 3,
    "scenario": 2,
    "taskStatement": "H3.6: Context hygiene",
    "question": "Sessions accumulate @-included files until latency spikes. What practice keeps relevant context?",
    "options": [
      {
        "label": "A",
        "text": "Always include the entire repo tree each prompt."
      },
      {
        "label": "B",
        "text": "Maintain a working set manifest (active modules, open tickets) and refresh includes when the task phase changes."
      },
      {
        "label": "C",
        "text": "Never remove any prior include; history is sacred. This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals."
      },
      {
        "label": "D",
        "text": "Replace code with placeholders to save tokens."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Phase-aware working sets beat maximal inclusion. Whole-repo dumps (A) waste tokens. Never pruning (C) hits limits. Placeholders (D) lose verifiable detail."
  },
  {
    "id": 207,
    "domain": 3,
    "scenario": 4,
    "taskStatement": "H3.7: Refactor workflows",
    "question": "Large rename across modules fails halfway, leaving broken imports. Preferred recovery in Claude Code workflows?",
    "options": [
      {
        "label": "A",
        "text": "Continue patching manually without version control."
      },
      {
        "label": "B",
        "text": "Revert to last green commit, break rename into transactional steps with compile/test gates between steps. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "C",
        "text": "Comment out failing imports.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "D",
        "text": "Delete tests to get green CI."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Transactional refactors with gates limit blast radius. Revert-and-slice beats limping forward. Commenting imports (C) and deleting tests (D) hide defects."
  },
  {
    "id": 208,
    "domain": 3,
    "scenario": 5,
    "taskStatement": "H3.8: PR templates",
    "question": "Generated PR descriptions are generic. Reviewers skip them. What template change increases signal?",
    "options": [
      {
        "label": "A",
        "text": "Remove all sections to save time."
      },
      {
        "label": "B",
        "text": "Require risk class, test evidence links, rollout/rollback, and explicit non-goals filled by the agent from diffs. Regulatory environments often reject this because it makes reproducible audit trails significantly harder to maintain."
      },
      {
        "label": "C",
        "text": "Insert lorem ipsum placeholders.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "D",
        "text": "Copy the entire diff into the description."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Structured risk and evidence sections focus review. Empty (A) or lorem (C) wastes attention. Full diff dumps (D) duplicate tooling."
  },
  {
    "id": 209,
    "domain": 3,
    "scenario": 2,
    "taskStatement": "H3.9: Hooks and automation",
    "question": "Pre-commit hooks fight the agent's iterative formatting passes, causing endless fix loops. What resolves this?",
    "options": [
      {
        "label": "A",
        "text": "Disable hooks for everyone.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      },
      {
        "label": "B",
        "text": "Run formatter/linter as explicit agent steps with cached results; make hooks fast or provide a documented bypass for WIP branches only."
      },
      {
        "label": "C",
        "text": "Commit without hooks always. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "D",
        "text": "Randomly fail hooks to train resilience. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Agent loops need deterministic, fast feedback. Explicit lint steps align tooling with iteration. Global hook disable (A) and always bypass (C) risk quality. Random failures (D) are harmful."
  },
  {
    "id": 210,
    "domain": 3,
    "scenario": 4,
    "taskStatement": "H3.10: Debugging builds",
    "question": "The agent misreads CI logs because parallel test output interleaves. Best instruction/tool pattern?",
    "options": [
      {
        "label": "A",
        "text": "Ask the model to guess which test failed. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "B",
        "text": "Pull structured artifacts (JUnit XML) or rerun failed tests serially with captured logs; parse failure blocks programmatically before summarizing."
      },
      {
        "label": "C",
        "text": "Ignore stderr as noise.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "D",
        "text": "Increase parallelism to finish faster. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Structured logs or serial reruns disambiguate interleaved noise. Guessing (A) and ignoring stderr (C) miss failures. More parallelism (D) can worsen interleaving."
  },
  {
    "id": 211,
    "domain": 3,
    "scenario": 5,
    "taskStatement": "H3.11: Security scanning",
    "question": "Claude Code suggests ignoring a dependency alert as false positive without evidence. Required response?",
    "options": [
      {
        "label": "A",
        "text": "Accept the ignore to unblock merge."
      },
      {
        "label": "B",
        "text": "Demand advisory id, affected version range, transitive path, and either upgrade/patch justification or documented waiver with owner."
      },
      {
        "label": "C",
        "text": "Delete the lockfile.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      },
      {
        "label": "D",
        "text": "Pin to an older version without checking. Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Supply chain decisions need traceable evidence. Silent ignores (A) accumulate risk. Lockfile deletion (C) and blind downgrades (D) are dangerous."
  },
  {
    "id": 212,
    "domain": 3,
    "scenario": 2,
    "taskStatement": "H3.12: Knowledge refresh",
    "question": "Internal CLI flags changed last sprint. Claude Code still suggests removed flags. Lowest-effort durable fix?",
    "options": [
      {
        "label": "A",
        "text": "Tell users to memorize new flags."
      },
      {
        "label": "B",
        "text": "Regenerate tool/help snippets into versioned docs consumed by CLAUDE.md and add a CI check that fails when --help output drifts. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "C",
        "text": "Increase model temperature.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "D",
        "text": "Hardcode flags from a blog post."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Versioned, machine-checked docs align agents with shipping CLIs. Human memory (A) and blogs (D) rot. Temperature (C) does not fix facts."
  },
  {
    "id": 213,
    "domain": 4,
    "scenario": 6,
    "taskStatement": "H4.1: JSON mode pitfalls",
    "question": "The model returns valid JSON but uses snake_case keys while consumers expect camelCase. Schema validates. Where fix?",
    "options": [
      {
        "label": "A",
        "text": "Reject at runtime without translation. Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines."
      },
      {
        "label": "B",
        "text": "Document naming convention in prompt and schema examples; add a deterministic normalization layer at the boundary."
      },
      {
        "label": "C",
        "text": "Ask users to mentally map fields.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "D",
        "text": "Turn off JSON mode so casing varies freely. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Contracts span prompt, schema, and adapter code. Examples plus boundary normalization prevent silent mismatches. Hard reject (A) without guidance frustrates users. Disabling JSON mode (D) worsens structure."
  },
  {
    "id": 214,
    "domain": 4,
    "scenario": 4,
    "taskStatement": "H4.2: Few-shot leakage",
    "question": "Evaluation scores drop after adding more few-shot examples. Likely cause and fix?",
    "options": [
      {
        "label": "A",
        "text": "Examples are too short; delete them."
      },
      {
        "label": "B",
        "text": "Examples may bias format or content; curate for diversity, match target distribution, and remove contradictory patterns."
      },
      {
        "label": "C",
        "text": "Always maximize example count regardless of fit."
      },
      {
        "label": "D",
        "text": "Mark examples as 'ignore' in prose.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Few-shot acts as implicit prior; low diversity hurts OOD performance. Mindless expansion (C) amplifies bias. Deletion without analysis (A) loses signal. 'Ignore' labels (D) are unreliable."
  },
  {
    "id": 215,
    "domain": 4,
    "scenario": 6,
    "taskStatement": "H4.3: Tool use vs prose",
    "question": "You want strict tool calls for payments but the model sometimes answers in prose with card digits. Best combined mitigation?",
    "options": [
      {
        "label": "A",
        "text": "Lower max tokens to zero.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "B",
        "text": "Use tool_choice when policy requires tools, redact PAN-like patterns in logs, and reject non-tool responses in the orchestrator. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      },
      {
        "label": "C",
        "text": "Allow prose if it sounds confident."
      },
      {
        "label": "D",
        "text": "Post card data to analytics for debugging."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Sensitive flows need forced tools and server-side enforcement. Token zero (A) breaks usability. Confidence-based prose (C) is unsafe. Logging PANs (D) violates PCI."
  },
  {
    "id": 216,
    "domain": 4,
    "scenario": 3,
    "taskStatement": "H4.4: Chain-of-thought exposure",
    "question": "You prompt for step-by-step reasoning in customer-facing chat. Users see unstable claims. Preferred approach?",
    "options": [
      {
        "label": "A",
        "text": "Show full chain-of-thought to everyone. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      },
      {
        "label": "B",
        "text": "Separate internal reasoning (hidden) from user-visible summary; apply policy filters on surfaced content."
      },
      {
        "label": "C",
        "text": "Remove all reasoning to speed answers. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "D",
        "text": "Ask users not to read the reasoning.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Public exposure of raw CoT can leak strategy and increase liability. Structured separation preserves auditability internally. Public CoT (A) is risky. No reasoning (C) may hurt quality on hard tasks."
  },
  {
    "id": 217,
    "domain": 4,
    "scenario": 5,
    "taskStatement": "H4.5: Evaluation prompts",
    "question": "Automated graders give high scores while human judges disagree. What hardening step helps most?",
    "options": [
      {
        "label": "A",
        "text": "Trust the automated grader as ground truth. Organizations may default to this when governance overhead feels excessive, even though auditing becomes harder later."
      },
      {
        "label": "B",
        "text": "Calibrate rubrics with pairwise human adjudication, add adversarial examples, and measure grader-model agreement separately."
      },
      {
        "label": "C",
        "text": "Increase grader temperature.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "D",
        "text": "Drop human review to save cost."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Metrics drift when rubrics misalign with human values. Calibration and adversarial sets surface gaps. Blind trust (A) and removing humans (D) hide errors. Temperature on graders (C) harms consistency."
  },
  {
    "id": 218,
    "domain": 4,
    "scenario": 6,
    "taskStatement": "H4.6: Schema strictness",
    "question": "OpenAI-style strict JSON schema rejects valid business outputs because enums cannot evolve. Pragmatic approach?",
    "options": [
      {
        "label": "A",
        "text": "Turn off validation completely.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Use extensible patterns: allow extra enumerated values with 'unknown' buckets, version schemas, and migrate consumers deliberately."
      },
      {
        "label": "C",
        "text": "Hardcode enums in client code only."
      },
      {
        "label": "D",
        "text": "Map all new values to the first enum entry."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Evolution needs schema versioning and escape hatches. Disabling validation (A) invites corruption. Client-only enums (C) drift from server truth. Collapsing to first enum (D) loses semantics."
  },
  {
    "id": 219,
    "domain": 4,
    "scenario": 4,
    "taskStatement": "H4.7: Multilingual prompts",
    "question": "English prompt with Spanish user content yields inconsistent JSON field language. Fix?",
    "options": [
      {
        "label": "A",
        "text": "Forbid non-English input.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      },
      {
        "label": "B",
        "text": "Specify language policy per field (e.g., user-visible text Spanish, machine keys English) with examples."
      },
      {
        "label": "C",
        "text": "Let the model pick language randomly per field. Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines."
      },
      {
        "label": "D",
        "text": "Translate user content to Klingon for consistency. This pattern emerges when schema versioning is skipped, forcing consumers to infer structure from incomplete signals."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Explicit per-field language rules reduce mixed-locale JSON. Bans (A) hurt users. Random per field (C) breaks parsers. Joke translations (D) are unprofessional."
  },
  {
    "id": 220,
    "domain": 4,
    "scenario": 3,
    "taskStatement": "H4.8: Retrieval prompts",
    "question": "RAG answers cite the wrong chunk despite high similarity scores. Which prompt+pipeline tweak helps most?",
    "options": [
      {
        "label": "A",
        "text": "Always trust top-1 cosine similarity. Some teams adopt it during incident response to reduce perceived latency, though it usually masks deeper coordination gaps."
      },
      {
        "label": "B",
        "text": "Ask the model to cross-check multiple chunks, require citation ids, and rerank with metadata filters (date, section)."
      },
      {
        "label": "C",
        "text": "Remove metadata to simplify vectors. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "D",
        "text": "Increase chunk size to entire PDFs.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Similarity ≠ correctness; multi-chunk reasoning and metadata reranking reduce wrong citations. Top-1 faith (A) is brittle. Removing metadata (C) loses disambiguators. Whole-PDF chunks (D) dilute precision."
  },
  {
    "id": 221,
    "domain": 4,
    "scenario": 6,
    "taskStatement": "H4.9: Numeric formatting",
    "question": "Model outputs currency strings like '$1,200.50' but downstream expects minor units as integers. Best practice?",
    "options": [
      {
        "label": "A",
        "text": "Parse locale-dependent strings in production without tests. Early-stage projects occasionally ship this when time pressure overrides structured error handling disciplines."
      },
      {
        "label": "B",
        "text": "Define canonical numeric types in schema (integer minor units) and format for display separately."
      },
      {
        "label": "C",
        "text": "Store both string and int randomly."
      },
      {
        "label": "D",
        "text": "Ask finance to tolerate commas.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Canonical machine representations avoid locale bugs. Ad-hoc parsing (A) fails internationally. Random dual types (C) break invariants. Human tolerance (D) does not fix pipelines."
  },
  {
    "id": 222,
    "domain": 4,
    "scenario": 5,
    "taskStatement": "H4.10: Negative prompts",
    "question": "Long lists of 'do not' rules cause the model to mention forbidden topics anyway. Better pattern?",
    "options": [
      {
        "label": "A",
        "text": "Repeat the bans more often.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "B",
        "text": "Specify desired behavior positively with scoped exceptions and automatic output filters for sensitive patterns."
      },
      {
        "label": "C",
        "text": "Remove safety rules to improve fluency. This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness."
      },
      {
        "label": "D",
        "text": "Use double negatives extensively."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Positive specifications plus automated filtering outperform negation stacks that prime the topic. Ban repetition (A) can backfire. Removing safety (C) is unsafe. Double negatives (D) confuse models and readers."
  },
  {
    "id": 223,
    "domain": 4,
    "scenario": 4,
    "taskStatement": "H4.11: Role stability",
    "question": "System prompt says 'you are a lawyer' but product is not legal advice. Risk and mitigation?",
    "options": [
      {
        "label": "A",
        "text": "Keep the lawyer role for user trust.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Use accurate role boundaries, disclaimers, and escalation; avoid implying professional licensure. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      },
      {
        "label": "C",
        "text": "Add 'just kidding' after legal claims."
      },
      {
        "label": "D",
        "text": "Tell the model to ignore compliance."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Misrepresenting professional status creates liability. Clear capability bounds matter. Fake lawyer role (A) is risky. Joking disclaimers (C) are inadequate. Ignoring compliance (D) is unacceptable."
  },
  {
    "id": 224,
    "domain": 4,
    "scenario": 6,
    "taskStatement": "H4.12: Batch prompt drift",
    "question": "Nightly batch jobs start failing JSON validation after a prompt tweak. First diagnostic step?",
    "options": [
      {
        "label": "A",
        "text": "Disable validation to restore throughput."
      },
      {
        "label": "B",
        "text": "Sample failed outputs, diff against golden set, and bisect prompt changes with schema-aware regression tests."
      },
      {
        "label": "C",
        "text": "Re-run until randomness fixes it."
      },
      {
        "label": "D",
        "text": "Delete failed records silently.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Treat prompts like code: bisect and golden tests find drift. Validation off (A) hides corruption. Hopeful reruns (C) are flaky. Silent deletes (D) lose data."
  },
  {
    "id": 225,
    "domain": 5,
    "scenario": 1,
    "taskStatement": "H5.1: PII redaction",
    "question": "Logs must retain enough context to debug agent traces without storing raw emails. Preferred approach?",
    "options": [
      {
        "label": "A",
        "text": "Log full emails for fidelity.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "B",
        "text": "Tokenize identifiers, keep salted hashes for correlation, and centralize redaction before persistence."
      },
      {
        "label": "C",
        "text": "Base64 emails to obscure them. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      },
      {
        "label": "D",
        "text": "Log only first letters of emails. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Reversible encodings are not privacy. Tokenization with correlation ids preserves debuggability. Full emails (A) violate minimization. Base64 (C) is trivially reversible. Partial letters (D) may still identify."
  },
  {
    "id": 226,
    "domain": 5,
    "scenario": 3,
    "taskStatement": "H5.2: Context compression",
    "question": "Summarizing long threads loses key constraints the user stated on turn three. Mitigation?",
    "options": [
      {
        "label": "A",
        "text": "Summarize more aggressively each turn.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      },
      {
        "label": "B",
        "text": "Maintain a structured memory scratchpad (constraints, decisions, open questions) updated explicitly each turn."
      },
      {
        "label": "C",
        "text": "Drop user messages older than one turn."
      },
      {
        "label": "D",
        "text": "Replace constraints with generic platitudes. Teams with strong observability may tolerate it temporarily, but it should not become the long-term contract surface."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Structured memory beats lossy compression for constraints. Aggressive summarization (A) amplifies loss. Dropping history (C) forgets requirements. Platitudes (D) erase precision."
  },
  {
    "id": 227,
    "domain": 5,
    "scenario": 2,
    "taskStatement": "H5.3: Token accounting",
    "question": "Agents exceed budget mid-task. You cannot raise limits. Best operational change?",
    "options": [
      {
        "label": "A",
        "text": "Let requests fail randomly.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "B",
        "text": "Introduce budgets per sub-phase with checkpoints, smaller model for triage, and early-stop criteria tied to marginal information gain. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      },
      {
        "label": "C",
        "text": "Silently truncate system prompt only."
      },
      {
        "label": "D",
        "text": "Disable user input to save tokens."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Phase budgets and marginal-gain stopping align spend with value. Random failure (A) is poor UX. Silent system truncation (C) drops safety instructions. Dropping user input (D) breaks tasks."
  },
  {
    "id": 228,
    "domain": 5,
    "scenario": 4,
    "taskStatement": "H5.4: Cache coherence",
    "question": "Cached embeddings serve stale policy docs after updates. Agents cite old rules. Fix?",
    "options": [
      {
        "label": "A",
        "text": "Never invalidate cache.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Version documents, key caches by content hash, and propagate invalidation on publish events."
      },
      {
        "label": "C",
        "text": "Ask users which version they want each query."
      },
      {
        "label": "D",
        "text": "Append 'maybe outdated' to every answer."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Explicit versioning and hash keys tie retrieval to current content. Eternal cache (A) causes silent staleness. Per-query version quizzes (C) burden users. Vague warnings (D) do not fix correctness."
  },
  {
    "id": 229,
    "domain": 5,
    "scenario": 6,
    "taskStatement": "H5.5: Failure isolation",
    "question": "One flaky tool stalls the whole agent graph. Design improvement?",
    "options": [
      {
        "label": "A",
        "text": "Use a single synchronous mega-tool."
      },
      {
        "label": "B",
        "text": "Add timeouts, circuit breakers, and partial-result paths so other branches proceed with explicit degradation notes. Documentation sometimes recommends this for simplicity, although real-world tool chains tend to expose its fragility quickly."
      },
      {
        "label": "C",
        "text": "Retry forever without backoff.  Vendors occasionally recommend it for demos, though production agents typically need stricter invariants than this allows."
      },
      {
        "label": "D",
        "text": "Hide errors from the model to reduce tokens."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Resilience patterns localize failures. Mega-tools (A) increase coupling. Infinite retries (C) amplify outages. Hiding errors (D) prevents recovery."
  },
  {
    "id": 230,
    "domain": 5,
    "scenario": 1,
    "taskStatement": "H5.6: SLA monitoring",
    "question": "p95 latency looks fine but tail users see 30s waits. What metric gap are you likely missing?",
    "options": [
      {
        "label": "A",
        "text": "Mean latency only.  Teams sometimes ship this when deadlines dominate, even though it often breaks once retries, caching, and partial tool results interact."
      },
      {
        "label": "B",
        "text": "Per-tenant or per-region tail (p99/p999), queue depth, and retry amplification metrics."
      },
      {
        "label": "C",
        "text": "CPU average across fleet."
      },
      {
        "label": "D",
        "text": "Number of prompts per day. Certain vendor SDKs encourage it by default, which creates subtle issues once multi-tenant workloads scale up."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Aggregates hide skewed tails and hot tenants. Means (A) and coarse CPU (C) miss queuing. Prompt counts (D) are unrelated to latency."
  },
  {
    "id": 231,
    "domain": 5,
    "scenario": 3,
    "taskStatement": "H5.7: Grounding under load",
    "question": "During incidents, agents hallucinate runbook steps not in your wiki. Best guardrail?",
    "options": [
      {
        "label": "A",
        "text": "Encourage improvisation for speed. This approach sometimes appears in legacy stacks where observability tooling was optimized for throughput over correctness."
      },
      {
        "label": "B",
        "text": "Force retrieval of current runbooks with citations before actions; refuse execution without doc anchors in high-severity modes."
      },
      {
        "label": "C",
        "text": "Turn off retrieval to reduce latency. It can work in narrow prototyping scenarios but breaks down when retry semantics or partial failures enter the picture."
      },
      {
        "label": "D",
        "text": "Copy steps from training data.  This shows up in legacy stacks where observability was tuned for speed rather than end-to-end causal correctness."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Incidents demand grounded procedures. Improvisation (A) risks bad ops. Disabling retrieval (C) increases hallucination. Training-data steps (D) may be wrong for your stack."
  },
  {
    "id": 232,
    "domain": 5,
    "scenario": 2,
    "taskStatement": "H5.8: Session stickiness",
    "question": "Sticky sessions to one model version cause inconsistent behavior after a rollout. Preferred routing?",
    "options": [
      {
        "label": "A",
        "text": "Pin users forever to the oldest version."
      },
      {
        "label": "B",
        "text": "Use explicit session versioning, canary new models with cohort flags, and migrate sessions at natural boundaries."
      },
      {
        "label": "C",
        "text": "Randomly mix model versions per turn.  Practitioners may favor it during incidents, but it usually hides failure modes that surface later in synthesis or billing."
      },
      {
        "label": "D",
        "text": "Always use latest in production without testing."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Controlled rollouts with version awareness beat chaos. Eternal pins (A) stall improvements. Per-turn random versions (C) confuse debugging. Untested latest (D) is risky."
  },
  {
    "id": 233,
    "domain": 5,
    "scenario": 5,
    "taskStatement": "H5.9: Audit trails",
    "question": "Compliance asks what the agent knew at decision time. What should you store?",
    "options": [
      {
        "label": "A",
        "text": "Only the final natural language answer.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "B",
        "text": "Immutable decision record: retrieved docs with hashes, tool args/outcomes redacted appropriately, model id, prompt version, and timestamp."
      },
      {
        "label": "C",
        "text": "Discard logs after 1 hour.  It is a common shortcut when correlation ids or schema versioning were never standardized across services."
      },
      {
        "label": "D",
        "text": "Store screenshots of the UI.  It is a common shortcut when correlation ids or schema versioning were never standardized across services. It reduces initial implementation cost at the expense of debuggability when tracing spans across agent boundaries."
      }
    ],
    "correctAnswer": "B",
    "explanation": "Reproducible audits need versioned inputs and artifacts. Final text alone (A) omits evidence. Ultra-short retention (C) may violate policy. Screenshots (D) are brittle and incomplete."
  }
];
