export type DomainId = 1 | 2 | 3 | 4 | 5;
export type ScenarioId = 1 | 2 | 3 | 4 | 5 | 6;
export type AnswerLabel = "A" | "B" | "C" | "D";

export const DOMAIN_NAMES: Record<DomainId, string> = {
  1: "Agentic Architecture & Orchestration",
  2: "Tool Design & MCP Integration",
  3: "Claude Code Configuration & Workflows",
  4: "Prompt Engineering & Structured Output",
  5: "Context Management & Reliability",
};

export const SCENARIO_NAMES: Record<ScenarioId, string> = {
  1: "Customer Support Resolution Agent",
  2: "Code Generation with Claude Code",
  3: "Multi-Agent Research System",
  4: "Developer Productivity with Claude",
  5: "Claude Code for CI",
  6: "Structured Data Extraction",
};

export interface Question {
  id: number;
  domain: DomainId;
  scenario: ScenarioId;
  taskStatement: string;
  question: string;
  options: { label: AnswerLabel; text: string }[];
  correctAnswer: AnswerLabel;
  explanation: string;
}

export const questions: Question[] = [
  // ============================================================
  // DOMAIN 1: Agentic Architecture & Orchestration (40 questions)
  // ============================================================

  {
    id: 1,
    domain: 1,
    scenario: 1,
    taskStatement: "1.1: Design agentic loops",
    question: "You are building a customer support agent that uses get_customer, lookup_order, process_refund, and escalate_to_human tools. The agent needs to autonomously resolve tickets by calling tools in sequence until the issue is resolved. How should you determine when the agent has finished processing a ticket?",
    options: [
      { label: "A", text: "Parse the assistant's text response for phrases like 'resolved' or 'complete' to detect when the agent is done. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Set a maximum of 5 tool call iterations and terminate the loop after that count is reached. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "After each tool call, ask the model explicitly 'Are you done?' and parse the yes/no response. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "Check the API response's stop_reason field: continue the loop when it equals \"tool_use\" and exit when it equals \"end_turn\"." }
    ],
    correctAnswer: "D",
    explanation: "Use the API stop_reason field: continue while it signals pending tool work (for example tool_use) and stop when the model ends its turn without pending tools (end_turn). Parsing assistant prose for words like \"resolved\" is fragile. A fixed iteration cap can truncate complex tickets or waste steps on simple ones. Asking the model \"are you done?\" each turn adds latency and is still informal parsing rather than structured loop control."
  },
  {
    id: 2,
    domain: 1,
    scenario: 3,
    taskStatement: "1.1: Design agentic loops",
    question: "In a multi-agent research system, the coordinator agent calls a web search subagent, which returns results. The coordinator then needs to decide whether to call the document analysis subagent or synthesize the findings. A junior developer proposes terminating the coordinator's loop after exactly 3 iterations to prevent runaway costs. What is the primary risk of this approach?",
    options: [
      { label: "A", text: "Legitimate research may require more than three iterations, so the cap can abort valid work while still consuming steps on shallow tasks. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Termination is tied to a fixed iteration count instead of task completion signals, so valid multi-step research can be truncated while simple tasks still waste iterations." },
      { label: "C", text: "Collapsing the workflow into a single long prompt removes structured tool feedback and often hits context limits before research completes. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Lowering temperature or adding 'finish quickly' instructions does not remove the hard cap; the coordinator can still be cut off mid-investigation. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "The core risk is anchoring correctness to an arbitrary iteration count: some tasks need more than three steps, while trivial ones may finish sooner. Model-driven termination (e.g., stop reasons) plus separate safety limits is the robust pattern. The answer that ties termination to a fixed iteration count instead of task completion states the primary structural flaw; the others describe related but narrower issues."
  },
  {
    id: 3,
    domain: 1,
    scenario: 4,
    taskStatement: "1.1: Design agentic loops",
    question: "A developer is using Claude to explore a legacy codebase. The agent reads files, searches for patterns, and traces call chains across multiple modules. The developer's implementation appends each tool result to the conversation messages array before sending the next API request. Why is this append-then-resend pattern essential?",
    options: [
      { label: "A", text: "Appending tool results mainly improves token billing accuracy and analytics quality. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "It is only required when using more than one tool in the same conversation. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Without resending prior tool outputs, each turn lacks the evidence needed for the next decision because API calls are stateless." },
      { label: "D", text: "Resending is optional because the model automatically persists tool history server-side. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Agent loops depend on carrying forward tool outputs as explicit context. If you do not append and resend them, the next model call cannot reliably reason over prior findings. B and C confuse context management with operational concerns. D is incorrect because server-side implicit memory is not the default contract for these request patterns."
  },
  {
    id: 4,
    domain: 1,
    scenario: 5,
    taskStatement: "1.1: Design agentic loops",
    question: "Your CI pipeline uses an agent to review pull requests. The agent reads changed files, checks for style violations, runs static analysis tools, and posts comments. During testing, you notice the agent sometimes enters an infinite loop, repeatedly calling the same Bash tool to run linting. Which approach best prevents this while preserving the agent's ability to handle complex PRs?",
    options: [
      { label: "A", text: "Limit every review to exactly 10 tool calls so loops cannot happen. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Detect loops by searching assistant text for words like 'retrying' before each tool call. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Use model stop state for normal control flow, plus a wall-clock timeout and observability hooks for runaway behavior." },
      { label: "D", text: "Disable the Bash tool whenever a command repeats more than once. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Reliable loop control should follow structured model state, not text heuristics. A separate timeout and telemetry path catches pathological runs without harming valid long reviews. A and D can block legitimate work, while B is brittle because wording-based detection is unreliable."
  },
  {
    id: 5,
    domain: 1,
    scenario: 6,
    taskStatement: "1.1: Design agentic loops",
    question: "You are building a structured data extraction pipeline that processes invoices. The agent calls tools to read PDFs, extract fields, validate against a JSON schema, and retry extraction for any fields that fail validation. A colleague suggests checking if the assistant's response contains the JSON output to determine loop termination. What is wrong with this approach?",
    options: [
      { label: "A", text: "It is acceptable if the prompt includes 'respond only with JSON' at the top. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "It is only wrong when extracting more than ten fields from one document. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The model cannot produce JSON in message text, only in tool results. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "It mixes completion control with output formatting; loop completion should be based on structured response state, and JSON validity should be checked independently." }
    ],
    correctAnswer: "D",
    explanation: "The design flaw is conflating two concerns: termination logic and payload validation. Loop progression should depend on structured model/tool state, while data quality should be enforced with schema validation and retry rules. B, C, and D rely on assumptions about response shape that are not robust in production."
  },
  {
    id: 6,
    domain: 1,
    scenario: 1,
    taskStatement: "1.1: Design agentic loops",
    question: "Your customer support agent processes a refund request. The API response includes a tool_use content block requesting process_refund with amount: 45.99. After executing the refund tool and getting a success result, what should your code do next?",
    options: [
      { label: "A", text: "End the loop immediately because the refund action already succeeded. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Append the tool result to conversation state and call the model again so it can decide next actions or termination." },
      { label: "C", text: "Store the tool result in logs only and return a canned confirmation to the user. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Check the tool payload for the word 'success' and stop if present. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "A successful tool call is usually one step in a broader workflow. The result should be fed back into the conversation so the model can decide whether to confirm, follow up, escalate, or end. A, B, and C terminate based on ad hoc assumptions instead of structured loop control."
  },
  {
    id: 7,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "You are designing a multi-agent research system where a coordinator delegates tasks to web search, document analysis, and synthesis subagents. Which architecture best describes the recommended pattern for this system?",
    options: [
      { label: "A", text: "A peer-to-peer mesh where each subagent directly communicates with every other subagent. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "A pipeline where web search always runs first, then document analysis, then synthesis, with no coordinator. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "A hub-and-spoke pattern where the coordinator is the central hub, delegating tasks to subagents and collecting their results." },
      { label: "D", text: "A shared-memory architecture where all agents read and write to the same context window simultaneously. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "The hub-and-spoke pattern is the recommended multi-agent coordinator-subagent architecture. The coordinator serves as the central hub that decomposes the research question, delegates specific tasks to specialized subagents (spokes), collects their results, and decides next steps. \"A peer-to-peer mesh where each subagent directly communicates with every other subagent\"'s peer-to-peer mesh creates unmanageable complexity - subagents calling each other leads to unpredictable behavior and makes debugging nearly impossible. \"A hub-and-spoke pattern where the coordinator is the central hub, delegating tasks to subage…\"'s fixed pipeline is too rigid and prevents the coordinator from adapting (e.g., skipping web search if the answer is in local docs). \"A shared-memory architecture where all agents read and write to the same context window simu…\" is not how multi-agent systems work - each agent has its own isolated context."
  },
  {
    id: 8,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "In your multi-agent research system, the coordinator delegates a task to the web search subagent. The web search subagent has its own conversation context. What is the key benefit of this isolated context approach?",
    options: [
      { label: "A", text: "The API disallows passing explicit context to subagents, so isolation is mandatory. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Isolation guarantees lower token cost in every run regardless of prompt design. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Isolated context limits irrelevant carryover and keeps each subagent focused on its scoped objective." },
      { label: "D", text: "Isolation is mainly useful because it enables automatic cross-provider failover. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The primary benefit is separation of concerns: each subagent receives only context needed for its role, which improves focus and reduces interference from unrelated state. Cost savings can occur but are not guaranteed. C and D claim constraints or capabilities that are unrelated to why this pattern is chosen."
  },
  {
    id: 9,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "Your coordinator decomposes a complex research question into subtasks. After receiving results from the web search and document analysis subagents, it notices a contradiction between them. In a hub-and-spoke architecture, what should the coordinator do?",
    options: [
      { label: "A", text: "Let the web search and document analysis subagents negotiate directly with each other to resolve the contradiction. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Always prefer the web search results over document analysis since web data is more current. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Delegate a follow-up task to the appropriate subagent with the contradictory details, or pass both perspectives to the synthesis subagent with instructions to reconcile them." },
      { label: "D", text: "Terminate the research and report that the question cannot be answered due to conflicting data. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "In a hub-and-spoke pattern, the coordinator is responsible for all orchestration decisions. When contradictions arise, the coordinator should either delegate targeted follow-up tasks to resolve the conflict or pass the contradiction explicitly to the synthesis subagent for reconciliation. \"Let the web search and document analysis subagents negotiate directly with each other to res…\" violates the hub-and-spoke pattern by having subagents communicate directly. \"Always prefer the web search results over document analysis since web data is more current\" applies a rigid preference that may not be appropriate (documents might be more authoritative for some questions). \"Terminate the research and report that the question cannot be answered due to conflicting data\" gives up prematurely when the coordinator has tools available to resolve the contradiction."
  },
  {
    id: 10,
    domain: 1,
    scenario: 4,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "A developer wants to use a multi-agent system to understand a legacy monolith. The coordinator decomposes the task as: Subagent A analyzes only the database layer, Subagent B analyzes only the API layer, and Subagent C analyzes only the UI layer. Each subagent is told to ignore anything outside its assigned layer. What is the primary risk of this decomposition?",
    options: [
      { label: "A", text: "Three subagents always cost more than one, so architecture quality is secondary. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Subagents cannot read overlapping files, so shared models become inaccessible. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Narrow boundaries can miss cross-layer behavior such as API-to-DB coupling, transaction flow, and shared model contracts." },
      { label: "D", text: "The number of subagents is the issue; adding one per table resolves architectural blind spots. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The key risk is blind spots in cross-cutting behavior. Layer-only analysis can miss the end-to-end flow where many production defects and design constraints live. A and D over-index on agent count, and B assumes tooling limitations that are not inherent to the pattern."
  },
  {
    id: 11,
    domain: 1,
    scenario: 5,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "You are designing a CI system where a coordinator agent reviews PRs by delegating to specialized subagents: a security reviewer, a style checker, and a test coverage analyzer. The security reviewer subagent detects a critical SQL injection vulnerability. In a hub-and-spoke model, how should this finding reach the PR comment?",
    options: [
      { label: "A", text: "Coordinator-centralized aggregation should collect subagent findings and publish one coherent review output." },
      { label: "B", text: "The security subagent should forward findings to whichever subagent owns comment formatting. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The security subagent should post directly so critical findings are not delayed. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Each subagent should post independently to maximize parallel throughput. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Hub-and-spoke systems keep orchestration and external publishing centralized. Subagents report to the coordinator, which prioritizes, deduplicates, and formats a single review. A, B, and D break that control boundary and create fragmented or inconsistent PR feedback."
  },
  {
    id: 12,
    domain: 1,
    scenario: 3,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "You are implementing the coordinator in a multi-agent research system using the Claude Agent SDK. To spawn a subagent that performs web search, which of the following is the correct approach?",
    options: [
      { label: "A", text: "Persist work items in a shared file and let subagents poll for new assignments. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Create a nested raw API call and pass the full coordinator transcript so no context is lost. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Use the Task tool with explicit scoped context, and include \"Task\" in allowed tools only when recursive delegation is required." },
      { label: "D", text: "Run subagents as external processes and pass context through environment variables. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Task is the intended subagent mechanism. You should pass only relevant context explicitly and scope tool access intentionally, adding Task permission only when nested delegation is a real requirement. B, C, and D bypass SDK orchestration patterns and weaken reliability or control."
  },
  {
    id: 13,
    domain: 1,
    scenario: 3,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "A developer spawns a document analysis subagent from the coordinator using the Task tool, but the subagent produces a generic response that does not address the specific research question. The developer's Task prompt says: 'Analyze the documents.' What is the most likely cause?",
    options: [
      { label: "A", text: "The subagent needs a higher temperature setting to produce more specific output. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "The Task prompt lacks explicit context - the subagent does not inherit the coordinator's conversation, so it does not know which documents to analyze or what question to answer." },
      { label: "C", text: "The document analysis subagent is using the wrong model version. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The Task tool has a bug and should be replaced with a direct API call. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Subagents do not inherit the parent agent's conversation context. The Task prompt 'Analyze the documents' provides no specifics about which documents, what research question, or what format the analysis should take. The prompt must explicitly include all necessary context: the specific documents to analyze, the research question being investigated, and the expected output format. \"The subagent needs a higher temperature setting to produce more specific output\" is wrong because temperature affects randomness, not specificity from context. \"The document analysis subagent is using the wrong model version\" is a configuration issue unrelated to the problem. \"The Task tool has a bug and should be replaced with a direct API call\" blames the tool when the issue is the developer's prompt."
  },
  {
    id: 14,
    domain: 1,
    scenario: 1,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "Your customer support system uses an AgentDefinition to define a refund specialist subagent. The AgentDefinition specifies the agent's system prompt, allowed tools (process_refund, get_customer), and output schema. When the coordinator invokes this subagent via the Task tool, what happens to the coordinator's system prompt and tool list?",
    options: [
      { label: "A", text: "The subagent uses only its own AgentDefinition configuration - it has its own system prompt and scoped tool list, completely independent of the coordinator." },
      { label: "B", text: "The subagent inherits the coordinator's system prompt and merges it with its own AgentDefinition. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "The coordinator's system prompt overrides the AgentDefinition's system prompt. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "The subagent receives no system prompt at all and relies entirely on the Task tool's prompt parameter. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "When a subagent is spawned via the Task tool with an AgentDefinition, it operates with its own isolated configuration. The AgentDefinition specifies the subagent's system prompt, allowed tools, and other parameters independently of the coordinator. This isolation is by design - it keeps subagents focused and prevents unintended capability leakage. \"The subagent uses only its own AgentDefinition configuration - it has its own system prompt …\" is wrong because there is no prompt merging. \"The coordinator's system prompt overrides the AgentDefinition's system prompt\" is wrong because the coordinator does not override the subagent's configuration. \"The subagent receives no system prompt at all and relies entirely on the Task tool's prompt …\" is wrong because the AgentDefinition does provide a system prompt."
  },
  {
    id: 15,
    domain: 1,
    scenario: 5,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "In a CI code review system, the coordinator needs to spawn a subagent to analyze test coverage for a specific PR. The coordinator knows the PR number, changed files, and repository context. Using fork_session, what is the key difference from using the Task tool?",
    options: [
      { label: "A", text: "fork_session is faster because it skips the system prompt initialization. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "fork_session creates a copy of the current conversation state for parallel exploration, while Task creates a fresh subagent with only the explicitly provided context." },
      { label: "C", text: "fork_session is only available in the CLI, not in the SDK. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "There is no difference; fork_session and Task are aliases for the same operation. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "fork_session and Task serve different purposes. fork_session creates a branch of the current conversation state, which is useful for parallel exploration where you want the forked session to have the same context as the parent. Task creates a fresh subagent with only the explicitly provided prompt and configuration, giving you isolated context. For a CI system analyzing test coverage, you would choose based on whether the subagent needs the coordinator's full conversation history (fork_session) or should start fresh with just the PR details (Task). \"fork_session creates a copy of the current conversation state for parallel exploration, whil…\" is incorrect about performance characteristics. \"fork_session is only available in the CLI, not in the SDK\" is wrong - fork_session is available in the SDK. \"There is no difference; fork_session and Task are aliases for the same operation\" is wrong - they are fundamentally different operations."
  },
  {
    id: 16,
    domain: 1,
    scenario: 4,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "A developer wants a subagent to explore a specific module in a legacy codebase and return a summary. The Task tool call includes allowedTools: [\"Read\", \"Grep\", \"Glob\"]. The subagent also needs to spawn its own subagent to analyze a deeply nested dependency. What must be added to allowedTools?",
    options: [
      { label: "A", text: "Add \"Bash\" so the subagent can run arbitrary commands to spawn child processes. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Add \"Fork\" to enable sub-delegation. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "No change is needed; all subagents automatically have access to the Task tool. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Add \"Task\" to allowedTools so the subagent can itself invoke the Task tool to create its own subagents." }
    ],
    correctAnswer: "D",
    explanation: "For a subagent to spawn its own subagents, \"Task\" must be explicitly included in its allowedTools. This is not automatic - the tool access must be deliberately granted. This is an intentional design decision that prevents uncontrolled recursive sub-delegation. \"Add \"Bash\" so the subagent can run arbitrary commands to spawn child processes\" is wrong because spawning child processes via Bash is not how the SDK handles sub-delegation. \"No change is needed; all subagents automatically have access to the Task tool\" is wrong because Task tool access is not automatic. \"Add \"Task\" to allowedTools so the subagent can itself invoke the Task tool to create its own…\" is wrong because the tool is called \"Task\", not \"Fork\"."
  },
  {
    id: 17,
    domain: 1,
    scenario: 1,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "Your customer support agent must always look up the customer's account before processing any refund. You want to guarantee this ordering. Which approach provides the strongest enforcement?",
    options: [
      { label: "A", text: "Add a sentence to the system prompt: 'Always look up the customer before processing refunds.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Implement a programmatic hook that blocks the process_refund tool call if get_customer has not been called previously in the conversation." },
      { label: "C", text: "Order the tools in the API request with get_customer listed before process_refund. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use a lower temperature to make the model more likely to follow the correct order. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Programmatic prerequisites using hooks provide deterministic enforcement - the process_refund call will be physically blocked if get_customer has not been called, regardless of what the model decides. \"Add a sentence to the system prompt: 'Always look up the customer before processing refunds.'\" is prompt-based guidance, which is probabilistic - the model usually follows it but can occasionally skip it, especially under complex conditions. \"Order the tools in the API request with get_customer listed before process_refund\" has no effect on tool call ordering; the API does not infer sequence from tool list order. \"Use a lower temperature to make the model more likely to follow the correct order\" affects randomness but does not guarantee ordering. For compliance-critical workflows, programmatic enforcement is always preferred over prompt-based guidance."
  },
  {
    id: 18,
    domain: 1,
    scenario: 1,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "When the customer support agent escalates a ticket to a human agent using the escalate_to_human tool, what should the handoff include to ensure the human agent can continue without re-investigating?",
    options: [
      { label: "A", text: "Just the customer ID and a flag indicating escalation. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The full raw conversation log including all API request/response payloads. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "A link to the conversation in the logging dashboard for the human agent to review. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "A structured handoff summary containing: customer details, order information, actions already taken (e.g., refund attempted), the reason for escalation, and any relevant error messages." }
    ],
    correctAnswer: "D",
    explanation: "A structured handoff summary provides the human agent with actionable context in an organized format. It should include what the agent already tried, what failed, customer/order context, and why escalation was triggered. \"Just the customer ID and a flag indicating escalation\" is too sparse - the human agent would need to re-investigate everything. \"The full raw conversation log including all API request/response payloads\" is too much raw data - API payloads include system prompts, token counts, and technical details that obscure the relevant information. \"A structured handoff summary containing: customer details, order information, actions alread…\" assumes the human has access to and time to review the logging dashboard, adding friction to the handoff."
  },
  {
    id: 19,
    domain: 1,
    scenario: 6,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "You have a structured data extraction pipeline with three steps: (1) extract raw fields from a document, (2) validate against a JSON schema, (3) transform and enrich the data. You need to ensure step 3 never runs on data that failed validation in step 2. Which implementation is most robust?",
    options: [
      { label: "A", text: "Include in the prompt: 'Do not proceed to enrichment if validation fails.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Implement the pipeline as three separate tool calls where a programmatic hook on the transform tool checks that the validation tool's most recent result was a pass." },
      { label: "C", text: "Run all three steps in parallel and discard the enrichment result if validation failed. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Set the model's temperature to 0 to ensure it always follows the correct order. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "A programmatic hook on the transform tool that verifies the validation tool passed provides deterministic enforcement. The transform simply cannot execute if validation has not succeeded. \"Include in the prompt: 'Do not proceed to enrichment if validation fails.'\" is prompt-based guidance, which is probabilistic and can fail. \"Run all three steps in parallel and discard the enrichment result if validation failed\" wastes resources running enrichment on potentially invalid data and risks race conditions. \"Set the model's temperature to 0 to ensure it always follows the correct order\" does not guarantee workflow ordering; temperature 0 reduces randomness but does not enforce prerequisites."
  },
  {
    id: 20,
    domain: 1,
    scenario: 5,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "In your CI pipeline, the code review agent must run the test suite before approving a PR. A developer argues that a system prompt instruction is sufficient because 'the model always runs tests first in our testing.' Why is this reasoning flawed for a production CI system?",
    options: [
      { label: "A", text: "Prompt-based guidance is probabilistic, not deterministic. In production at scale, even a 1% failure rate means PRs get approved without tests, which is unacceptable for a CI gate. Programmatic enforcement is needed." },
      { label: "B", text: "System prompts are ignored by newer model versions. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "System prompts have a token limit that prevents including workflow instructions. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "The model runs tests first in testing because of the test data, not because of the prompt. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "A",
    explanation: "The key distinction is probabilistic vs. deterministic enforcement. 'Always works in testing' does not mean 'guaranteed in production.' At scale, even rare prompt non-compliance becomes a real problem. If 1 in 100 PRs gets approved without running tests, that is a serious CI reliability issue. Programmatic hooks that block the approve action until tests have run provide the deterministic guarantee a CI system needs. \"Prompt-based guidance is probabilistic, not deterministic\" is wrong - system prompts are not ignored. \"System prompts have a token limit that prevents including workflow instructions\" is wrong - token limits are not the issue. \"The model runs tests first in testing because of the test data, not because of the prompt\" misattributes the behavior."
  },
  {
    id: 21,
    domain: 1,
    scenario: 4,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "A developer uses Claude to generate boilerplate code for a new service. The workflow requires: (1) read the existing service template, (2) generate code based on the template, (3) run linting on the generated code. The developer wants to allow skipping the linting step for quick prototyping. Which approach best balances enforcement with flexibility?",
    options: [
      { label: "A", text: "Use prompt-based guidance for all steps since the developer might want to skip any of them. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "Use programmatic enforcement for steps 1-2 (template must be read before generation) and prompt-based guidance for step 3 (linting), since linting is optional during prototyping." },
      { label: "C", text: "Use programmatic enforcement for all steps with no exceptions. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Remove linting from the workflow entirely since it is not always needed. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "This is a nuanced tradeoff. Steps 1-2 have a strict dependency (you cannot generate from a template you have not read), so programmatic enforcement is appropriate. Step 3 (linting) is a quality step that the developer explicitly wants to be optional during prototyping, making prompt-based guidance appropriate - the model is encouraged to lint but not blocked from skipping it. \"Use programmatic enforcement for steps 1-2 (template must be read before generation) and pro…\" removes enforcement from the critical template-reading prerequisite. \"Use programmatic enforcement for all steps with no exceptions\" prevents the desired flexibility for prototyping. \"Remove linting from the workflow entirely since it is not always needed\" permanently removes a useful quality check."
  },
  {
    id: 22,
    domain: 1,
    scenario: 1,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your customer support agent should never process refunds over $500 without human approval. You implement this as a hook. Which type of hook is appropriate, and why?",
    options: [
      { label: "A", text: "A hook that intercepts the process_refund tool call before execution, checks the amount parameter, and blocks the call if amount > 500, returning an error message instructing the agent to escalate." },
      { label: "B", text: "A PostToolUse hook that reverses the refund after it executes if the amount exceeded $500. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "A prompt instruction saying 'Never refund more than $500 without human approval.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "A PostToolUse hook that logs a warning when refunds exceed $500. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "A",
    explanation: "A pre-execution hook that blocks policy-violating tool calls before they execute is the correct pattern for enforcing business rules. The hook inspects the process_refund parameters, and if amount > 500, it blocks the call and returns a structured error telling the agent to escalate. \"A hook that intercepts the process_refund tool call before execution, checks the amount para…\" is dangerous - reversing a refund after execution may not be possible and creates financial complications. \"A prompt instruction saying 'Never refund more than $500 without human approval.'\" is prompt-based guidance, which is probabilistic and unacceptable for financial compliance. \"A PostToolUse hook that logs a warning when refunds exceed $500\" only logs after the fact - the unauthorized refund has already been processed."
  },
  {
    id: 23,
    domain: 1,
    scenario: 6,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your structured data extraction agent extracts phone numbers from documents. Different documents use different formats (e.g., '(555) 123-4567', '555.123.4567', '+1-555-123-4567'). You want all extracted phone numbers stored in E.164 format (+15551234567). Where should this normalization happen?",
    options: [
      { label: "A", text: "In the system prompt: 'Always output phone numbers in E.164 format.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "In the JSON schema validation step, rejecting any non-E.164 numbers and retrying. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "In a separate agent that processes the extraction output. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "In a PostToolUse hook that intercepts the extraction tool's output and programmatically normalizes all phone number fields to E.164 format before the result is added to the conversation." }
    ],
    correctAnswer: "D",
    explanation: "A PostToolUse hook for data normalization is the recommended pattern. It intercepts tool output and applies deterministic transformations (regex-based phone number normalization) before the data enters the conversation. This is reliable because it is programmatic, not probabilistic. \"In the system prompt: 'Always output phone numbers in E.164 format.'\" relies on the model to correctly format every variation, which is error-prone. \"In a separate agent that processes the extraction output\" adds unnecessary complexity with a separate agent for a deterministic transformation. \"In a PostToolUse hook that intercepts the extraction tool's output and programmatically norm…\" wastes tokens on retry loops for something that can be fixed programmatically."
  },
  {
    id: 24,
    domain: 1,
    scenario: 5,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your CI agent uses a Bash tool to run commands during code review. You want to prevent the agent from ever running 'rm -rf' or 'git push --force' commands. Should you use a hook or a prompt instruction?",
    options: [
      { label: "A", text: "A prompt instruction is sufficient since the model will reliably follow 'never run destructive commands.'. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "A deterministic hook that inspects the Bash tool's command parameter and blocks any call containing dangerous patterns like 'rm -rf' or 'git push --force'." },
      { label: "C", text: "Both a hook and a prompt instruction, but the hook is the enforcement mechanism and the prompt helps the model avoid triggering the hook." },
      { label: "D", text: "Neither; the CI environment should use read-only filesystem permissions instead. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The best approach combines both: a deterministic hook that physically blocks dangerous commands (the enforcement mechanism) and a prompt instruction that tells the model to avoid those commands (reducing unnecessary hook triggers). The hook is the safety net; the prompt is the first line of defense. \"A prompt instruction is sufficient since the model will reliably follow 'never run destructi…\" alone is insufficient for security-critical operations because prompts are probabilistic. \"A deterministic hook that inspects the Bash tool's command parameter and blocks any call con…\" alone works for enforcement but causes a worse user experience when the model repeatedly tries blocked commands. \"Neither; the CI environment should use read-only filesystem permissions instead\" is a valid additional layer but does not address git operations and is not always feasible in CI environments."
  },
  {
    id: 25,
    domain: 1,
    scenario: 1,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "A PostToolUse hook on your get_customer tool normalizes the customer's address to a standard format after retrieval. During testing, you notice the model sometimes ignores the normalized address and uses the raw address from its earlier context. What should you do?",
    options: [
      { label: "A", text: "Ensure the hook modifies the tool result in the conversation messages before the model sees it, so the raw address is never present in the model's context." },
      { label: "B", text: "Increase the temperature so the model pays more attention to recent context. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Add a prompt instruction: 'Always use the normalized address, not the raw address.'. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Run the normalization hook twice to make sure it takes effect. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "The PostToolUse hook must modify the tool result in the conversation messages before the next API call, replacing the raw data with the normalized version. If the raw address was already in the model's context from a previous message, the hook needs to ensure the normalized version is what the model sees going forward. \"Ensure the hook modifies the tool result in the conversation messages before the model sees …\" does not solve the underlying data issue. \"Add a prompt instruction: 'Always use the normalized address, not the raw address.'\" adds prompt-based guidance on top of a data problem. \"Run the normalization hook twice to make sure it takes effect\" is cargo-cult debugging that does not address the root cause of the raw data appearing in context."
  },
  {
    id: 26,
    domain: 1,
    scenario: 4,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "You are building a developer productivity tool where Claude generates code. A hook intercepts the Write tool to ensure generated files always include a copyright header. What makes this a better approach than prompting the model to include headers?",
    options: [
      { label: "A", text: "Hooks are faster than model inference. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "Hooks can add headers in languages the model does not know. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "A deterministic hook guarantees 100% compliance regardless of model behavior, context window pressure, or prompt complexity, whereas prompt-based guidance may occasionally be skipped." },
      { label: "D", text: "The model cannot write file headers; only hooks can. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "C",
    explanation: "The fundamental advantage of hooks over prompts is determinism vs. probabilism. A hook that programmatically prepends a copyright header to every file write operation provides a 100% guarantee of compliance. Prompt-based guidance might fail under context window pressure, complex multi-file operations, or edge cases the prompt did not anticipate. \"Hooks are faster than model inference\" is misleading - both happen but serve different roles. \"A deterministic hook guarantees 100% compliance regardless of model behavior, context window…\" is wrong - models can handle many languages. \"The model cannot write file headers; only hooks can\" is wrong - models can include headers, just not with guaranteed reliability."
  },
  {
    id: 27,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "Your multi-agent research system needs to analyze a collection of 50 research papers to answer a complex question. Which decomposition strategy is most appropriate?",
    options: [
      { label: "A", text: "Per-file analysis where each paper gets its own subagent, followed by a cross-file integration pass that synthesizes findings across all papers." },
      { label: "B", text: "Use a fixed sequential pipeline: paper 1, then paper 2, then paper 3, etc., each analyzed by the same agent. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Send all 50 papers to a single agent with instructions to analyze them all at once. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Randomly sample 5 papers and analyze only those, assuming they are representative. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "The per-file analysis plus cross-file integration pattern is ideal for large document collections. Each paper gets focused analysis in its own subagent (isolated context prevents cross-contamination), and then a synthesis pass integrates findings across all papers to answer the research question. \"Per-file analysis where each paper gets its own subagent, followed by a cross-file integrati…\" will likely exceed context window limits with 50 papers. \"Use a fixed sequential pipeline: paper 1, then paper 2, then paper 3, etc., each analyzed by…\" is sequential and slow without clear benefit over parallel per-file analysis. \"Randomly sample 5 papers and analyze only those, assuming they are representative\" discards 90% of the data without justification, risking missing critical findings."
  },
  {
    id: 28,
    domain: 1,
    scenario: 5,
    taskStatement: "1.6: Task decomposition strategies",
    question: "A CI pipeline needs to review a PR that modifies 15 files across 3 modules. The review should check each file for bugs and also verify cross-module interface compatibility. Which decomposition approach best handles this?",
    options: [
      { label: "A", text: "A fixed sequential pipeline: check file 1 for bugs, then file 2 for bugs, ..., then file 15, then check interfaces. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Three module-level agents that each review only their own module's files with no cross-module analysis. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "A single agent that reviews all 15 files in one pass for both bugs and interface compatibility. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Per-file analysis for bug checking (each file reviewed independently) followed by a cross-file integration pass focused on interface compatibility across the 3 modules." }
    ],
    correctAnswer: "D",
    explanation: "This mirrors the per-file analysis + cross-file integration pattern. Per-file bug checking can be parallelized across the 15 files for speed, and each file gets focused analysis. The cross-file integration pass then specifically examines how the 3 modules interact, catching interface mismatches that per-file analysis would miss. \"A fixed sequential pipeline: check file 1 for bugs, then file 2 for bugs, ..., then file 15,…\" is unnecessarily sequential. \"A single agent that reviews all 15 files in one pass for both bugs and interface compatibility\" risks context window issues and may miss details with so many files. \"Per-file analysis for bug checking (each file reviewed independently) followed by a cross-fi…\" misses the critical cross-module interface compatibility check."
  },
  {
    id: 29,
    domain: 1,
    scenario: 4,
    taskStatement: "1.6: Task decomposition strategies",
    question: "A developer asks Claude to generate a complete CRUD API with 10 endpoints. One approach uses prompt chaining (a fixed sequential pipeline): generate models, then controllers, then routes, then tests. Another uses dynamic adaptive decomposition where the agent decides the order. When is the fixed pipeline preferable?",
    options: [
      { label: "A", text: "Never; dynamic decomposition is always superior. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "When the developer wants the agent to be creative about the API design. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "When the task has a well-understood, predictable structure with clear dependencies (models before controllers before routes), the fixed pipeline is simpler, more predictable, and easier to debug." },
      { label: "D", text: "When the number of endpoints exceeds 20. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "C",
    explanation: "Fixed sequential pipelines (prompt chaining) excel when the task structure is well-understood and predictable. Generating a CRUD API has clear dependencies: models define the data, controllers use models, routes map to controllers, tests cover everything. This predictability makes a fixed pipeline simpler to implement, easier to debug, and more reliable than dynamic decomposition. \"Never; dynamic decomposition is always superior\" is dogmatic - the right decomposition depends on the task. \"When the task has a well-understood, predictable structure with clear dependencies (models b…\" conflates decomposition strategy with creative freedom. \"When the number of endpoints exceeds 20\" is arbitrary and unrelated to the choice between fixed and dynamic decomposition."
  },
  {
    id: 30,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "The coordinator in your research system uses dynamic adaptive decomposition. After the web search subagent returns results, the coordinator realizes the research question requires a different type of analysis than originally planned. What is the key advantage of dynamic decomposition in this situation?",
    options: [
      { label: "A", text: "The coordinator can adapt its plan based on intermediate results, adding or modifying subtasks that were not in the original decomposition." },
      { label: "B", text: "Dynamic decomposition is cheaper because it uses fewer API calls. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Dynamic decomposition is faster because all subtasks run in parallel. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "The coordinator can change the model used by each subagent mid-execution. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "The key advantage of dynamic adaptive decomposition over fixed pipelines is the ability to react to intermediate results. If web search reveals the question requires statistical analysis rather than the originally planned qualitative analysis, the coordinator can adjust by spawning a different type of subagent. Fixed pipelines cannot adapt because the steps are predetermined. \"The coordinator can adapt its plan based on intermediate results, adding or modifying subtas…\" is wrong - dynamic decomposition often uses more API calls due to the coordinator's reasoning overhead. \"Dynamic decomposition is faster because all subtasks run in parallel\" conflates parallelism with dynamism. \"The coordinator can change the model used by each subagent mid-execution\" describes a capability unrelated to decomposition strategy."
  },
  {
    id: 31,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer is using Claude Code to refactor a large module. After making changes to 5 files, they need to take a break and continue tomorrow. They used `--resume` with a named session. When they resume, what is preserved?",
    options: [
      { label: "A", text: "Only the last tool call and its result are preserved; previous context is discarded. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "The file changes are preserved, but the conversation context is lost. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Only the system prompt is preserved; the developer must re-explain what they were working on. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The full conversation history including all tool calls, results, and the model's reasoning, allowing the developer to continue exactly where they left off." }
    ],
    correctAnswer: "D",
    explanation: "When using --resume with a session name, the full conversation history is preserved. This includes every message, tool call, tool result, and model response. The developer can continue the refactoring session with full context of what was already done. \"Only the last tool call and its result are preserved; previous context is discarded\" incorrectly discards history. \"Only the system prompt is preserved; the developer must re-explain what they were working on\" loses all the work context. \"The full conversation history including all tool calls, results, and the model's reasoning, …\" conflates filesystem state with session state - file changes persist on disk regardless, but the conversation context is what --resume preserves."
  },
  {
    id: 32,
    domain: 1,
    scenario: 4,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer is exploring two different refactoring approaches for a legacy system. They want to evaluate both approaches independently without one polluting the other's context. Which feature is designed for this use case?",
    options: [
      { label: "A", text: "Open two terminal windows and run the same session in both. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use fork_session to create two independent branches from the current conversation state, each exploring a different approach with its own context." },
      { label: "C", text: "Use --resume to switch between two named sessions, manually re-explaining the context each time. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Copy the conversation log to a file and paste it into a new session. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "fork_session is designed exactly for this scenario - parallel exploration of different approaches. It creates independent branches from the current conversation state, so both explorations start with the same context (understanding of the legacy system) but then diverge independently. \"Open two terminal windows and run the same session in both\" would cause conflicts with the same session state. \"Use --resume to switch between two named sessions, manually re-explaining the context each time\" requires manual context management and loses the shared starting point. \"Copy the conversation log to a file and paste it into a new session\" is error-prone and loses the structured session state."
  },
  {
    id: 33,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer has been working in a long Claude Code session for 3 hours. The context window is nearly full, and the agent's responses are becoming less coherent. What is the recommended approach?",
    options: [
      { label: "A", text: "Continue the session and hope the model handles the long context. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use fork_session to create a branch, which automatically compresses the context. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Delete the session and start completely from scratch with no context. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Start a fresh session with a concise summary of the current state and remaining tasks, rather than resuming the stale session." }
    ],
    correctAnswer: "D",
    explanation: "When a session becomes stale with a nearly full context window, starting fresh with a summary is the recommended approach. The summary preserves the essential decisions, completed work, and remaining tasks without carrying the full weight of 3 hours of tool calls and intermediate reasoning. \"Continue the session and hope the model handles the long context\" ignores a known degradation problem. \"Delete the session and start completely from scratch with no context\" loses all context unnecessarily - a summary preserves the important parts. \"Start a fresh session with a concise summary of the current state and remaining tasks, rathe…\" is wrong because fork_session does not compress context; it copies it, so both branches would have the same context window pressure."
  },
  {
    id: 34,
    domain: 1,
    scenario: 5,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "Your CI pipeline uses Claude Code to review PRs. Each PR review starts a new session. A developer argues that sessions should be resumed across multiple PRs to build up 'knowledge' about the codebase over time. Why is this problematic?",
    options: [
      { label: "A", text: "Resuming sessions is not supported in CI environments. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Long-running sessions accumulate stale context from previous PRs (old file contents, resolved issues) that can confuse the agent and lead to reviews based on outdated information." },
      { label: "C", text: "Session resumption costs more because Anthropic charges per-session fees. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use the same named session for every PR so the agent inherits repository-wide 'memory' of past reviews. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Resuming sessions across PRs accumulates stale results. The agent would carry context about previous PRs' file states, issues, and discussions, which may conflict with the current PR's changes. For example, if a file was refactored in PR #42, the agent reviewing PR #43 with the resumed session might reference the pre-refactoring state. Fresh sessions with relevant context (like CLAUDE.md and project conventions) are more reliable for CI. \"Resuming sessions is not supported in CI environments\" is a technical claim that is not necessarily true. \"Session resumption costs more because Anthropic charges per-session fees\" describes a non-existent pricing model. Reusing one named session across all PRs sounds efficient but bakes outdated diffs and review threads into the next run."
  },
  {
    id: 35,
    domain: 1,
    scenario: 4,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer uses --resume with a named session 'auth-refactor' to continue work from yesterday. The codebase has changed significantly since then because a colleague merged a large PR overnight. What risk does this create?",
    options: [
      { label: "A", text: "The resumed session's context contains stale file contents and analysis from yesterday. The agent may reference outdated code, make assumptions based on removed functions, or suggest changes that conflict with the colleague's merged work." },
      { label: "B", text: "No risk; the resumed session will automatically detect and adapt to codebase changes. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "The risk is only that the session will be slower to load. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "The resumed session will crash if it detects file changes. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "This is the stale context problem with session resumption. The session was saved with yesterday's codebase state in its conversation history. Tool results from reading files contain yesterday's content. The model's reasoning and plans reference yesterday's code structure. After a significant codebase change, this stale context can lead the agent to make incorrect assumptions. The developer should either start a fresh session with a summary of remaining tasks or at minimum have the agent re-read changed files before continuing. \"The resumed session's context contains stale file contents and analysis from yesterday\" is wrong - there is no automatic change detection. \"The risk is only that the session will be slower to load\" understates the risk. \"The resumed session will crash if it detects file changes\" is wrong - sessions do not crash on external changes."
  },
  {
    id: 36,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "You want to test whether Claude Code generates better React components using TypeScript or JavaScript for your project. Using fork_session from your current session (which has project context loaded), you create two branches. What is true about the forked sessions?",
    options: [
      { label: "A", text: "Both forks share live state - changes in one appear in the other. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The original session is deleted when forks are created. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Each fork is an independent copy of the conversation state at the point of forking. Changes in one fork do not affect the other, allowing genuine parallel experimentation." },
      { label: "D", text: "Forks can only be created from the beginning of a session, not from the current point. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "fork_session creates independent copies of the conversation state at the point of forking. Each fork then evolves independently - the TypeScript branch and JavaScript branch will have different tool calls, results, and reasoning from the fork point onward, while sharing the same pre-fork context about the project. \"Both forks share live state - changes in one appear in the other\" describes shared mutable state, which would defeat the purpose of forking. \"Each fork is an independent copy of the conversation state at the point of forking\" is wrong - the original session is preserved. \"Forks can only be created from the beginning of a session, not from the current point\" is wrong - forking happens at the current point in the conversation, which is the whole purpose."
  },
  {
    id: 37,
    domain: 1,
    scenario: 1,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "Your customer support system has grown to include a billing specialist subagent, a technical support subagent, and a returns subagent. The coordinator routes tickets to the appropriate subagent. A new requirement says that complex tickets may need input from multiple subagents. In hub-and-spoke, how should this be handled?",
    options: [
      { label: "A", text: "Have the billing subagent call the technical support subagent directly when it detects a technical issue. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Run all three subagents simultaneously and let the customer choose which result to use. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Create a new 'multi-specialist' subagent that has all the tools of billing, technical, and returns combined. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The coordinator delegates to the billing subagent first, collects its result, then delegates to the technical support subagent with relevant context from the billing analysis, and finally synthesizes both results." }
    ],
    correctAnswer: "D",
    explanation: "In hub-and-spoke, the coordinator manages all cross-subagent coordination. It delegates to each specialist sequentially (or in parallel if independent), collects results, and synthesizes them. The coordinator passes relevant context from one subagent's results to the next. \"Have the billing subagent call the technical support subagent directly when it detects a tec…\" violates hub-and-spoke by having lateral communication between subagents. \"Create a new 'multi-specialist' subagent that has all the tools of billing, technical, and r…\" collapses the separation of concerns that makes the multi-agent architecture valuable. \"The coordinator delegates to the billing subagent first, collects its result, then delegates…\" puts coordination burden on the customer, which is a poor experience."
  },
  {
    id: 38,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "Your research system receives the query: 'Compare the environmental policies of the G7 nations and predict their impact on carbon emissions by 2030.' The coordinator must decompose this. Which decomposition avoids the 'too narrow' anti-pattern?",
    options: [
      { label: "A", text: "Create 7 subagents, one per nation, each analyzing only their assigned country's policy in complete isolation. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Create 7 per-country analysis subagents, then a cross-country comparison subagent that receives all 7 analyses and identifies patterns, contrasts, and combined emissions projections." },
      { label: "C", text: "Send the entire query to a single subagent and let it handle everything. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Create 21 subagents: 7 for policy extraction, 7 for impact analysis, and 7 for prediction. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "The query explicitly asks for comparison and combined impact, which requires cross-country analysis. \"Create 7 subagents, one per nation, each analyzing only their assigned country's policy in c…\" decomposes too narrowly - 7 isolated country analyses will miss the comparison and combined emissions prediction that the query requires. \"Create 7 per-country analysis subagents, then a cross-country comparison subagent that recei…\" correctly uses per-country analysis (the 'per-file' pattern) followed by a cross-file integration pass for comparison and synthesis. \"Send the entire query to a single subagent and let it handle everything\" lacks parallelism and may exceed context limits. \"Create 21 subagents: 7 for policy extraction, 7 for impact analysis, and 7 for prediction\" over-decomposes, creating unnecessary coordination overhead without clear benefit."
  },
  {
    id: 39,
    domain: 1,
    scenario: 6,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your data extraction agent processes invoices from multiple vendors. Some vendors use 'MM/DD/YYYY' dates, others use 'DD-MM-YYYY'. You need all dates stored in ISO 8601 format (YYYY-MM-DD). You implement a PostToolUse hook for normalization. Why is this preferable to having the model normalize dates in-context?",
    options: [
      { label: "A", text: "A PostToolUse hook applies a deterministic date parsing algorithm that handles all vendor formats consistently, while the model might misinterpret ambiguous dates like '03/04/2025' (March 4 vs April 3) differently depending on context." },
      { label: "B", text: "PostToolUse hooks run faster than model inference. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Rely on the model to normalize every date in the assistant message text after tool output, using a single global locale assumption. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "PostToolUse hooks can access the internet to verify dates. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "Date normalization is a classic case where deterministic hooks outperform probabilistic model reasoning. A date like '03/04/2025' is genuinely ambiguous - it could be March 4 or April 3 depending on the vendor's locale. A deterministic hook can apply vendor-specific parsing rules consistently, while the model might interpret it differently based on surrounding context or make inconsistent choices across documents. Speed (B) is not the main win. Normalizing only in free-form assistant prose with one global locale (C) still leaves ambiguity and drift across documents. Hooks do not inherently gain internet access to verify dates (D)."
  },
  {
    id: 40,
    domain: 1,
    scenario: 2,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "In a Claude Code workflow, a developer wants to ensure that every generated file is added to the project's CLAUDE.md as a documented module before the session ends. A teammate suggests using a prompt: 'Remember to update CLAUDE.md before finishing.' Why is this insufficient for a team-wide standard?",
    options: [
      { label: "A", text: "CLAUDE.md is read-only and cannot be updated by the model. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "CLAUDE.md is not part of the Claude Code workflow. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Prompt-based guidance is probabilistic. Under context pressure or complex sessions, the model may forget this instruction. For a team-wide standard, a programmatic hook that checks whether CLAUDE.md was updated with new module entries before allowing the session to end would provide reliable enforcement." },
      { label: "D", text: "The prompt instruction is sufficient; programmatic enforcement is overkill for documentation tasks. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "C",
    explanation: "For team-wide standards, programmatic enforcement is necessary because prompt-based guidance fails probabilistically. In long sessions with many tool calls, the instruction to update CLAUDE.md can be lost in context. A hook that verifies CLAUDE.md was modified to include new module entries before allowing session completion ensures 100% compliance. \"CLAUDE.md is read-only and cannot be updated by the model\" is wrong - CLAUDE.md can be written to. \"Prompt-based guidance is probabilistic\" is wrong - CLAUDE.md is central to Claude Code workflows. \"The prompt instruction is sufficient; programmatic enforcement is overkill for documentation…\" is wrong - if it is a team standard, occasional non-compliance creates inconsistency."
  },
  // ============================================================
  // DOMAIN 2: Tool Design & MCP Integration (27 questions)
  // ============================================================

  {
    id: 41,
    domain: 2,
    scenario: 1,
    taskStatement: "2.1: Effective tool interfaces",
    question: "You are defining the tool descriptions for the customer support agent's four tools: get_customer, lookup_order, process_refund, and escalate_to_human. The get_customer description says: 'Gets customer information.' Why is this description inadequate?",
    options: [
      { label: "A", text: "The description needs to be in JSON format. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The description is fine; tool descriptions are not important because the model selects tools based on their names. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The description should include the tool's implementation code. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "The description is too short. Tool descriptions are the primary mechanism for LLM tool selection and should include input formats, expected parameters, edge cases, and boundaries of what the tool can and cannot do." }
    ],
    correctAnswer: "D",
    explanation: "Tool descriptions are the primary mechanism the LLM uses to decide which tool to call and with what parameters. A description like 'Gets customer information' does not tell the model: what input is expected (email? customer ID? phone number?), what information is returned (name, order history, account status?), edge cases (what happens if the customer is not found?), or boundaries (does it return payment info or just profile data?). \"The description is fine; tool descriptions are not important because the model selects tools…\" is wrong - descriptions are far more important than names for tool selection. \"The description should include the tool's implementation code\" confuses description with implementation. \"The description is too short\" confuses format with content."
  },
  {
    id: 42,
    domain: 2,
    scenario: 1,
    taskStatement: "2.1: Effective tool interfaces",
    question: "The customer support agent has two tools: lookup_order (description: 'Look up an order by order ID to get order details, shipping status, and item list') and get_customer (description: 'Look up customer information including their recent orders and order history'). The agent frequently calls get_customer when it should call lookup_order for a specific order. What is the most likely cause?",
    options: [
      { label: "A", text: "The model is randomly selecting tools. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "The tool descriptions overlap - both mention 'orders', making it ambiguous which tool to use when the agent needs order information. The descriptions should clearly delineate boundaries." },
      { label: "C", text: "The model prefers tools with shorter names. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "lookup_order should be renamed to something more descriptive. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "B",
    explanation: "When tool descriptions overlap, the LLM cannot reliably distinguish which tool to use for a given situation. Both tools mention orders, so when the agent needs order info, it is ambiguous whether to use lookup_order (specific order by ID) or get_customer (includes order history). The fix is to make descriptions clearly delineate boundaries: get_customer should say 'Returns customer profile and account status. For detailed order information, use lookup_order instead.' \"The model is randomly selecting tools\" is wrong - models do not randomly select tools. \"The model prefers tools with shorter names\" is wrong - name length does not drive selection. \"lookup_order should be renamed to something more descriptive\" focuses on naming when the description overlap is the real issue."
  },
  {
    id: 43,
    domain: 2,
    scenario: 6,
    taskStatement: "2.1: Effective tool interfaces",
    question: "You are designing an extraction tool for a structured data pipeline. The tool extracts fields from invoice documents. Which tool description best follows interface design best practices?",
    options: [
      { label: "A", text: "'Extracts data from invoices.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "'Extract structured fields from an invoice document. Input: document_text (string, required) - the full text content of the invoice. Output: JSON object with fields: vendor_name (string), invoice_date (ISO 8601), line_items (array of {description, quantity, unit_price}), total (number). Returns null for fields not found in the document. Does NOT validate the extracted data - use validate_extraction for validation.'" },
      { label: "C", text: "'Takes a document and returns JSON. See API docs for details.'. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "'Invoice tool - handles everything related to invoices including extraction, validation, and storage.'. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "\"'Extract structured fields from an invoice document\" follows all best practices for tool descriptions: it specifies the input format and type, describes the output schema with field types, explains edge case behavior (null for missing fields), and clearly delineates boundaries (extraction only, not validation). \"'Extracts data from invoices.'\" is too vague. \"'Takes a document and returns JSON\" references external docs the model cannot read. \"'Invoice tool - handles everything related to invoices including extraction, validation, and…\" describes a tool that does too many things and overlaps with other tools (validation, storage), creating confusion about tool selection."
  },
  {
    id: 44,
    domain: 2,
    scenario: 4,
    taskStatement: "2.1: Effective tool interfaces",
    question: "A developer creates a tool called 'analyze_code' with the description: 'Analyzes code for bugs, performance issues, security vulnerabilities, style violations, and generates documentation.' Why is this tool design problematic?",
    options: [
      { label: "A", text: "A tool that does too many things makes it hard for the model to know when to use it, and the broad scope means its description will overlap with more focused tools. Single-responsibility tools with clear boundaries are easier for the model to select correctly." },
      { label: "B", text: "The tool name is too generic. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The tool should also include test generation to be complete. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "The description is too long. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "A",
    explanation: "Tools should follow single-responsibility principles. A tool that analyzes bugs, performance, security, style, and generates docs has so many responsibilities that its description will inevitably overlap with any focused tool for those individual tasks. The model will struggle to decide when to use this broad tool vs. specialized tools. Better to have separate tools: check_bugs, check_performance, check_security, check_style, generate_docs, each with clear boundaries. \"A tool that does too many things makes it hard for the model to know when to use it, and the…\" is a minor concern compared to the scope issue. \"The tool should also include test generation to be complete\" would make the problem worse. \"The description is too long\" misidentifies the issue - length is fine if the content is focused."
  },
  {
    id: 45,
    domain: 2,
    scenario: 1,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "The customer support agent calls lookup_order with an order ID, but the order database is temporarily unavailable. The tool returns: 'Error: Could not find order.' The agent tells the customer the order does not exist. What is wrong with this error response design?",
    options: [
      { label: "A", text: "The error message is too short. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Error messages should always be in JSON format. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "The error response fails to distinguish between a transient failure (database unavailable) and a valid empty result (order not found). A structured error with isError: true, errorCategory: 'transient', and isRetryable: true would let the agent retry rather than reporting a false negative to the customer." },
      { label: "D", text: "The tool should never return errors; it should return a default order instead. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "C",
    explanation: "This illustrates a critical distinction in MCP error design: access failures vs. valid empty results. A database timeout is a transient error that should be retried, while 'order not found' is a valid result. The error response 'Could not find order' is ambiguous - the model cannot tell which case occurred. Structured error responses with isError, errorCategory ('transient' vs 'validation' vs 'permission'), and isRetryable fields give the model the information it needs to respond appropriately. \"The error message is too short\" misses the structural issue. \"The error response fails to distinguish between a transient failure (database unavailable) a…\" focuses on format, not semantics. \"The tool should never return errors; it should return a default order instead\" would return incorrect data."
  },
  {
    id: 46,
    domain: 2,
    scenario: 6,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "Your extraction tool encounters an invoice PDF that is password-protected and cannot be read. Which structured error response best helps the agent handle this situation?",
    options: [
      { label: "A", text: "{ \"result\": null }. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "\"Error reading document\". It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "{ \"isError\": true, \"errorCategory\": \"transient\", \"message\": \"Document read failed\", \"isRetryable\": true }. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "{ \"isError\": true, \"errorCategory\": \"permission\", \"message\": \"Document is password-protected and cannot be read. Requires password or unprotected version.\", \"isRetryable\": false }" }
    ],
    correctAnswer: "D",
    explanation: "\"{ \"isError\": true, \"errorCategory\": \"transient\", \"message\": \"Document read failed\", \"isRetry…\" provides the correct structured error response. isError: true signals this is an error, not a valid empty result. errorCategory: 'permission' accurately categorizes the issue (access/permission problem). The message explains the specific issue and what would be needed to resolve it. isRetryable: false correctly indicates that retrying will not help - the document needs a password. \"{ \"result\": null }\" returns null, which the agent might interpret as 'no data found' rather than an access error. \"\"Error reading document\"\" is an unstructured string. \"{ \"isError\": true, \"errorCategory\": \"permission\", \"message\": \"Document is password-protected…\" incorrectly marks it as transient and retryable - retrying a password-protected PDF will fail every time."
  },
  {
    id: 47,
    domain: 2,
    scenario: 3,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "The web search tool in your research system hits a rate limit from the search API. The tool returns: { isError: true, errorCategory: 'transient', message: 'Rate limited by search API. Retry after 30 seconds.', isRetryable: true }. What should a well-designed agent do with this response?",
    options: [
      { label: "A", text: "Report to the user that web search is permanently unavailable. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Switch to a different search engine immediately. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Recognize the transient, retryable error and wait before retrying the search, or proceed with other available information and retry the search later." },
      { label: "D", text: "Ignore the error and use the partial results. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "The structured error response gives the agent clear signals: isRetryable: true means the operation will likely succeed later, errorCategory: 'transient' means this is temporary, and the message suggests waiting 30 seconds. A well-designed agent should either wait and retry or continue with other tasks (like document analysis) and come back to the web search. \"Report to the user that web search is permanently unavailable\" misinterprets a transient error as permanent. \"Recognize the transient, retryable error and wait before retrying the search, or proceed wit…\" is an overreaction to a temporary issue. \"Ignore the error and use the partial results\" ignores the error entirely - there are no partial results from a rate-limited request."
  },
  {
    id: 48,
    domain: 2,
    scenario: 5,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "Your CI agent's Bash tool runs a test suite that finds zero test failures. The tool returns: { \"exitCode\": 0, \"stdout\": \"0 tests failed, 150 passed\", \"stderr\": \"\" }. The agent interprets this as an error because '0 tests failed' contains the word 'failed'. What error response improvement would prevent this misinterpretation?",
    options: [
      { label: "A", text: "Include an explicit isError: false in the tool result when the command succeeds, so the agent has a structured signal rather than relying on text parsing of stdout." },
      { label: "B", text: "Remove the word 'failed' from the test output formatting. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Set the model temperature to 0 to prevent misinterpretation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Add a prompt instruction: 'exitCode 0 means success.'. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "A structured isError field gives the agent a definitive signal about whether the tool call succeeded, independent of the text content. When isError: false is present alongside exitCode: 0, the agent has two structured signals confirming success, regardless of what words appear in stdout. \"Include an explicit isError: false in the tool result when the command succeeds, so the agen…\" modifies the test framework output, which may not be feasible. \"Set the model temperature to 0 to prevent misinterpretation\" does not prevent text misinterpretation. \"Add a prompt instruction: 'exitCode 0 means success.'\" helps but is probabilistic compared to a structured field."
  },
  {
    id: 49,
    domain: 2,
    scenario: 1,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your customer support system has grown to include 18 tools: get_customer, lookup_order, process_refund, escalate_to_human, check_inventory, update_shipping, apply_coupon, cancel_order, send_email, create_ticket, close_ticket, add_note, transfer_agent, check_warranty, initiate_return, track_package, update_address, and verify_identity. The agent is increasingly making incorrect tool selections. What is the most likely cause?",
    options: [
      { label: "A", text: "The model needs a higher max_tokens setting to consider all tools. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "The tools need to be listed in alphabetical order. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Having 18 tools available to a single agent degrades tool selection reliability. The tool set should be scoped per agent role, giving each specialized subagent only the tools relevant to its function." },
      { label: "D", text: "The model is too old; a newer version will handle 18 tools fine. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "C",
    explanation: "Research and practice show that too many tools (around 18+) degrades the LLM's ability to reliably select the correct tool. The solution is to scope tool access per agent role: a refund specialist gets process_refund, lookup_order, and get_customer; a shipping specialist gets track_package, update_shipping, and update_address; etc. The coordinator routes to the right specialist, which has a manageable tool set. \"The model needs a higher max_tokens setting to consider all tools\" is unrelated to tool selection quality. \"Having 18 tools available to a single agent degrades tool selection reliability\" has no effect on selection. \"The model is too old; a newer version will handle 18 tools fine\" deflects from the architectural issue."
  },
  {
    id: 50,
    domain: 2,
    scenario: 3,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "In your multi-agent research system, you want the web search subagent to always use the search tool on its first turn rather than starting with reasoning text. Which tool_choice configuration achieves this?",
    options: [
      { label: "A", text: "tool_choice: \"auto\" - lets the model decide freely. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "tool_choice: { type: \"tool\", name: \"web_search\" } - forces the model to call the web_search tool specifically." },
      { label: "C", text: "tool_choice: \"any\" - forces the model to use some tool but does not specify which one. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "tool_choice: \"none\" - prevents tool use entirely. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Forced tool selection with tool_choice: { type: \"tool\", name: \"web_search\" } guarantees the model calls web_search on its first turn, skipping any preliminary reasoning text. This is useful when you know the first action should always be a specific tool call. \"tool_choice: \"auto\" - lets the model decide freely\" (\"auto\") lets the model choose freely, which may result in reasoning text before the search. \"tool_choice: { type: \"tool\", name: \"web_search\" } - forces the model to call the web_search …\" (\"any\") forces a tool call but the model might pick the wrong tool if multiple are available. \"tool_choice: \"none\" - prevents tool use entirely\" disables tools entirely."
  },
  {
    id: 51,
    domain: 2,
    scenario: 5,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your CI pipeline has a security review subagent and a style review subagent. The security subagent has tools: run_sast_scan, check_dependencies, verify_secrets_not_exposed. The style subagent has tools: run_linter, check_formatting, verify_naming_conventions. A developer proposes giving both subagents all 6 tools 'for flexibility.' Why is this a bad idea?",
    options: [
      { label: "A", text: "Scoped tool access ensures each subagent stays focused on its role. Giving the security agent style tools means it might waste time running the linter instead of focusing on security analysis, and vice versa." },
      { label: "B", text: "The tools will conflict if both agents try to run them simultaneously. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "The API does not allow the same tool to be assigned to multiple agents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Six tools is too many for any single agent. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "Scoped tool access is a key principle of multi-agent tool distribution. Each subagent should only have tools relevant to its role, which keeps it focused and prevents role confusion. The security subagent with access to run_linter might decide to check style issues instead of focusing on its security mandate. Scoped access also improves tool selection reliability by reducing the number of options. \"Scoped tool access ensures each subagent stays focused on its role\" describes a different concern (concurrency). \"The API does not allow the same tool to be assigned to multiple agents\" is technically wrong. \"Six tools is too many for any single agent\" - 6 tools is manageable but still more than each agent needs."
  },
  {
    id: 52,
    domain: 2,
    scenario: 4,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "A developer is using Claude for codebase exploration. The agent has tool_choice: \"auto\" and access to Read, Grep, Glob, Bash, Edit, and Write. The developer notices the agent sometimes generates long reasoning text before its first tool call, slowing exploration. What tool_choice setting would improve the initial response for a codebase exploration task?",
    options: [
      { label: "A", text: "tool_choice: \"none\" to force pure reasoning first. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Remove all tools except Read to simplify the choice. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "tool_choice: { type: \"tool\", name: \"Bash\" } to always start with a shell command. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "tool_choice: \"any\" to force the agent to start with a tool call rather than generating reasoning text." }
    ],
    correctAnswer: "D",
    explanation: "tool_choice: \"any\" forces the model to call some tool rather than generating text, which eliminates the initial reasoning preamble. For codebase exploration, the first action should almost always be a tool call (Grep, Glob, or Read), so forcing a tool call upfront improves responsiveness. \"tool_choice: \"none\" to force pure reasoning first\" prevents tool use entirely, which is counterproductive for exploration. \"tool_choice: { type: \"tool\", name: \"Bash\" } to always start with a shell command\" forces a specific tool that may not be the best first step. \"tool_choice: \"any\" to force the agent to start with a tool call rather than generating reaso…\" removes essential exploration tools."
  },
  {
    id: 53,
    domain: 2,
    scenario: 2,
    taskStatement: "2.4: Integrate MCP servers",
    question: "A development team wants to connect their Claude Code setup to a custom MCP server that provides access to their internal documentation and API specs. Where should the MCP server configuration be placed so it is shared across the team?",
    options: [
      { label: "A", text: "In each developer's ~/.claude.json file. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "In the project-level .mcp.json file, which is committed to the repository and shared across all team members." },
      { label: "C", text: "In the system prompt as a text description of the MCP server. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "In an environment variable that each developer sets manually. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Project-level .mcp.json is the correct location for team-shared MCP server configurations. It is committed to the repository, ensuring all team members have the same MCP server access without individual setup. \"In each developer's ~/.claude.json file\" (user-level ~/.claude.json) is for personal MCP servers that should not be shared, like individual developer tools. \"In the system prompt as a text description of the MCP server\" is not how MCP servers are configured. \"In an environment variable that each developer sets manually\" requires manual setup per developer, which is error-prone and not version-controlled."
  },
  {
    id: 54,
    domain: 2,
    scenario: 2,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your .mcp.json needs to include credentials for an internal MCP server. The API key should not be committed to the repository. How should the credential be handled in .mcp.json?",
    options: [
      { label: "A", text: "Hardcode the API key directly in .mcp.json since it is only used by developers. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Store the API key in a separate .env file and reference it by filename. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Use environment variable expansion in .mcp.json (e.g., { \"apiKey\": \"${INTERNAL_API_KEY}\" }) so the actual credential is stored in each developer's environment, not in the repository." },
      { label: "D", text: "Encrypt the API key and store the encrypted version in .mcp.json. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "C",
    explanation: "Environment variable expansion in .mcp.json is the designed mechanism for handling credentials. The .mcp.json file uses ${VARIABLE_NAME} syntax, and the actual credential is stored in the developer's environment (e.g., via .bashrc, .env file, or secrets manager). This keeps the credential out of version control while allowing the MCP server configuration to be shared. \"Hardcode the API key directly in .mcp.json since it is only used by developers\" commits secrets to the repo, which is a security anti-pattern. \"Use environment variable expansion in .mcp.json (e.g., { \"apiKey\": \"${INTERNAL_API_KEY}\" }) …\" describes a mechanism that is not how .mcp.json works. \"Encrypt the API key and store the encrypted version in .mcp.json\" adds complexity without using the built-in mechanism."
  },
  {
    id: 55,
    domain: 2,
    scenario: 4,
    taskStatement: "2.4: Integrate MCP servers",
    question: "A developer has a personal MCP server that connects to their private note-taking system. They do not want this configuration shared with the team. Where should this MCP server be configured?",
    options: [
      { label: "A", text: "In the user-level ~/.claude.json, which is personal to the developer and not committed to any repository." },
      { label: "B", text: "In the project-level .mcp.json so the team can also access their notes. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "In a separate .mcp-personal.json file in the project directory. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "In the CLAUDE.md file as a tool description. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "User-level ~/.claude.json is designed for personal MCP server configurations that should not be shared with the team. It is stored in the developer's home directory, not in any project repository. \"In the user-level ~/.claude.json, which is personal to the developer and not committed to an…\" would expose personal notes to the entire team. \"In a separate .mcp-personal.json file in the project directory\" uses a non-standard configuration file that Claude Code does not recognize. \"In the CLAUDE.md file as a tool description\" confuses project instructions with MCP server configuration."
  },
  {
    id: 56,
    domain: 2,
    scenario: 6,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your structured data extraction system uses an MCP server that exposes a catalog of JSON schemas for different document types (invoices, receipts, purchase orders). In MCP terminology, these schema catalogs are best represented as:",
    options: [
      { label: "A", text: "MCP tools, each returning a specific schema when called. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "MCP prompts, which are reusable prompt templates. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "MCP resources, which serve as content catalogs that the agent can browse and reference without executing actions." },
      { label: "D", text: "MCP hooks, which intercept tool calls. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "MCP resources are the appropriate abstraction for content catalogs like schema collections. Resources represent data that can be browsed and referenced - they are informational, not action-oriented. The JSON schema catalog is a reference the agent consults when deciding how to structure its extraction output. \"MCP tools, each returning a specific schema when called\" (tools) are for performing actions, not serving reference content. \"MCP resources, which serve as content catalogs that the agent can browse and reference witho…\" (prompts) are reusable prompt templates, not content catalogs. \"MCP hooks, which intercept tool calls\" is not an MCP concept in this context."
  },
  {
    id: 57,
    domain: 2,
    scenario: 4,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A developer asks Claude to find all files in the project that contain the function name 'calculateTax'. Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Glob - it searches for file name patterns. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Read - read every file in the project and search manually." },
      { label: "C", text: "Bash - run 'find . -name calculateTax' to locate the files." },
      { label: "D", text: "Grep - it searches for content patterns within files." }
    ],
    correctAnswer: "D",
    explanation: "Grep is the built-in tool designed for searching content within files. It finds all files containing a specific text pattern or regex, which is exactly what is needed to find occurrences of 'calculateTax'. \"Glob - it searches for file name patterns\" (Glob) searches for file name patterns (e.g., '*.ts'), not file content. \"Read - read every file in the project and search manually.\" (Read) would require reading every file, which is extremely inefficient. \"Grep - it searches for content patterns within files.\" (Bash) could work but find searches file names, not content - you would need 'grep -r', and the built-in Grep tool is the idiomatic choice."
  },
  {
    id: 58,
    domain: 2,
    scenario: 2,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "Claude Code needs to rename a variable from 'userEmail' to 'customerEmail' in a specific file. The variable appears 12 times in the file. Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Read the file, then Write the entire file with all 12 occurrences changed. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use Edit with replace_all to find 'userEmail' and replace with 'customerEmail' across all occurrences in the file." },
      { label: "C", text: "Use Bash to run sed to do a find-and-replace. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use Grep to find all occurrences, then Edit each one individually. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "The Edit tool with replace_all is designed for exactly this use case - replacing all occurrences of a specific string within a file. It sends only the diff, making it efficient. \"Read the file, then Write the entire file with all 12 occurrences changed\" works but is wasteful - Read + Write sends the entire file content twice when only the variable name changes. \"Use Bash to run sed to do a find-and-replace\" uses Bash as a workaround when a built-in tool exists for the task. \"Use Grep to find all occurrences, then Edit each one individually\" makes 12 individual Edit calls when a single replace_all handles all occurrences."
  },
  {
    id: 59,
    domain: 2,
    scenario: 5,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A CI agent needs to find all TypeScript test files in the project (files matching the pattern '*.test.ts' or '*.spec.ts'). Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Grep with the pattern '*.test.ts'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Glob with patterns like '**/*.test.ts' and '**/*.spec.ts'" },
      { label: "C", text: "Read the src directory and look for test files. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Bash with 'ls -R | grep test'. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Glob is the built-in tool designed for finding files by name pattern. It supports patterns like '**/*.test.ts' to recursively find all TypeScript test files. \"Grep with the pattern '*.test.ts'\" is wrong because Grep searches file content, not file names. \"Read the src directory and look for test files\" is wrong because Read operates on individual files, not directories, and would be extremely inefficient. \"Bash with 'ls -R | grep test'\" could work but uses Bash as a workaround when the dedicated Glob tool exists for this exact purpose."
  },
  {
    id: 60,
    domain: 2,
    scenario: 4,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "Claude Code attempts to use Edit to change a function signature, but the old_string parameter matches multiple locations in the file, causing the Edit to fail. What is the recommended recovery approach?",
    options: [
      { label: "A", text: "Provide more surrounding context in old_string to make it unique, or if that is not possible, use Read to get the full file content and Write to replace the entire file." },
      { label: "B", text: "Use Bash with sed to make the change instead. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Delete the file and recreate it with the changes. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use Grep to find the exact line number, then use Edit with just that line. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "When Edit fails due to non-unique matching, the first approach is to include more surrounding context in old_string to make it uniquely identify the target location. If the text truly cannot be made unique (e.g., identical function signatures in different code blocks), the fallback is Read + Write to replace the entire file. \"Provide more surrounding context in old_string to make it unique, or if that is not possible…\" uses an external tool when built-in tools can handle it. \"Delete the file and recreate it with the changes\" is destructive and unnecessary. \"Use Grep to find the exact line number, then use Edit with just that line\" misunderstands Edit - it matches text content, not line numbers, and a single line may still not be unique."
  },
  {
    id: 61,
    domain: 2,
    scenario: 6,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A structured data extraction pipeline needs to process 200 invoice PDFs stored in a directory. The agent should first find all PDFs, then read each one. What is the correct sequence of built-in tools?",
    options: [
      { label: "A", text: "Use Grep to search for PDF content, then Read each result. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use Read on the directory to list all files, then filter for PDFs. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Use Glob with '**/*.pdf' to find all PDF files, then use Read on each file path returned by Glob." },
      { label: "D", text: "Use Bash with 'cat *.pdf' to read all PDFs at once. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "The correct sequence is Glob for file discovery followed by Read for file content. Glob with '**/*.pdf' efficiently finds all PDF file paths in the directory tree. Then Read processes each PDF file individually. \"Use Grep to search for PDF content, then Read each result\" is wrong because Grep searches file content by text pattern, not file names, and PDFs are binary files. \"Use Glob with '**/*.pdf' to find all PDF files, then use Read on each file path returned by …\" is wrong because Read operates on files, not directories. \"Use Bash with 'cat *.pdf' to read all PDFs at once\" would concatenate binary PDF data, producing unusable output."
  },
  {
    id: 62,
    domain: 2,
    scenario: 3,
    taskStatement: "2.1: Effective tool interfaces",
    question: "Your research system has a web_search tool and a scholarly_search tool. The web_search description says 'Search the web for information' and scholarly_search says 'Search for academic papers and research.' During testing, the agent uses web_search for academic queries. How should you fix the descriptions?",
    options: [
      { label: "A", text: "Rename scholarly_search to google_scholar_search. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "Add explicit boundaries to each description: web_search should say 'For general web results. For academic papers, use scholarly_search.' and scholarly_search should say 'For peer-reviewed academic papers and citations. For general web information, use web_search.'" },
      { label: "C", text: "Remove web_search entirely so the agent can only use scholarly_search. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "Add 'DO NOT use for academic queries' in capitals to web_search's description. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "B",
    explanation: "The best fix is to add explicit boundary statements to both tool descriptions, creating clear delineation. Each description should state what it IS for and explicitly reference the other tool for the alternative use case. This eliminates the overlap that caused the incorrect tool selection. \"Rename scholarly_search to google_scholar_search\" changes the name but does not fix the description overlap. \"Remove web_search entirely so the agent can only use scholarly_search\" removes useful functionality. \"Add 'DO NOT use for academic queries' in capitals to web_search's description\" uses aggressive formatting but still does not tell the model what tool to use instead."
  },
  {
    id: 63,
    domain: 2,
    scenario: 4,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "A developer's custom MCP tool for running database queries returns a validation error when the agent sends malformed SQL. The error response is: { isError: true, errorCategory: 'validation', message: 'Invalid SQL: missing WHERE clause in UPDATE statement. All UPDATE statements must include a WHERE clause for safety.', isRetryable: true }. Why is isRetryable: true appropriate for a validation error?",
    options: [
      { label: "A", text: "The agent can fix the SQL by adding a WHERE clause and retry with a corrected query. The validation error provides enough information for the agent to understand and correct the mistake." },
      { label: "B", text: "Validation errors should never be retryable. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "isRetryable should be false because the same query will fail again. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "isRetryable only applies to transient errors. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "Validation errors can be retryable when the error message provides enough information for the agent to correct the input. Here, the message clearly states 'missing WHERE clause in UPDATE statement' and the safety requirement, giving the agent what it needs to generate a corrected query. \"The agent can fix the SQL by adding a WHERE clause and retry with a corrected query\" and D are too rigid - retryability depends on whether the issue is fixable, not the error category. \"isRetryable should be false because the same query will fail again\" is technically correct that the SAME query would fail, but isRetryable means the agent can fix and retry with a corrected version."
  },
  {
    id: 64,
    domain: 2,
    scenario: 6,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your data extraction system has three specialized agents: a PDF reader agent (tools: read_pdf, ocr_scan), a field extractor agent (tools: extract_fields, validate_schema), and a data enrichment agent (tools: geocode_address, normalize_currency). The coordinator assigns a batch of invoices. Using tool_choice: \"auto\" for all agents, the field extractor occasionally calls validate_schema before extract_fields. How should you fix this?",
    options: [
      { label: "A", text: "Give all tools to all agents so any agent can do any step. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "Remove validate_schema from the field extractor's tools. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Add a prompt instruction: 'Always extract before validating.'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use tool_choice: { type: \"tool\", name: \"extract_fields\" } for the field extractor's first turn to force extraction before validation." }
    ],
    correctAnswer: "D",
    explanation: "Using forced tool selection on the first turn ensures the field extractor always starts with extraction, then switches to tool_choice: \"auto\" for subsequent turns where it can validate. This combines deterministic first-step behavior with flexible subsequent behavior. \"Remove validate_schema from the field extractor's tools\" removes a necessary tool. \"Add a prompt instruction: 'Always extract before validating.'\" is probabilistic and may fail. \"Use tool_choice: { type: \"tool\", name: \"extract_fields\" } for the field extractor's first tu…\" collapses the multi-agent architecture and creates the 18-tool degradation problem."
  },
  {
    id: 65,
    domain: 2,
    scenario: 5,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your CI system needs MCP access to a Jira server for creating issues from code review findings. The Jira credentials differ between staging and production environments. How should the .mcp.json handle this safely?",
    options: [
      { label: "A", text: "Use environment variable expansion in .mcp.json (for example, ${JIRA_API_TOKEN}, or ${JIRA_HOST:-https://jira.example.com}) and set environment-specific values in CI." },
      { label: "B", text: "Create two separate .mcp.json files: .mcp.staging.json and .mcp.production.json. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Hardcode the staging credentials and manually change them for production deployments. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Store both sets of credentials in .mcp.json with if/else logic. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Environment variable expansion in .mcp.json is the intended pattern for environment-specific secrets and endpoints. Keep one shared config file and inject values from each environment's CI secret store. Defaults like ${VAR:-default} are useful for non-secret values, while required secrets should be set explicitly. \"Use environment variable expansion in .mcp.json (for example, ${JIRA_API_TOKEN}, or ${JIRA_H…\" adds unnecessary config drift, option C hardcodes secrets, and option D is unsupported config logic."
  },
  {
    id: 66,
    domain: 2,
    scenario: 2,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A developer asks Claude Code to add a new import statement to the top of a file. The file has a unique first line (a specific comment header). The agent uses Edit with the first line as old_string and prepends the import. This works. But another file has a generic first line ('import React from \"react\"') that appears in 50 files. What should the agent do for that file?",
    options: [
      { label: "A", text: "Use Edit with just 'import React from \"react\"' as old_string. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use Bash to prepend the import with sed. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Include more surrounding context in old_string (e.g., the first 3-4 lines of the file) to make the match unique, or fall back to Read + Write if uniqueness cannot be achieved." },
      { label: "D", text: "Use Grep to find the file first, then Edit. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "C",
    explanation: "Edit requires unique text matching. When the simple match is not unique, include more surrounding lines as context. For example, including the first 3 lines ('import React from \"react\"' followed by the next two unique imports) will likely create a unique match. If the text still is not unique (extremely rare), Read + Write is the established fallback. \"Use Edit with just 'import React from \"react\"' as old_string\" will fail because the match is not unique. \"Include more surrounding context in old_string (e.g., the first 3-4 lines of the file) to ma…\" uses an external tool unnecessarily. \"Use Grep to find the file first, then Edit\" finds files by content but does not solve the uniqueness problem for Edit."
  },
  {
    id: 67,
    domain: 2,
    scenario: 1,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "The customer support coordinator needs to route incoming tickets to the right subagent. It only needs to analyze the ticket content and call the Task tool to delegate - it should not process refunds or look up orders itself. What is the correct tool configuration for the coordinator?",
    options: [
      { label: "A", text: "Give the coordinator only the Task tool, since its sole job is to analyze tickets and delegate to specialized subagents." },
      { label: "B", text: "Give the coordinator all 18 tools plus the Task tool so it can handle any situation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Give the coordinator the Task tool plus get_customer and lookup_order for initial triage. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Give the coordinator no tools; it should delegate via text in its response. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "The coordinator's role is purely orchestration: analyze the ticket and delegate to the appropriate specialist. It only needs the Task tool for delegation. Giving it domain-specific tools (like process_refund or lookup_order) risks the coordinator trying to handle tasks itself instead of delegating to the specialized subagent that is better equipped. \"Give the coordinator only the Task tool, since its sole job is to analyze tickets and delega…\" gives far too many tools and defeats the multi-agent architecture. \"Give the coordinator the Task tool plus get_customer and lookup_order for initial triage\" gives triage tools that are better handled by subagents. \"Give the coordinator no tools; it should delegate via text in its response\" removes the structured delegation mechanism."
  },
  // ============================================================
  // DOMAIN 3: Claude Code Configuration & Workflows
  // DOMAIN 4: Prompt Engineering & Structured Output
  // DOMAIN 5: Context Management & Reliability
  // ============================================================

  {
    id: 68,
    domain: 3,
    scenario: 2,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "Your engineering team uses Claude Code across multiple projects. A senior developer wants to enforce their personal code style preferences (e.g., tab width, import ordering) in every project they work on, without affecting teammates. Where should they place their CLAUDE.md configuration?",
    options: [
      { label: "A", text: "In the project root CLAUDE.md file. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "In .claude/rules/ with a glob pattern matching all files" },
      { label: "C", text: "In ~/.claude/CLAUDE.md" },
      { label: "D", text: "In a shared .claude/commands/ directory committed to git" }
    ],
    correctAnswer: "C",
    explanation: "~/.claude/CLAUDE.md is user-level memory and applies across that user's projects without affecting teammates. Project-level CLAUDE.md (option A) is shared by the repository. .claude/rules/ (option C) is not where CLAUDE.md memory belongs, and .claude/commands/ (option D) defines command workflows rather than persistent style guidance."
  },
  {
    id: 69,
    domain: 3,
    scenario: 3,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "A team building a multi-agent research system has a monorepo with separate directories for each subagent (web-search/, doc-analysis/, synthesis/). Each subagent directory needs its own Claude Code instructions for tool usage and output format. The team also needs shared conventions across all agents. What is the most effective CLAUDE.md configuration strategy?",
    options: [
      { label: "A", text: "Put all instructions in a single root CLAUDE.md file. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use .claude/commands/ to define agent-specific behavior. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Create separate ~/.claude/CLAUDE.md files for each team member. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use a root CLAUDE.md for shared conventions and directory-level CLAUDE.md files in each subagent folder for agent-specific instructions" }
    ],
    correctAnswer: "D",
    explanation: "The CLAUDE.md hierarchy supports this pattern: a project-level root CLAUDE.md defines shared conventions inherited by all subdirectories, while directory-level CLAUDE.md files in each subagent folder provide context-specific instructions. A single root file (option A) would become unwieldy and lack specificity. User-level files (option C) are per-developer, not per-agent. Commands (option D) are for executable actions, not persistent configuration."
  },
  {
    id: 70,
    domain: 3,
    scenario: 2,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "A developer's CLAUDE.md file is growing large with sections for testing standards, API conventions, database patterns, and deployment rules. They want to modularize it for maintainability. What is the recommended approach?",
    options: [
      { label: "A", text: "Split into multiple CLAUDE.md files in nested subdirectories. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Create a .claude/config.json with sections for each concern. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Use @import syntax to reference separate modular files from the main CLAUDE.md" },
      { label: "D", text: "Use environment variables to conditionally load different instruction sets" }
    ],
    correctAnswer: "C",
    explanation: "The @import syntax allows CLAUDE.md to reference separate modular files (e.g., @testing-standards.md, @api-conventions.md), keeping instructions organized and maintainable. Nested subdirectory CLAUDE.md files (option A) only apply within those directories, not globally. There is no .claude/config.json format (option C). Environment-variable-based loading (option D) is not a supported feature of CLAUDE.md."
  },
  {
    id: 71,
    domain: 3,
    scenario: 5,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "A team maintains topic-specific rule files for Claude Code: one for testing conventions, one for security review standards, and one for documentation requirements. Where should these files be stored so they are automatically loaded as project instructions?",
    options: [
      { label: "A", text: "In .claude/rules/ as individual rule files" },
      { label: "B", text: "In the project root as separate .md files. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "In .claude/commands/ with appropriate frontmatter" },
      { label: "D", text: "In ~/.claude/rules/ for global availability. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: ".claude/rules/ is specifically designed for topic-specific rule files that are automatically loaded as project instructions. Files in the project root (option A) are not automatically loaded by Claude Code. .claude/commands/ (option C) is for custom slash commands, not rule files. ~/.claude/rules/ (option D) is not the standard location for project-specific rules."
  },
  {
    id: 72,
    domain: 3,
    scenario: 2,
    taskStatement: "3.2: Custom commands and skills",
    question: "A team wants to create a custom slash command that generates a new API endpoint with boilerplate code, tests, and documentation. The command should be available to all team members working on the project. Where should the command definition be placed?",
    options: [
      { label: "A", text: ".claude/commands/ in the project repository" },
      { label: "B", text: "~/.claude/commands/ on each developer's machine" },
      { label: "C", text: ".claude/skills/ with a SKILL.md file. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "In the root CLAUDE.md with command instructions" }
    ],
    correctAnswer: "A",
    explanation: ".claude/commands/ in the project repository is the correct location for project-level custom slash commands that are shared via git with all team members. ~/.claude/commands/ (option A) would work but requires each developer to set it up individually and wouldn't stay in sync. Skills (option C) are a different mechanism. CLAUDE.md (option D) provides instructions but doesn't define invokable slash commands."
  },
  {
    id: 73,
    domain: 3,
    scenario: 4,
    taskStatement: "3.2: Custom commands and skills",
    question: "A developer frequently uses a personal workflow for exploring legacy codebases that involves specific search patterns and summarization steps. They don't want this command available to their team. Where should they define this custom command?",
    options: [
      { label: "A", text: ".claude/commands/ in the project repository. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "As a shell alias that invokes Claude Code. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: ".claude/rules/ with a path-specific glob pattern" },
      { label: "D", text: "~/.claude/commands/ in their home directory" }
    ],
    correctAnswer: "D",
    explanation: "~/.claude/commands/ is the personal commands directory that is not committed to version control and only available to that specific developer. Project-level .claude/commands/ (option A) would be shared with the team via git. .claude/rules/ (option C) is for path-specific rules, not commands. A shell alias (option D) wouldn't integrate with Claude Code's slash command system."
  },
  {
    id: 74,
    domain: 3,
    scenario: 3,
    taskStatement: "3.2: Custom commands and skills",
    question: "A team is defining a skill for their multi-agent research system that needs to run in an isolated fork context and requires access to specific tools. Which frontmatter fields should be included in the SKILL.md file?",
    options: [
      { label: "A", text: "context: fork, allowed-tools: [web_search, doc_analysis]" },
      { label: "B", text: "context: main, tools: [web_search, doc_analysis]. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "mode: isolated, permissions: [web_search, doc_analysis]. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "context: fork, argument-hint: 'research query', scope: restricted" }
    ],
    correctAnswer: "A",
    explanation: "Skills support frontmatter with 'context: fork' for isolated execution and 'allowed-tools' to specify which tools the skill can use. \"context: fork, allowed-tools: [web_search, doc_analysis]\" uses incorrect field names ('main' is not a valid context value, and 'tools' is not the correct field name). \"mode: isolated, permissions: [web_search, doc_analysis]\" uses entirely fabricated field names. \"context: fork, argument-hint: 'research query', scope: restricted\" includes 'scope: restricted' which is not a valid frontmatter field."
  },
  {
    id: 75,
    domain: 3,
    scenario: 5,
    taskStatement: "3.2: Custom commands and skills",
    question: "An enterprise has defined skills at multiple levels: an enterprise-managed skill, a developer's personal skill, a project-level skill, and a plugin-provided skill, all with the same name. Which skill takes priority when invoked?",
    options: [
      { label: "A", text: "Project-level skill, since it's closest to the code. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Enterprise skill, since enterprise policies take highest priority" },
      { label: "C", text: "Personal skill, since user preferences override everything. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Plugin skill, since plugins are external integrations. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "The skills priority order is Enterprise > Personal > Project > Plugins. Enterprise-managed skills take highest priority to ensure organizational policies and compliance requirements are enforced. Personal skills (option B) override project and plugin but not enterprise. Project-level (option A) only overrides plugins. Plugins (option D) have the lowest priority."
  },
  {
    id: 76,
    domain: 3,
    scenario: 2,
    taskStatement: "3.3: Path-specific rules",
    question: "A team wants to enforce that all test files across the entire monorepo (regardless of directory) follow specific patterns: use React Testing Library, avoid enzyme, and include accessibility checks. Test files are scattered across src/components/, src/pages/, src/utils/, and packages/*/. What is the best approach?",
    options: [
      { label: "A", text: "Add a CLAUDE.md file in every directory that contains test files. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Create a .claude/commands/test-rules command that developers must run manually. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Add the testing rules to the root CLAUDE.md file. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Create a rule file in .claude/rules/ with a paths field using the glob pattern **/*.test.tsx" }
    ],
    correctAnswer: "D",
    explanation: "Path-specific rules in .claude/rules/ with YAML paths fields supporting glob patterns (e.g., **/*.test.tsx) are ideal for cross-directory conventions. They load automatically when editing matching files. Adding CLAUDE.md to every directory (option A) is unmaintainable and error-prone as the codebase grows. Root CLAUDE.md (option C) would load these rules for all files, not just tests. Manual commands (option D) require developer discipline and don't enforce automatically."
  },
  {
    id: 77,
    domain: 3,
    scenario: 6,
    taskStatement: "3.3: Path-specific rules",
    question: "A team processes multiple file types for data extraction: CSV files need specific parsing rules, JSON files need schema validation rules, and XML files need namespace handling rules. Each file type exists across many directories. What is the most maintainable Claude Code configuration?",
    options: [
      { label: "A", text: "Directory-level CLAUDE.md files in every directory containing these file types. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "A single .claude/rules/ file with all rules combined. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Three separate rule files in .claude/rules/, each with a paths field matching the respective file extension (e.g., **/*.csv, **/*.json, **/*.xml)" },
      { label: "D", text: "A root CLAUDE.md with conditional sections for each file type. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Separate rule files in .claude/rules/ each with their own paths field and glob pattern is the most maintainable approach. Rules load only when editing matching files, so CSV rules won't clutter context when editing JSON files. A single combined file (option B) would load all rules regardless of which file type is being edited. Directory-level CLAUDE.md files (option C) would require duplication across directories. Root CLAUDE.md with conditionals (option D) doesn't support conditional loading natively."
  },
  {
    id: 78,
    domain: 3,
    scenario: 5,
    taskStatement: "3.3: Path-specific rules",
    question: "A rule file in .claude/rules/ has the following paths field: paths: ['src/api/**/*.ts', 'src/graphql/**/*.ts']. When will this rule be loaded?",
    options: [
      { label: "A", text: "Whenever any TypeScript file in the project is edited. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Only when running CI commands that touch API or GraphQL files. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Only when editing TypeScript files under src/api/ or src/graphql/ directories" },
      { label: "D", text: "At project initialization regardless of which files are being edited. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Path-specific rules load only when editing files that match the glob patterns in the paths field. This rule specifically targets TypeScript files under src/api/ and src/graphql/. It does not apply to all TypeScript files (option A), it's not CI-specific (option C), and it does not load at initialization regardless of context (option D)."
  },
  {
    id: 79,
    domain: 3,
    scenario: 4,
    taskStatement: "3.4: Execution modes",
    question: "A developer needs to refactor a legacy authentication system that spans 15 files across 4 directories, with multiple valid approaches (OAuth migration, session-based refactor, or hybrid). What execution mode should they use in Claude Code?",
    options: [
      { label: "A", text: "Direct execution to quickly implement the refactor. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Plan mode to evaluate approaches and coordinate multi-file changes before executing" },
      { label: "C", text: "Create a custom slash command for each approach and run them sequentially. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use the explore subagent to automatically implement the best approach. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Plan mode is designed for large-scale changes involving multiple files with multiple valid approaches. It allows Claude to evaluate tradeoffs and create a coordinated plan before making changes. Direct execution (option A) risks inconsistent changes across files without a plan. Custom commands (option C) don't help with approach selection. The explore subagent (option D) is for verbose discovery, not implementation."
  },
  {
    id: 80,
    domain: 3,
    scenario: 2,
    taskStatement: "3.4: Execution modes",
    question: "A developer asks Claude Code to rename a variable in a single function from 'userData' to 'customerProfile'. What is the appropriate execution mode?",
    options: [
      { label: "A", text: "Direct execution, since this is a simple, well-scoped change" },
      { label: "B", text: "Plan mode, since renaming could have downstream effects. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Use the explore subagent first to find all references. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Plan mode with manual approval for each file change. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Direct execution is appropriate for simple, well-scoped changes like renaming a variable in a single function. Plan mode (options A and D) adds unnecessary overhead for trivial changes. The explore subagent (option C) is for verbose discovery of unfamiliar codebases, not simple rename operations."
  },
  {
    id: 81,
    domain: 3,
    scenario: 4,
    taskStatement: "3.4: Execution modes",
    question: "A developer is exploring an unfamiliar legacy codebase to understand how the payment processing pipeline works before making any changes. They want verbose output about file structures, function relationships, and data flow. What should they use?",
    options: [
      { label: "A", text: "Direct execution with broad search queries. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Plan mode to create a modification plan. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The explore subagent for verbose discovery without making changes" },
      { label: "D", text: "A custom slash command that reads all files in the payment directory" }
    ],
    correctAnswer: "C",
    explanation: "The explore subagent is specifically designed for verbose discovery of codebases without making changes. It provides detailed output about file structures, relationships, and data flow. Direct execution (option A) is for making changes. Plan mode (option B) is for planning modifications, not pure exploration. A custom command (option D) would lack the intelligent exploration capabilities of the subagent."
  },
  {
    id: 82,
    domain: 3,
    scenario: 6,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A developer is iterating on a Claude Code prompt for extracting product data from unstructured supplier emails. The current prompt uses prose like 'extract relevant product information including prices and quantities.' Results are inconsistent. What is the most effective refinement approach?",
    options: [
      { label: "A", text: "Add more detailed prose describing what 'relevant' means. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Increase the model's temperature for more creative extraction. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Provide concrete input/output examples showing exact extraction from sample emails" },
      { label: "D", text: "Add a system prompt explaining the business context. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Concrete input/output examples are more effective than prose descriptions for achieving consistent output. They demonstrate exactly what to extract and in what format, eliminating ambiguity. More detailed prose (option A) still leaves room for interpretation. Temperature adjustments (option C) affect randomness, not accuracy of extraction. Business context (option D) may help but doesn't solve the core consistency problem."
  },
  {
    id: 83,
    domain: 3,
    scenario: 2,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A developer wants Claude Code to generate a complex data validation module but isn't sure about the exact requirements yet. They want Claude to help clarify requirements before implementation. What pattern should they use?",
    options: [
      { label: "A", text: "Provide a vague prompt and iterate on the output. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use the interview pattern where Claude asks clarifying questions before implementing" },
      { label: "C", text: "Write detailed requirements upfront in CLAUDE.md. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Generate multiple versions and pick the best one. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "The interview pattern is an iterative refinement technique where Claude asks clarifying questions before implementing, helping to surface requirements the developer may not have considered. Vague prompts with iteration (option A) wastes cycles on wrong directions. Writing detailed requirements upfront (option B) assumes you know them already. Generating multiple versions (option D) is wasteful when requirements are unclear."
  },
  {
    id: 84,
    domain: 3,
    scenario: 5,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A CI pipeline uses Claude Code to fix linting issues. When Claude fixes one issue, it sometimes introduces new ones. What iterative strategy is most effective?",
    options: [
      { label: "A", text: "Fix all issues in parallel in a single pass. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Add all linting rules to CLAUDE.md so Claude knows them upfront. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Increase the context window to include more of the codebase. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use sequential issue fixing, verifying each fix before proceeding to the next" }
    ],
    correctAnswer: "D",
    explanation: "Sequential issue fixing with verification between each fix prevents cascading problems. Each fix is validated before moving on, ensuring one fix doesn't introduce new issues. Parallel fixing (option A) is exactly what causes the cascading problem. Increasing context (option C) doesn't prevent the issue. Adding rules to CLAUDE.md (option D) helps with awareness but doesn't prevent fix interactions."
  },
  {
    id: 85,
    domain: 3,
    scenario: 6,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A team is using Claude Code to build an invoice data extractor. They want to verify that their prompt handles edge cases correctly (missing fields, unusual formats, multi-currency invoices). What is the best iterative approach?",
    options: [
      { label: "A", text: "Deploy to production and monitor error rates. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Write test cases for edge cases first, then iterate on the prompt until all tests pass" },
      { label: "C", text: "Add verbose error handling to the extraction code. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use plan mode to think through edge cases theoretically. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Test-driven iteration means writing test cases for expected edge cases first, then refining the prompt until all tests pass. This provides objective verification of correctness. Deploying to production (option A) risks errors reaching users. Error handling (option C) catches failures but doesn't prevent them. Theoretical planning (option D) doesn't validate against real data."
  },
  {
    id: 86,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "A CI pipeline needs to run Claude Code for automated code review on every pull request. The review should run non-interactively and produce a pass/fail result. Which Claude Code flags are essential?",
    options: [
      { label: "A", text: "--batch and --silent for background processing" },
      { label: "B", text: "--ci-mode with a webhook URL for results. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "-p (--print) for non-interactive mode" },
      { label: "D", text: "--daemon to keep a persistent session running" }
    ],
    correctAnswer: "C",
    explanation: "The -p (--print) flag runs Claude Code in non-interactive mode, which is essential for CI/CD pipelines where there's no terminal for interactive input. Options A, C, and D reference flags that don't exist in Claude Code. The -p flag is the standard approach for integrating Claude Code into automated pipelines."
  },
  {
    id: 87,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "A team's CI pipeline needs Claude Code to output structured JSON matching a specific schema so downstream tools can parse the review results. Which flags should they combine?",
    options: [
      { label: "A", text: "-p with --output-format json and --json-schema to define the expected structure" },
      { label: "B", text: "-p with --format json and --validate. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "--structured-output with a JSON schema file path. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "--output json with --strict-mode. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "--output-format json produces JSON output and --json-schema specifies the expected structure, combined with -p for non-interactive mode. This is the standard combination for structured CI output. Options B, C, and D reference incorrect flag names that don't exist in Claude Code."
  },
  {
    id: 88,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "A CI pipeline runs Claude Code for both code review and test generation on the same PR. A developer notices that context from the code review is leaking into the test generation step, causing test names to reference review comments. What is the correct solution?",
    options: [
      { label: "A", text: "Use session context isolation by running separate Claude Code instances for review and test generation" },
      { label: "B", text: "Add a --clear-context flag between runs. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Pipe the review output to /dev/null before running test generation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use a shared context with explicit section boundaries. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Session context isolation means running separate Claude Code instances for different tasks, ensuring no context leaks between them. This is a key CI/CD integration principle. --clear-context (option A) is not a real flag. Piping to /dev/null (option C) only hides output, doesn't clear context. Shared context with boundaries (option D) still allows leakage."
  },
  {
    id: 89,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "A CI pipeline uses Claude Code to generate tests for new code. The repository already has 500+ existing test files. Developers notice Claude sometimes generates tests that duplicate existing test cases. What should the pipeline do?",
    options: [
      { label: "A", text: "Add a deduplication step after test generation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use a smaller model to reduce the chance of copying existing patterns. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Limit Claude to generating only unit tests, not integration tests. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Provide existing test files in the prompt context so Claude can avoid generating duplicates" }
    ],
    correctAnswer: "D",
    explanation: "Providing existing test files to Claude Code gives it awareness of what already exists, allowing it to generate complementary rather than duplicate tests. Post-generation deduplication (option A) wastes compute and may miss subtle duplicates. Limiting test types (option C) doesn't address duplication. Model size (option D) doesn't affect duplication likelihood."
  },
  {
    id: 90,
    domain: 3,
    scenario: 1,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "A support team deploys a customer service agent using Claude Code. They need different instructions for handling refund workflows versus escalation workflows, and both sets of rules should apply project-wide. How should they organize their CLAUDE.md configuration?",
    options: [
      { label: "A", text: "Create two separate CLAUDE.md files in the project root. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Define both rule sets in ~/.claude/CLAUDE.md. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Put refund rules in a refunds/ directory CLAUDE.md and escalation rules in an escalations/ directory CLAUDE.md" },
      { label: "D", text: "Use a single CLAUDE.md with @import syntax to pull in refund-rules.md and escalation-rules.md" }
    ],
    correctAnswer: "D",
    explanation: "The @import syntax lets you modularize a single CLAUDE.md by referencing separate files. This keeps both rule sets project-wide while maintaining separation of concerns. You can't have two CLAUDE.md files in the same directory (option A). Directory-level files (option C) only apply within those directories. User-level config (option D) shouldn't contain project-specific rules."
  },
  {
    id: 91,
    domain: 3,
    scenario: 2,
    taskStatement: "3.2: Custom commands and skills",
    question: "A developer is creating a custom slash command that accepts a component name as an argument and generates a React component with tests. They want to provide a hint to users about what argument to pass. Which frontmatter field should they use?",
    options: [
      { label: "A", text: "description: 'Component name to generate'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "argument-hint: 'component name'" },
      { label: "C", text: "args: { name: 'string' }. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "input-schema: { type: 'string', description: 'component name' }" }
    ],
    correctAnswer: "B",
    explanation: "The argument-hint frontmatter field provides a hint to users about what argument a custom command expects. It appears in the command's help text. Options A, C, and D use field names that are not part of the Claude Code command frontmatter specification."
  },
  {
    id: 92,
    domain: 3,
    scenario: 4,
    taskStatement: "3.3: Path-specific rules",
    question: "A team has a convention that all database migration files (found in various packages within a monorepo) must include rollback logic and use specific transaction patterns. The migration files follow a naming pattern like YYYYMMDD_description.sql across multiple directories. A directory-level CLAUDE.md won't work because migrations exist in packages/*/migrations/. What should they use?",
    options: [
      { label: "A", text: "A root CLAUDE.md with migration instructions that apply to all files" },
      { label: "B", text: "A custom command that adds migration instructions when invoked. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "A rule file in .claude/rules/ with paths: ['**/migrations/*.sql']" },
      { label: "D", text: "Individual CLAUDE.md files in each package's migrations/ directory" }
    ],
    correctAnswer: "C",
    explanation: "A .claude/rules/ file with a glob pattern like **/migrations/*.sql targets migration files across all packages without requiring duplicate configuration. Root CLAUDE.md (option A) would load migration rules even when not working on migrations. Custom commands (option C) require manual invocation. Individual CLAUDE.md files (option D) require maintenance across many directories."
  },
  {
    id: 93,
    domain: 3,
    scenario: 3,
    taskStatement: "3.4: Execution modes",
    question: "A developer needs to add a new subagent to a multi-agent research system. This requires creating a new directory, defining agent configuration, writing tool integrations, updating the coordinator routing logic, and modifying shared types. What is the appropriate approach?",
    options: [
      { label: "A", text: "Direct execution since the developer knows exactly what to add. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Direct execution with the explore subagent running in parallel. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Use a custom slash command for agent creation. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Plan mode since this involves multi-file modifications across the system" }
    ],
    correctAnswer: "D",
    explanation: "Plan mode is appropriate for multi-file modifications that need coordination. Adding a subagent touches multiple files (config, tools, routing, types) and requires a coherent plan to ensure consistency. Even if the developer knows the goal, planning helps coordinate the changes. Direct execution (option A) risks inconsistent partial changes. A custom command (option C) may not exist. Running explore in parallel with direct execution (option D) is not how the tools work together."
  },
  {
    id: 94,
    domain: 3,
    scenario: 1,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A customer support agent built with Claude Code occasionally provides refund amounts that don't match the order total. The team wants to iteratively improve accuracy. Which refinement technique is most directly effective?",
    options: [
      { label: "A", text: "Add more general instructions about being accurate with numbers. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Provide concrete examples showing input orders and expected refund calculations with exact amounts" },
      { label: "C", text: "Increase the model temperature for more diverse responses. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Add a disclaimer that refund amounts should be verified. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Concrete input/output examples demonstrating exact refund calculations are more effective than prose descriptions. They show the model precisely how to derive amounts from order data. General accuracy instructions (option A) are vague and unlikely to change behavior. Higher temperature (option C) increases randomness. Disclaimers (option D) don't improve accuracy."
  },
  {
    id: 95,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "During CI, a PR review agent sometimes references code that does not exist in the current branch, yet resembles another team's recent PR. What is the most likely root cause?",
    options: [
      { label: "A", text: "Session or instance context is shared across reviews, so prior PR conversations or tool outputs leak into the current run." },
      { label: "B", text: "The runner is over-provisioned with memory, causing non-deterministic completions. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "The model is inventing code purely from pretraining without any repository input. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Branches are never checked out, so the agent always reads an empty tree. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Cross-PR leakage almost always comes from reused sessions, cached transcripts, or shared runner state—not from generic hallucination. Isolating one session per review prevents this. Memory sizing (A), generic hallucination (C), and missing checkout (D) are weaker fits for 'looks like another PR'."
  },
  {
    id: 96,
    domain: 3,
    scenario: 6,
    taskStatement: "3.6: CI/CD integration",
    question: "A batch data extraction pipeline uses Claude Code in CI to process incoming files. The team wants the output to conform to a specific JSON schema so it can be loaded directly into their data warehouse. What is the correct approach?",
    options: [
      { label: "A", text: "Add JSON formatting instructions to the prompt and hope for the best. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Post-process Claude's text output with a JSON parser. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Use -p with --output-format json and --json-schema specifying the warehouse schema" },
      { label: "D", text: "Use a fine-tuned model specifically for JSON output. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The -p flag for non-interactive mode combined with --output-format json and --json-schema ensures Claude Code produces structured JSON matching the specified schema. Prompt instructions alone (option A) don't guarantee valid JSON. Post-processing (option C) adds complexity and may fail on malformed output. Fine-tuning (option D) is unnecessary when schema enforcement is available."
  },
  {
    id: 97,
    domain: 3,
    scenario: 5,
    taskStatement: "3.1: CLAUDE.md hierarchy and configuration",
    question: "A team discovers that their CI pipeline's Claude Code instructions conflict with a developer's personal ~/.claude/CLAUDE.md settings, causing inconsistent review results between local development and CI. What is the correct understanding of CLAUDE.md precedence?",
    options: [
      { label: "A", text: "CI environment variables override all CLAUDE.md settings. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "User-level ~/.claude/CLAUDE.md, project-level, and directory-level all contribute to context with directory-level being most specific" },
      { label: "C", text: "Project-level CLAUDE.md always overrides user-level settings. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The last-loaded CLAUDE.md file completely replaces all previous ones. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "CLAUDE.md follows a hierarchical model: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root), and directory-level all contribute to the context, with directory-level being the most specific. They don't override each other; they accumulate. In CI, user-level files typically don't exist, which explains the inconsistency. Environment variables (option A) don't override CLAUDE.md. Files don't replace each other (option D)."
  },
  {
    id: 98,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1: Explicit criteria",
    question: "A CI code review agent flags 60% of functions as 'potentially problematic,' overwhelming developers with false positives. The prompt says 'review code for potential issues.' What is the most effective fix?",
    options: [
      { label: "A", text: "Add a confidence threshold: only flag issues with >80% confidence. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Switch to a smaller model that produces fewer outputs. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Reduce the amount of code sent to the model per request. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Replace the vague instruction with explicit criteria like 'flag functions where behavior contradicts their documentation or where error returns are silently ignored'" }
    ],
    correctAnswer: "D",
    explanation: "Explicit criteria ('flag when behavior contradicts comments,' 'flag silently ignored errors') dramatically reduce false positives by giving the model concrete, testable conditions. Vague instructions like 'potential issues' cast too wide a net. Confidence thresholds (option A) are unreliable because confidence-based filtering fails in practice. Reducing input (option C) doesn't fix the criteria problem. Smaller models (option D) would be less accurate."
  },
  {
    id: 99,
    domain: 4,
    scenario: 1,
    taskStatement: "4.1: Explicit criteria",
    question: "A customer support agent uses sentiment analysis to flag potentially angry customers for priority handling. The team notices many neutral queries are being flagged. A team member suggests adding a confidence score threshold to reduce false positives. Is this a good approach?",
    options: [
      { label: "A", text: "Yes, a 90% confidence threshold will eliminate most false positives. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Yes, but only if combined with keyword matching. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "No, confidence-based filtering for sentiment is unreliable; instead use explicit behavioral criteria like 'customer has repeated the same complaint more than twice'" },
      { label: "D", text: "No, remove sentiment analysis entirely and rely on customer self-reporting. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Confidence-based filtering fails for subjective tasks like sentiment analysis because the model's confidence scores don't reliably correlate with accuracy. Explicit behavioral criteria (e.g., 'repeated same complaint >2 times,' 'used profanity,' 'requested manager') are concrete and testable. Threshold tuning (options A, B) doesn't fix the fundamental unreliability. Removing analysis entirely (option D) loses valuable capability."
  },
  {
    id: 100,
    domain: 4,
    scenario: 6,
    taskStatement: "4.1: Explicit criteria",
    question: "A data extraction pipeline flags extracted prices as 'suspicious' based on the vague criterion 'unusually high or low prices.' This generates hundreds of false positives daily. What change would most reduce false positives while maintaining detection of genuine anomalies?",
    options: [
      { label: "A", text: "Add explicit criteria: 'flag prices that exceed 3 standard deviations from the product category median or are negative values'" },
      { label: "B", text: "Increase the model temperature to generate more nuanced assessments. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Add a secondary model to verify the first model's flags. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Batch the suspicious flags and review them weekly instead of daily. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Replacing vague criteria ('unusually high or low') with explicit, testable conditions ('exceeds 3 standard deviations from category median' or 'negative values') gives the model concrete rules to apply. This directly reduces false positives. Temperature changes (option B) add randomness. A secondary model (option C) adds cost without fixing the root criterion problem. Batching (option D) delays but doesn't reduce false positives."
  },
  {
    id: 101,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1: Explicit criteria",
    question: "A code review agent has been producing many false positive 'security vulnerability' warnings. The team realizes that these false positives erode developer trust in the tool. Which statement best describes why reducing false positives is critical?",
    options: [
      { label: "A", text: "False positives erode trust, causing developers to ignore all warnings, including true positives" },
      { label: "B", text: "False positives increase API costs due to longer conversations. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "False positives slow down the CI pipeline significantly. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "False positives indicate the model needs fine-tuning. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "The primary danger of false positives is trust erosion: when developers are overwhelmed with incorrect warnings, they begin ignoring all warnings, including legitimate security issues. This is the 'boy who cried wolf' effect. While false positives may have cost (option A) and speed (option C) implications, the trust impact is the most critical concern. False positives indicate a prompt criteria problem, not necessarily a need for fine-tuning (option D)."
  },
  {
    id: 102,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2: Few-shot prompting",
    question: "A team is building a data extraction system that must handle ambiguous supplier emails where product names sometimes appear in subject lines, sometimes in the body, and sometimes abbreviated. Which prompting technique is most effective for achieving consistent extraction across these variations?",
    options: [
      { label: "A", text: "Zero-shot with detailed instructions about where to look for product names. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Few-shot prompting with examples showing extraction from each ambiguous pattern (subject-line, body, abbreviated)" },
      { label: "C", text: "Chain-of-thought prompting asking the model to reason about where product names might appear. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Multiple independent extraction passes combined with majority voting. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Few-shot prompting is most effective for consistent output when handling ambiguous patterns. By demonstrating extraction from each variation (subject, body, abbreviations), the model learns to handle all patterns consistently. Zero-shot instructions (option A) leave room for interpretation. Chain-of-thought (option C) helps with reasoning but doesn't ensure consistent format. Majority voting (option D) adds cost without addressing the core consistency issue."
  },
  {
    id: 103,
    domain: 4,
    scenario: 1,
    taskStatement: "4.2: Few-shot prompting",
    question: "A support agent needs to categorize customer issues into predefined categories. Some issues could plausibly fit multiple categories (e.g., 'my refund didn't arrive' could be billing or shipping). How should the prompt handle this?",
    options: [
      { label: "A", text: "Provide few-shot examples that explicitly demonstrate how to categorize ambiguous cases, showing the reasoning for the chosen category" },
      { label: "B", text: "Let the model assign multiple categories and sort it out downstream. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Add a rule that says 'when in doubt, choose the first applicable category'. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use a decision tree that eliminates ambiguity through sequential questions. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Few-shot examples demonstrating ambiguous-case handling are the most effective technique. By showing examples of borderline cases with clear categorization logic, the model learns the prioritization pattern. Multiple categories (option B) pushes complexity downstream. Arbitrary rules like 'choose the first' (option C) don't capture the nuanced logic needed. Decision trees (option D) are rigid and hard to maintain."
  },
  {
    id: 104,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2: Few-shot prompting",
    question: "An extraction system encounters a new invoice format it hasn't seen before, but the format shares structural similarities with formats shown in the few-shot examples. What is the expected behavior?",
    options: [
      { label: "A", text: "The model will fail because the exact format wasn't in the examples. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The model will request additional examples before proceeding. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The model will hallucinate data to fill expected fields. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "The model will generalize from the few-shot examples to extract data from the novel format" }
    ],
    correctAnswer: "D",
    explanation: "A key benefit of few-shot prompting is that it enables generalization to novel patterns. When the model has seen structurally similar examples, it can apply learned extraction patterns to new formats. It won't fail outright (option A) if structural cues are present. Well-constructed few-shot examples reduce hallucination (option C). Models don't typically request more examples mid-extraction (option D)."
  },
  {
    id: 105,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2: Few-shot prompting",
    question: "A team notices their extraction model occasionally hallucinates product codes that don't exist in the source document. Which prompting approach most directly addresses this?",
    options: [
      { label: "A", text: "Add a post-processing validation step that checks product codes against a database. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Lower the temperature to 0 to eliminate all hallucination. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Include few-shot examples where some fields are absent in the source, demonstrating that the model should output null rather than hallucinate" },
      { label: "D", text: "Add an instruction saying 'do not hallucinate'. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Few-shot examples demonstrating correct handling of missing data (outputting null rather than inventing values) reduce hallucination in extraction tasks. The model learns that leaving a field empty is acceptable. Post-processing (option A) catches but doesn't prevent hallucination. Temperature 0 (option C) doesn't eliminate hallucination. Generic instructions (option D) are less effective than demonstrated examples."
  },
  {
    id: 106,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3: Structured output with tool_use",
    question: "A team needs Claude to reliably return structured JSON for a data extraction pipeline. They're debating between instructing Claude to output JSON via the system prompt versus using tool_use with a JSON schema. Which approach is most reliable?",
    options: [
      { label: "A", text: "System prompt instructions with 'respond only in JSON' are equally reliable. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "A regex-based parser on free-text output. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Custom stop sequences to force JSON formatting. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "tool_use with JSON schemas is most reliable for structured output because it enforces the schema at the API level" }
    ],
    correctAnswer: "D",
    explanation: "tool_use with JSON schemas is the most reliable method for structured output because the schema is enforced at the API level, guaranteeing valid JSON structure. System prompt instructions (option A) can still produce malformed JSON or extra text. Stop sequences (option C) don't ensure valid JSON. Regex parsing (option D) is fragile and error-prone."
  },
  {
    id: 107,
    domain: 4,
    scenario: 1,
    taskStatement: "4.3: Structured output with tool_use",
    question: "A customer support system uses tool_use to structure its responses. The team wants Claude to always use a specific tool rather than sometimes responding with plain text. Which tool_choice setting should they use?",
    options: [
      { label: "A", text: "tool_choice: 'auto' - let Claude decide when to use tools. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "tool_choice: 'any' - Claude must use one of the available tools but can choose which" },
      { label: "C", text: "Force a specific tool by name so Claude always uses that exact tool" },
      { label: "D", text: "tool_choice: 'none' with a system prompt requiring tool use. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Forcing a specific tool by name ensures Claude always uses that exact tool, which is the most reliable approach when you need a specific structured output every time. 'auto' (option A) lets Claude choose whether to use tools at all. 'any' (option B) requires tool use but doesn't guarantee which tool. 'none' with a system prompt (option D) contradicts itself and won't force tool use."
  },
  {
    id: 108,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3: Structured output with tool_use",
    question: "A team uses strict JSON schemas for invoice extraction. After deployment, they discover that while the JSON is always syntactically valid, some extracted values are semantically wrong (e.g., a shipping address in the billing address field). What does this reveal about strict schemas?",
    options: [
      { label: "A", text: "The schema isn't strict enough and needs more regex validation. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Strict schemas eliminate syntax errors but not semantic errors; field values can be structurally valid but contextually wrong" },
      { label: "C", text: "The model needs fine-tuning to understand the difference between billing and shipping. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Strict schemas are not suitable for complex extraction tasks. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Strict schemas guarantee structural validity (correct JSON, correct field names and types) but cannot enforce semantic correctness. A shipping address is a valid string for a billing address field as far as the schema is concerned. More regex (option A) can't distinguish address types. Fine-tuning (option C) may help but isn't the lesson here. Strict schemas are still valuable (option D); they just need supplemental validation."
  },
  {
    id: 109,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3: Structured output with tool_use",
    question: "An extraction schema has a field for 'tax_id' that is sometimes not present in source documents. The team notices Claude sometimes fills in plausible but fabricated tax IDs. What schema design change would help prevent this?",
    options: [
      { label: "A", text: "Make the tax_id field nullable so Claude can return null when the value isn't in the source document" },
      { label: "B", text: "Make the tax_id field required and add validation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Remove the tax_id field entirely from the schema. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Add a default value of '000-000-000' for missing tax IDs. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Making the field nullable gives Claude a legitimate way to express 'this information is not present' rather than being forced to populate the field with a hallucinated value. Required fields (option A) force population. Removing the field (option C) loses the capability entirely. Default values (option D) create misleading data."
  },
  {
    id: 110,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4: Validation-retry loops",
    question: "An extraction pipeline produces a JSON output that fails schema validation. The error is: 'price field is string, expected number.' What is the most effective retry strategy?",
    options: [
      { label: "A", text: "Simply retry the same prompt; the model may produce different output. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Switch to a different model for the retry attempt. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Increase temperature and retry to encourage different formatting. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Retry with the error message appended to the prompt: 'Previous output had error: price field is string, expected number. Please correct this.'" }
    ],
    correctAnswer: "D",
    explanation: "Retry-with-error-feedback is the most effective strategy: appending the specific error message to the prompt gives the model explicit information about what went wrong, allowing it to correct the specific issue. Blind retry (option A) may produce the same error. Increased temperature (option C) adds randomness without addressing the specific error. Switching models (option D) is expensive and unnecessary for a correctable error."
  },
  {
    id: 111,
    domain: 4,
    scenario: 1,
    taskStatement: "4.4: Validation-retry loops",
    question: "A support agent tries to look up a customer's order but the order number isn't in the system. The agent retries the lookup three times, each time failing. What should the system do?",
    options: [
      { label: "A", text: "Retry with different query formats (e.g., with/without dashes in order number). It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Generate a plausible order record based on the customer's description. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Escalate to a human agent after 3 failed retries. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Recognize that retries are ineffective for missing information and ask the customer to verify the order number" }
    ],
    correctAnswer: "D",
    explanation: "Retries are ineffective when the fundamental problem is missing information. If the order number doesn't exist in the system, no amount of retrying will find it. The correct action is to ask the customer to verify or provide the correct number. Format variations (option A) might help in some cases but don't address fundamentally missing data. Escalation (option C) is premature. Fabricating records (option D) is dangerous."
  },
  {
    id: 112,
    domain: 4,
    scenario: 5,
    taskStatement: "4.4: Validation-retry loops",
    question: "A CI review system has a high false-positive rate for 'suspicious patterns.' The team adds a detected_pattern field to the review output. How should this field be used?",
    options: [
      { label: "A", text: "To automatically filter out known false positive patterns. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "To display in the PR comments so developers can see what triggered the flag. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "To analyze patterns that trigger false positives and refine the review criteria accordingly" },
      { label: "D", text: "To train a classifier that predicts false positives. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The detected_pattern field is primarily valuable for analyzing which patterns trigger false positives, enabling the team to refine review criteria and reduce the false-positive rate over time. Automatic filtering (option A) may suppress true positives. Display (option C) is useful but not the primary purpose. Training a classifier (option D) adds unnecessary complexity."
  },
  {
    id: 113,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4: Validation-retry loops",
    question: "An invoice extraction system is extracting both a stated total from the document and individual line items. The team wants to detect extraction errors. What self-correction technique should they implement?",
    options: [
      { label: "A", text: "Run the extraction twice and compare outputs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Include a calculated_total field (sum of line items) alongside the stated_total field, and flag discrepancies" },
      { label: "C", text: "Add a confidence score to the total field. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use a separate validation API to check the total. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Including both a calculated_total (computed from extracted line items) and a stated_total (directly from the document) enables self-correction: discrepancies indicate extraction errors. This is a built-in consistency check. Running twice (option A) is expensive and may produce the same error. Confidence scores (option C) are unreliable. External validation (option D) adds latency and cost."
  },
  {
    id: 114,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "A company needs to process 10,000 supplier invoices for data extraction. The results are needed within 48 hours, not in real-time. Cost is a primary concern. Which approach is most appropriate?",
    options: [
      { label: "A", text: "Process all invoices synchronously through the standard API. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Split into 10 parallel API streams for faster processing. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Use the Message Batches API for 50% cost savings with up to 24-hour processing time" },
      { label: "D", text: "Use a smaller, cheaper model for bulk processing. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The Message Batches API provides 50% cost savings and allows up to 24 hours for processing, making it ideal for non-real-time bulk workloads. Since results are needed within 48 hours, the 24-hour processing window fits. Synchronous processing (option A) costs twice as much. Parallel streams (option C) don't offer cost savings. A smaller model (option D) may sacrifice extraction quality."
  },
  {
    id: 115,
    domain: 4,
    scenario: 1,
    taskStatement: "4.5: Batch processing",
    question: "A support team wants to use the Message Batches API to process customer support tickets. However, each ticket may require multiple tool calls (lookup_order, get_customer, process_refund) to resolve. Is the Batches API appropriate?",
    options: [
      { label: "A", text: "Yes, the Batches API handles multi-turn tool calling automatically. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Yes, but only if tool calls are pre-computed. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "No, the Message Batches API does not support multi-turn tool calling; each batch item is a single request-response" },
      { label: "D", text: "No, because the Batches API has a latency SLA that conflicts with tool call delays. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "The Message Batches API does not support multi-turn tool calling. Each batch item is a single request-response cycle. Support tickets requiring sequential tool calls (lookup, then refund, then confirm) cannot be fully resolved in a single batch request. The API doesn't automatically handle multi-turn (option A). Pre-computing defeats the purpose (option C). The API has no latency SLA (option D)."
  },
  {
    id: 116,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "A team submits a batch of 5,000 invoice extraction requests using the Message Batches API. They need to match each result back to its source invoice for downstream processing. What mechanism does the API provide for this?",
    options: [
      { label: "A", text: "Results are returned in the same order as submitted. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The API returns a mapping file with request-to-result associations. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Each request includes a custom_id field that is returned with the corresponding result for correlation" },
      { label: "D", text: "Results include the original request content for matching. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "The custom_id field on each batch request is returned with the corresponding result, enabling reliable correlation between requests and results. Order-based matching (option A) is not guaranteed. No mapping file is produced (option C). Results don't include original request content (option D)."
  },
  {
    id: 117,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "A real-time data extraction API receives individual documents and must return results within 2 seconds. A developer suggests switching to the Message Batches API to save costs. Is this appropriate?",
    options: [
      { label: "A", text: "Yes, the cost savings justify a slight increase in latency. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Yes, if they set a priority flag on the batch requests. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "No, the Batches API has no latency SLA and processing can take up to 24 hours; it is inappropriate for real-time requirements" },
      { label: "D", text: "No, but only because single-document batches are not supported. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "The Message Batches API has no latency SLA and processing can take up to 24 hours. It is designed for latency-tolerant, non-blocking workloads and is completely inappropriate for real-time 2-second response requirements. There is no priority flag mechanism (option C). Single-item batches are technically possible but miss the point (option D)."
  },
  {
    id: 118,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6: Multi-instance review",
    question: "A CI pipeline asks Claude to generate code and then review its own output for bugs in the same conversation. The review rarely finds issues. What is the fundamental problem?",
    options: [
      { label: "A", text: "The model retains its reasoning context from generation, making it biased toward validating its own logic rather than critically reviewing it" },
      { label: "B", text: "The model is too confident in its own output. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "The review prompt is too vague. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Self-review only works with chain-of-thought prompting enabled. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Self-review is limited because the model retains its reasoning context from the generation step. It tends to validate the same logic it just used rather than approaching the code with fresh critical eyes. This is a fundamental limitation of same-session review. Confidence (option A) is a symptom, not the root cause. Prompt vagueness (option C) may contribute but isn't the core issue. Chain-of-thought (option D) doesn't solve the context retention problem."
  },
  {
    id: 119,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6: Multi-instance review",
    question: "A team wants more effective automated code review in CI. They've learned that self-review is limited. What alternative approach would be most effective?",
    options: [
      { label: "A", text: "Use a different model for review than for generation. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use independent review instances that don't share context with the generation session" },
      { label: "C", text: "Add a delay between generation and review to 'reset' the model. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Use the same instance but with a strongly-worded adversarial review prompt. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Independent review instances are more effective because they approach the code without the reasoning context that influenced generation. A fresh instance reviews the code on its own merits. Different models (option A) add complexity without addressing the core context issue. Delays (option C) don't clear context in the same session. Adversarial prompts (option D) still operate within the same biased context."
  },
  {
    id: 120,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6: Multi-instance review",
    question: "A large PR modifies 20 files across 3 modules. The team wants comprehensive AI review. What multi-pass review strategy would be most effective?",
    options: [
      { label: "A", text: "Send all 20 files in a single context window for holistic review. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Only review files with the most changes, skip minor modifications. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Review files in alphabetical order with cumulative context. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "A multi-pass approach: first pass reviews each file locally (per-file), second pass reviews cross-file integration points" }
    ],
    correctAnswer: "D",
    explanation: "A multi-pass approach combining per-file local review (catching issues within each file) with a cross-file integration pass (catching inconsistencies between modules) provides comprehensive coverage. A single holistic review (option A) may miss details in a large context. Alphabetical order (option C) has no logical basis. Skipping minor files (option D) may miss important bugs in small changes."
  },
  {
    id: 121,
    domain: 4,
    scenario: 3,
    taskStatement: "4.1: Explicit criteria",
    question: "A research synthesis agent is flagging too many sources as 'potentially unreliable.' The current instruction says 'evaluate source reliability.' What explicit criteria would most effectively reduce false positives while maintaining detection of truly unreliable sources?",
    options: [
      { label: "A", text: "Flag sources where the publication has no identifiable editorial review process, the author has no verifiable credentials in the claimed domain, or the claims contradict multiple peer-reviewed sources" },
      { label: "B", text: "Flag sources with confidence below 70%. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Flag all sources that aren't from top-10 journals. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Let the model use its judgment about what constitutes unreliable. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "Explicit, testable criteria (no editorial review, unverifiable credentials, contradicting peer-reviewed sources) give the model concrete conditions to check rather than subjective assessment. Confidence thresholds (option A) are unreliable. Top-10 journal filtering (option C) is overly restrictive and misses good sources. Relying on judgment (option D) is what caused the problem."
  },
  {
    id: 122,
    domain: 4,
    scenario: 1,
    taskStatement: "4.2: Few-shot prompting",
    question: "A customer support bot must extract order IDs from free-text customer messages. Customers write order IDs in various formats: 'ORD-12345', '#12345', 'order number 12345', or just '12345' buried in a sentence. What prompting technique would yield the most consistent extraction?",
    options: [
      { label: "A", text: "A regex pattern that matches all known order ID formats. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Few-shot examples demonstrating extraction from each format variation" },
      { label: "C", text: "A system prompt saying 'extract order IDs from messages'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "A two-step chain: first classify the message format, then extract" }
    ],
    correctAnswer: "B",
    explanation: "Few-shot examples showing extraction from each format variation (prefixed, hash, spelled out, embedded) enable consistent extraction across all patterns. Regex (option A) breaks on natural language context ('order number 12345'). A generic system prompt (option C) leaves handling of variations to the model's discretion. Two-step classification (option D) is unnecessarily complex for this task."
  },
  {
    id: 123,
    domain: 4,
    scenario: 1,
    taskStatement: "4.3: Structured output with tool_use",
    question: "A support agent uses tool_use with tool_choice set to 'auto.' The team notices that Claude sometimes responds with plain text instead of using the get_customer tool when a customer provides their email. What should they change?",
    options: [
      { label: "A", text: "Add stronger instructions in the system prompt to always use tools. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Add more few-shot examples showing tool use. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Remove the plain text response capability entirely. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Change tool_choice to force the get_customer tool when customer identification is needed" }
    ],
    correctAnswer: "D",
    explanation: "Forcing a specific tool via tool_choice is the reliable way to ensure tool use in specific situations, rather than relying on the model to choose correctly with 'auto.' System prompt instructions (option A) can still be overridden by the model's judgment. You can't remove plain text capability (option C). Few-shot examples (option D) improve but don't guarantee behavior."
  },
  {
    id: 124,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4: Validation-retry loops",
    question: "An extraction system retries a failed request by appending the validation error. On the second attempt, it produces different but still invalid output. On the third attempt, it succeeds. What is the recommended limit for retry attempts?",
    options: [
      { label: "A", text: "A small number of retries (2-3) with error feedback, then fallback to human review or error reporting" },
      { label: "B", text: "Exactly one retry to minimize latency. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Unlimited retries until success. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "No retries; fail fast and queue for human processing. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "A small number of retries (2-3) with error feedback balances success likelihood against cost and latency. Most correctable errors resolve within 2-3 attempts. Unlimited retries (option A) risk infinite loops and high costs. One retry (option B) may miss fixable errors. No retries (option D) wastes the opportunity to self-correct simple errors."
  },
  {
    id: 125,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "A team processes monthly batches of 50,000 documents using the Message Batches API. They want to monitor progress and handle partial failures. Which statement about the Batches API is correct?",
    options: [
      { label: "A", text: "The API provides real-time progress updates via webhooks. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "If one request in the batch fails, the entire batch is cancelled. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Each request in the batch is processed independently; failures in some requests don't affect others, and custom_id enables tracking individual results" },
      { label: "D", text: "Batch processing guarantees that all results are returned simultaneously. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Each request in a batch is processed independently. Failures in individual requests don't cancel the batch, and custom_id on each request allows tracking which succeeded and which failed. There are no real-time webhook updates (option A). The batch doesn't fail atomically (option B). Results are not guaranteed to return simultaneously (option D)."
  },
  {
    id: 126,
    domain: 4,
    scenario: 3,
    taskStatement: "4.6: Multi-instance review",
    question: "A multi-agent research system has a synthesis agent that combines findings from web search and document analysis subagents. The coordinator wants the synthesis to be reviewed for accuracy. Should the same synthesis agent review its own output?",
    options: [
      { label: "A", text: "Yes, the synthesis agent has the most context about the combined findings. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "No, only a human reviewer can effectively evaluate synthesis quality. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Yes, but only after a mandatory 30-second delay. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "No, an independent review instance should check the synthesis because the synthesis agent retains its reasoning biases" }
    ],
    correctAnswer: "D",
    explanation: "An independent review instance is more effective because the synthesis agent retains its reasoning context and biases from the synthesis process. A fresh instance can critically evaluate the output without those biases. While the synthesis agent has context (option A), that context creates blind spots. Delays (option C) don't reset model context. Human review (option D) may not always be feasible at scale."
  },
  {
    id: 127,
    domain: 4,
    scenario: 1,
    taskStatement: "4.1: Explicit criteria",
    question: "A support agent flags potential fraud using the criterion 'unusual account activity.' This generates 200+ false positives daily. Which replacement criteria would be most effective?",
    options: [
      { label: "A", text: "Replace with explicit criteria: 'flag accounts with >5 failed login attempts in 1 hour, password changes from a new IP within 24 hours of a large purchase, or refund requests exceeding the original order value'" },
      { label: "B", text: "Add a machine learning fraud detection model as a pre-filter. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Increase the threshold for 'unusual' to reduce flags. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Only flag activity during off-business hours. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "A",
    explanation: "Explicit, concrete criteria with specific thresholds and conditions replace the subjective 'unusual' with testable rules. Each criterion targets a known fraud pattern. A pre-filter (option A) adds complexity without fixing the vague prompt. Adjusting the 'unusual' threshold (option C) is still subjective. Time-based filtering (option D) misses many fraud patterns and creates false negatives."
  },
  {
    id: 128,
    domain: 5,
    scenario: 1,
    taskStatement: "5.1: Context preservation",
    question: "A customer support agent is handling a complex case that has spanned 30+ messages. The conversation includes specific dollar amounts ($47.99 refund, $12.50 shipping credit), order numbers, and timestamps. The context is getting long. A developer suggests using progressive summarization to compress the conversation. What is the primary risk?",
    options: [
      { label: "A", text: "Progressive summarization risks losing specific numerical values like exact refund amounts and order numbers that are critical to case resolution" },
      { label: "B", text: "The summarization will take too long to process. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "The customer will notice the summary and feel their issue is being trivialized. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Summarization will cause the model to forget tool outputs. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Progressive summarization's primary risk is loss of specific numerical values, order IDs, and precise details that are critical for accurate case resolution. A summary might say 'customer is owed a refund' instead of '$47.99 refund plus $12.50 shipping credit.' Processing time (option A) is minor. Customer visibility (option C) is not an issue since summarization is internal. Tool output handling (option D) is a separate concern."
  },
  {
    id: 129,
    domain: 5,
    scenario: 3,
    taskStatement: "5.1: Context preservation",
    question: "A research agent has accumulated findings from 15 different sources across a long conversation. A study from source #3 contradicts findings from source #11, but both were discussed many messages apart. What technique helps ensure this contradiction is not overlooked?",
    options: [
      { label: "A", text: "Increase the context window size to hold all findings. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Extract structured 'case facts' blocks summarizing key findings with source attribution, making contradictions visible" },
      { label: "C", text: "Always process sources in chronological order. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Only keep the most recent 5 source findings in context. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Structured 'case facts' blocks consolidate key findings with source attribution in a compact format that makes contradictions visible regardless of when they were discussed. The 'lost in the middle' effect means information discussed early or in the middle of long conversations can be overlooked. Increasing context (option A) doesn't solve the 'lost in middle' problem. Chronological processing (option C) doesn't help with cross-source comparison. Keeping only recent findings (option D) would lose source #3 entirely."
  },
  {
    id: 130,
    domain: 5,
    scenario: 1,
    taskStatement: "5.1: Context preservation",
    question: "A support agent uses multiple tools (get_customer, lookup_order, process_refund) during a long conversation. The developer notices that tool results are accumulating and consuming a disproportionate amount of the context window. What is the most accurate description of what is happening?",
    options: [
      { label: "A", text: "Tool results are being duplicated in storage and should be deduplicated at the persistence layer. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The tools are misconfigured and always return oversized JSON blobs regardless of query parameters. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Each tool call appends its full payload to the thread, so token usage grows quickly even when only small slices of those payloads matter for the next decision." },
      { label: "D", text: "The model is automatically summarizing tool output incorrectly, doubling the effective token count. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Tool results are copied into the conversation verbatim; over many turns the cumulative size dominates the budget. The usual mitigation is to extract and retain only fields needed for the next steps. Duplication (A) is not the default failure mode. Oversized APIs (C) or bad summarization (D) are less universal explanations than append-only context growth."
  },
  {
    id: 131,
    domain: 5,
    scenario: 3,
    taskStatement: "5.1: Context preservation",
    question: "A research agent processes information from 20 sources in a long conversation. The 'lost in the middle' effect means information from which position is most likely to be overlooked?",
    options: [
      { label: "A", text: "Sources discussed in the middle of the conversation, because models attend more strongly to the beginning and end of context" },
      { label: "B", text: "The earliest sources, because they're furthest from the current position. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The most recent sources, because the model focuses on earlier context. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "All positions are equally likely to be overlooked. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "The 'lost in the middle' effect is a well-documented phenomenon where language models attend more strongly to information at the beginning and end of the context window, with information in the middle being most likely to be overlooked. This makes structured extraction of key facts essential for long conversations. Recent sources (option A) are actually well-attended. Earliest sources (option B) also receive relatively strong attention."
  },
  {
    id: 132,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2: Escalation and ambiguity resolution",
    question: "A customer explicitly says 'I want to speak with a human manager.' The AI support agent has a 95% confidence it can resolve the issue. What should the agent do?",
    options: [
      { label: "A", text: "Honor the explicit human request immediately and escalate to a human agent using the escalate_to_human tool" },
      { label: "B", text: "Attempt resolution first since it has high confidence, then escalate if the customer asks again. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Ask the customer why they want a human to determine if it's truly necessary. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Offer to resolve the issue and mention that a human is available if needed. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Explicit human requests must be honored immediately regardless of the agent's confidence level. When a customer asks to speak with a human, that request takes precedence over any automated resolution capability. Attempting resolution first (option A) ignores the customer's stated preference. Questioning the request (option C) is dismissive. Offering alternatives (option D) delays the customer's explicit request."
  },
  {
    id: 133,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2: Escalation and ambiguity resolution",
    question: "A support agent encounters a refund request that falls outside documented policy: the customer wants a refund on a customized item, but the policy only addresses standard items. What is the appropriate action?",
    options: [
      { label: "A", text: "Deny the refund since it's not covered by policy. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Escalate to a human agent because there is a policy gap that the AI cannot authoritatively resolve" },
      { label: "C", text: "Approve the refund to maintain customer satisfaction. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Apply the standard item refund policy to the customized item. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Policy gaps are a key escalation trigger. When the agent encounters a situation not covered by documented policy, it should escalate to a human who can make an authoritative decision. Denying (option A) or approving (option B) the refund would be the agent making a policy decision it's not authorized to make. Applying the wrong policy (option D) could set incorrect precedents."
  },
  {
    id: 134,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2: Escalation and ambiguity resolution",
    question: "A customer calls about 'order 12345' but the lookup returns two orders with similar numbers: #12345 (placed January) and #12345-B (placed March). What should the agent do?",
    options: [
      { label: "A", text: "Ask the customer for additional identifiers to determine which order they mean, such as the order date or items purchased" },
      { label: "B", text: "Default to the original order (#12345) since the customer didn't mention '-B'. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Default to the most recent order (#12345-B) since it's likely the one they're asking about. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Present information about both orders and let the customer pick. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "When multiple matches exist, the agent should ask for additional identifiers (date, items, etc.) to resolve the ambiguity. This prevents acting on the wrong order. Defaulting to most recent (option A) or original (option B) is a guess that could result in the wrong action. Presenting both orders (option D) could work but asking targeted questions is more efficient and professional."
  },
  {
    id: 135,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2: Escalation and ambiguity resolution",
    question: "A team member suggests using sentiment analysis to trigger escalation: when the customer's sentiment score drops below a threshold, automatically escalate. Is this reliable?",
    options: [
      { label: "A", text: "Yes, sentiment analysis accurately detects frustrated customers who need human attention. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "No, sentiment-based escalation is unreliable; some customers express frustration through calm, polite language, and some enthusiastic language is misread as anger" },
      { label: "C", text: "Yes, but only when combined with keyword detection. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "No, because sentiment analysis is too slow for real-time escalation. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Sentiment-based escalation is unreliable because sentiment analysis has significant limitations: calm but deeply frustrated customers may not trigger it, while enthusiastic or emphatic language may falsely trigger it. Explicit behavioral triggers (customer requests human, agent cannot progress, policy gap) are more reliable. Adding keywords (option B) helps but doesn't solve the fundamental unreliability. Speed (option D) is not the issue."
  },
  {
    id: 136,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3: Error propagation",
    question: "The web search subagent returns an error: 'API rate limit exceeded.' The coordinator agent receives this error. What should it propagate to the synthesis agent?",
    options: [
      { label: "A", text: "Nothing; suppress the error and work with available results. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Structured error context: failure type (rate limit), attempted query, partial results if any, and alternative approaches (retry after delay, use cached results)" },
      { label: "C", text: "A generic 'search failed' message. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The raw API error message. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "B",
    explanation: "Structured error context enables downstream agents to make informed decisions. Knowing it's a rate limit (temporary, retryable) vs. an auth failure (permanent) matters. Partial results and alternatives give the synthesis agent options. Suppressing errors (option A) leads to incomplete or misleading synthesis. Generic messages (option B) don't enable recovery. Raw errors (option D) may lack actionable context."
  },
  {
    id: 137,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3: Error propagation",
    question: "The document analysis subagent queries an internal knowledge base and receives zero results for a specific topic. How should this be communicated to the coordinator?",
    options: [
      { label: "A", text: "Report 'No information available on this topic'. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "Distinguish between 'access failure' (couldn't reach the database) and 'valid empty result' (database was queried successfully but contains no matching documents), as they require different handling" },
      { label: "C", text: "Skip this source and proceed with other subagent results. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Generate a summary based on the agent's training data to fill the gap. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." }
    ],
    correctAnswer: "B",
    explanation: "Distinguishing access failures from valid empty results is critical: an access failure means the information might exist but wasn't retrieved (worth retrying), while a valid empty result means the source genuinely has no relevant content (don't retry). Generic 'no information' (option A) conflates these. Silently skipping (option C) loses important metadata. Generating from training data (option D) introduces unreliable information."
  },
  {
    id: 138,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3: Error propagation",
    question: "In a multi-agent research system, the web search subagent fails. The coordinator agent terminates the entire research task. Is this the correct behavior?",
    options: [
      { label: "A", text: "Yes, if one subagent fails, the results cannot be complete. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "No, the system should not terminate on a single subagent failure; it should continue with other subagents and report the gap in the final synthesis" },
      { label: "C", text: "Yes, but only if the failed subagent was the primary source. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "No, the coordinator should retry the failed subagent indefinitely. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "A multi-agent system should not terminate on a single subagent failure. The coordinator should continue with other available subagents and clearly report the gap in the final synthesis. Users can then decide if the partial results are sufficient. Complete termination (options A, C) is too aggressive. Indefinite retry (option D) blocks the entire pipeline."
  },
  {
    id: 139,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "A developer has been exploring a large legacy codebase with Claude Code for 2 hours. They notice Claude's responses are becoming less accurate and it's 'forgetting' findings from early in the session. What is happening?",
    options: [
      { label: "A", text: "The model is experiencing fatigue from prolonged use. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Context degradation in extended sessions: as the context fills with exploration data, earlier findings are displaced or become lost in the middle" },
      { label: "C", text: "The codebase has changed while they were exploring. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The model's API key is rate-limited after extended use. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Context degradation in extended sessions is a real phenomenon: as the context window fills with new exploration data, earlier findings receive less attention or are displaced entirely. This is compounded by the 'lost in the middle' effect. Model fatigue (option A) is not a real concept. Codebase changes (option C) are possible but unlikely to cause the described symptoms. Rate limiting (option D) would cause errors, not inaccuracy."
  },
  {
    id: 140,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "During a long codebase exploration session, a developer wants to preserve key findings so they aren't lost as context fills up. What technique is recommended?",
    options: [
      { label: "A", text: "Copy findings into a separate document manually. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use scratchpad files to persist key findings outside the conversation context, which Claude can reference later" },
      { label: "C", text: "Periodically restart the session and re-explore. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use a larger model with more context capacity. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Scratchpad files persist key findings outside the conversation context, serving as external memory that Claude can read back later. This prevents loss of important discoveries as the context window fills. Manual copying (option A) works but doesn't integrate with Claude's workflow. Restarting (option C) loses all context. Larger context (option D) delays but doesn't prevent degradation."
  },
  {
    id: 141,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "A developer is exploring a codebase and wants to delegate investigation of a specific subsystem without polluting their main conversation context. What should they use?",
    options: [
      { label: "A", text: "A new terminal window with a separate Claude session. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "A custom command that runs in the background. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Subagent delegation, which runs an isolated exploration and returns only the summary to the main context" },
      { label: "D", text: "The /compact command to make room for the subsystem exploration. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Subagent delegation runs exploration in isolation and returns only the summary, keeping the main conversation context clean. A new terminal (option A) works but loses integration with the current session. Background commands (option C) are a different mechanism. /compact (option D) reduces existing context but doesn't prevent new content from filling it."
  },
  {
    id: 142,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "A developer's Claude Code session crashes during a complex multi-file refactoring. They had identified 8 files that needed changes and completed 5 of them. What practice would have helped them recover?",
    options: [
      { label: "A", text: "Making smaller, more frequent git commits. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Running Claude Code in a Docker container for isolation. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Using a more stable internet connection. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Using structured state persistence (e.g., a progress file listing identified files, completed changes, and remaining tasks) for crash recovery" }
    ],
    correctAnswer: "D",
    explanation: "Structured state persistence means maintaining a progress file that tracks the plan (which files, what changes, what's done, what remains). After a crash, a new session can read this file and resume. Git commits (option A) help with code recovery but not with the plan/context. Connection stability (option C) and containers (option D) address different failure modes."
  },
  {
    id: 143,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "A developer's Claude Code session has become slow and responses are degrading after extensive codebase exploration. What command should they use to reduce context size while preserving key information?",
    options: [
      { label: "A", text: "/compact to reduce context while preserving important information" },
      { label: "B", text: "/reset to start a completely fresh session. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "/clear to delete conversation history. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Start a brand-new session and manually copy notes over. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "/compact is specifically designed to reduce context while preserving important information. /clear drops conversation history without preserving it, and starting a new session manually (option D) is slower and easier to get wrong. The goal here is preserving useful context while shrinking token load, which is exactly what /compact is for."
  },
  {
    id: 144,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5: Human review and confidence calibration",
    question: "An extraction system reports 95% aggregate accuracy across all document types. However, when the team examines performance on handwritten invoices specifically, accuracy drops to 60%. What does this reveal about aggregate metrics?",
    options: [
      { label: "A", text: "The 95% accuracy is incorrect and should be recalculated. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The model needs more training data to improve overall accuracy. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Handwritten invoices should be excluded from the dataset. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Aggregate accuracy can mask poor performance on specific segments; stratified evaluation across document types is necessary" }
    ],
    correctAnswer: "D",
    explanation: "Aggregate accuracy can mask poor performance on segments. A 95% overall accuracy that hides 60% accuracy on handwritten invoices means those documents are being processed unreliably. Stratified random sampling across document types reveals these segment-specific weaknesses. The aggregate isn't wrong (option A); it's misleading. Excluding handwritten invoices (option C) ignores the problem. More training data (option D) may help but doesn't address the evaluation gap."
  },
  {
    id: 145,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5: Human review and confidence calibration",
    question: "A data extraction system provides field-level confidence scores (e.g., 'vendor_name: 0.95, tax_amount: 0.45'). How should these scores be used in a human review workflow?",
    options: [
      { label: "A", text: "Only display the highest confidence fields to speed up human review. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use confidence scores to weight the importance of fields in the output. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Ignore confidence scores and randomly sample for human review. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Route documents with any field below a calibrated confidence threshold to human review, while auto-approving fully high-confidence documents" }
    ],
    correctAnswer: "D",
    explanation: "Field-level confidence scores enable targeted human review: documents where all fields are high-confidence can be auto-approved, while those with low-confidence fields are routed to human reviewers who can focus on the uncertain fields. Showing only high-confidence (option A) hides problems. Random sampling (option C) wastes reviewer time on correct extractions. Weighting by confidence (option D) misuses the scores."
  },
  {
    id: 146,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5: Human review and confidence calibration",
    question: "A team deploys confidence scores for their extraction system, but reviewers notice that items marked '0.9 confidence' are correct only 70% of the time. What is the problem and solution?",
    options: [
      { label: "A", text: "The model is overconfident; lower all scores by 20%. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Confidence scores above 0.85 should be treated as unreliable. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "The confidence scores are not calibrated; they should be calibrated using a validation set where predicted confidence is compared against actual accuracy" },
      { label: "D", text: "Switch to a different model with better calibration. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Confidence scores must be calibrated so that a 0.9 score actually corresponds to ~90% accuracy. Calibration uses a validation set to measure the relationship between predicted confidence and actual accuracy, then adjusts accordingly. Simple offset (option A) doesn't account for non-linear miscalibration. Treating high scores as unreliable (option C) loses the benefit. Switching models (option D) may not solve the calibration issue."
  },
  {
    id: 147,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A research synthesis agent combines information from multiple sources. The web search subagent finds that 'Market X grew 15% in 2025' while the document analysis subagent finds a report stating 'Market X grew 8% in 2025.' How should the synthesis agent handle this conflict?",
    options: [
      { label: "A", text: "Use the higher figure since it likely represents a more optimistic forecast. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Average the two figures and report 11.5% growth. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Use the figure from the more recent source. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "Annotate the conflict explicitly: present both figures with their sources, noting the discrepancy for the reader to evaluate" }
    ],
    correctAnswer: "D",
    explanation: "When conflicting statistics are found, the synthesis should annotate the conflict rather than arbitrarily selecting one value. Presenting both figures with source attribution allows the reader to evaluate the discrepancy. Choosing the higher (option A) or averaging (option B) fabricates false precision. Recency (option D) isn't always a reliable quality signal without more context."
  },
  {
    id: 148,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A research agent synthesizes findings into a report. The team wants every claim in the report to be traceable to its source. What structure should the synthesis output maintain?",
    options: [
      { label: "A", text: "Claim-source mappings that preserve provenance: each claim is linked to its source, evidence, and confidence level" },
      { label: "B", text: "A bibliography at the end of the report. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Footnotes with URLs for each paragraph. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "A summary section listing all sources consulted. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Claim-source mappings must be preserved as structured intermediates: each claim linked to its specific evidence, source document, and confidence level. This enables verification and trust. A bibliography (option A) lists sources but doesn't map specific claims. Footnotes (option C) and source lists (option D) provide weaker provenance than structured claim-level mappings."
  },
  {
    id: 149,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A research agent finds statistical data from multiple sources but none of the sources include publication dates. The team uses this data in a market analysis. What risk does this introduce?",
    options: [
      { label: "A", text: "The data may be outdated, leading to incorrect conclusions; temporal data should require publication dates to be included for proper context" },
      { label: "B", text: "No risk, as statistical data doesn't change significantly over time. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "The risk is minimal if the sources are reputable. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "This only matters for financial data, not general statistics. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Temporal data requires publication dates for proper context. Market statistics from 2020 vs 2025 could tell completely different stories. Without dates, the synthesis may combine current and outdated data, leading to incorrect conclusions. Statistics do change over time (option A). Source reputation (option C) doesn't eliminate temporal validity concerns. All statistical data has temporal relevance (option D)."
  },
  {
    id: 150,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A multi-agent research system needs to pass findings between subagents. What intermediate data structure best preserves information provenance?",
    options: [
      { label: "A", text: "Plain text summaries passed between agents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "A shared vector database that agents can query. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "JSON arrays of URLs that were consulted. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Structured intermediates containing: claim, supporting evidence, source identifier, and confidence score for each finding" }
    ],
    correctAnswer: "D",
    explanation: "Structured intermediates with claim, evidence, source, and confidence fields preserve full provenance as data moves between agents. Plain text (option A) loses structure and provenance. URL lists (option C) don't capture extracted claims or evidence. Vector databases (option D) are useful for retrieval but don't inherently maintain claim-level provenance."
  },
  {
    id: 151,
    domain: 5,
    scenario: 6,
    taskStatement: "5.4: Codebase exploration",
    question: "Your extraction system sends the same long policy document in every request. Costs are high and latency is increasing. Which change best leverages prompt caching safely?",
    options: [
      { label: "A", text: "Disable caching and switch to a larger model with more context. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "Randomize examples in the policy block to improve model variety and cache hit rates. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Embed the policy into each user message so the model always re-reads it. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Keep the stable policy block unchanged across requests and cache it, while putting per-document dynamic content after the cached prefix." }
    ],
    correctAnswer: "D",
    explanation: "Prompt caching works best when a stable prefix is reused exactly across requests. Put static instructions and long policy references in that stable prefix, and append dynamic per-document content after it. Randomizing the prefix (option B) reduces cache hits. Repeating large policy text in each user turn (option C) increases cost. \"Keep the stable policy block unchanged across requests and cache it, while putting per-docum…\" avoids the optimization entirely."
  },
  {
    id: 152,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "A product team wants invoice extraction results to appear incrementally in the UI. Which API behavior should the implementation rely on?",
    options: [
      { label: "A", text: "Wait for the final response body and then split it into chunks on the client. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use streaming responses and process incremental content deltas as they arrive, then persist the finalized message when the stream closes." },
      { label: "C", text: "Poll the API every second until the full response is ready. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Use temperature 0 so responses arrive faster. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Streaming is designed for incremental UX: render deltas as they arrive and store the final assembled response at stream completion. Client-side chunk splitting (option A) is fake streaming because users still wait for full completion. Polling (option C) is unnecessary overhead. Temperature settings (option D) influence randomness, not transport behavior."
  },
  {
    id: 153,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4: Codebase exploration",
    question: "A developer enables extended thinking for difficult debugging tasks and then logs every model block into analytics. What is the key reliability and governance risk?",
    options: [
      { label: "A", text: "No risk, because all thinking blocks are guaranteed to be safe to expose externally. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "The model may refuse to provide final answers when thinking is enabled. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Extended thinking only works in offline mode, so logs are irrelevant. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "Internal reasoning content can be sensitive and should be handled carefully; production logs should focus on required outputs and minimal metadata." }
    ],
    correctAnswer: "D",
    explanation: "When advanced reasoning features are enabled, teams should treat internal reasoning artifacts conservatively and avoid broad external exposure. Production observability should track what is needed for quality and debugging without indiscriminate logging of internal reasoning traces. \"No risk, because all thinking blocks are guaranteed to be safe to expose externally\" is an unsafe assumption. Options B and D are incorrect product claims."
  },
  {
    id: 154,
    domain: 4,
    scenario: 3,
    taskStatement: "4.6: Multi-instance review",
    question: "Your research agent must generate a report where each claim is directly verifiable from source documents. Which output requirement best enforces this?",
    options: [
      { label: "A", text: "Require a bibliography section at the end of the report. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Ask for a persuasive writing style and concise tone. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Ask the model to avoid uncertainty and provide the best single answer. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Require claim-level citations in the output schema so each assertion maps to supporting source passages." }
    ],
    correctAnswer: "D",
    explanation: "Claim-level citation requirements enforce traceability and make downstream verification straightforward. A bibliography alone (option A) does not link specific claims to specific evidence. Writing-style constraints (option B) and confidence language constraints (option D) do not solve provenance."
  },
  {
    id: 155,
    domain: 5,
    scenario: 3,
    taskStatement: "5.5: Human review and confidence calibration",
    question: "A retrieval pipeline currently uses only semantic embeddings and misses exact identifier lookups (for example, error code E-7412). Which improvement is most appropriate?",
    options: [
      { label: "A", text: "Use a hybrid retrieval approach that combines lexical search (for exact tokens) with semantic retrieval, then rerank." },
      { label: "B", text: "Switch entirely to keyword search and remove embeddings. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Increase temperature so the model can infer missing identifiers. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Store fewer documents to reduce retrieval complexity. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Hybrid retrieval addresses complementary failure modes: lexical methods catch exact tokens and IDs, while semantic methods capture conceptual similarity. Combining both and reranking typically improves recall and precision. \"Use a hybrid retrieval approach that combines lexical search (for exact tokens) with semanti…\" loses semantic recall, option C is unrelated to retrieval quality, and option D reduces coverage."
  },
  {
    id: 156,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5: Human review and confidence calibration",
    question: "An extraction assistant misses invoice totals because key-value pairs are split across chunk boundaries. What chunking adjustment is most likely to improve reliability?",
    options: [
      { label: "A", text: "Use random chunk boundaries to diversify retrieval. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Remove chunking and pass every document in full on every request. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Use slightly smaller chunks with intentional overlap so boundary-spanning fields remain visible in at least one chunk." },
      { label: "D", text: "Increase top-k retrieval without changing chunk strategy. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "C",
    explanation: "Boundary errors are commonly improved by overlap-aware chunking, which keeps adjacent context available when fields span boundaries. Sending full documents every turn (option B) hurts cost and latency. Random boundaries (option C) make consistency worse. Raising top-k alone (option D) does not fix broken segmentation."
  },
  // ============================================================
  // DOMAIN 2: Tool Design & MCP Integration (27 questions)
  // ============================================================

  {
    id: 157,
    domain: 2,
    scenario: 4,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your team built an MCP server for internal docs with tools, resources, and prompts. The app needs an always-up-to-date document list to render a picker before model inference. Which MCP primitive should provide that list?",
    options: [
      { label: "A", text: "Tool, because tools are the primary way to fetch any data. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Prompt, because prompts are reusable and parameterized. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Resource, because application-controlled data fetching is the right fit for pre-inference UI hydration." },
      { label: "D", text: "Task, because subagents should own the document picker state. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Resources are appropriate when application code needs to fetch data directly (for example, populating a UI picker) before or outside model tool invocation. Tools are model-invoked actions, and prompts are predefined instruction templates. \"Task, because subagents should own the document picker state\" is unrelated to MCP primitives."
  },
  {
    id: 158,
    domain: 2,
    scenario: 4,
    taskStatement: "2.4: Integrate MCP servers",
    question: "You created a new MCP server and want to quickly verify tool schemas and outputs before wiring it into production workflows. What is the best first step?",
    options: [
      { label: "A", text: "Use an MCP inspector/dev workflow to connect to the server directly and manually run representative tool calls." },
      { label: "B", text: "Deploy to production and monitor failures to learn what is broken. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Skip direct testing and rely on model behavior to adapt to schema issues. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Only test with one happy-path input because schema validation already proves correctness. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "A",
    explanation: "Direct inspection and manual invocation is the fastest way to catch schema mismatches, missing fields, and runtime errors before integration. \"Use an MCP inspector/dev workflow to connect to the server directly and manually run represe…\" is risky, option C assumes robustness that usually does not exist, and option D ignores edge cases."
  },
  // ============================================================
  // DOMAIN 3: Claude Code Configuration & Workflows
  // DOMAIN 4: Prompt Engineering & Structured Output
  // DOMAIN 5: Context Management & Reliability
  // ============================================================

  {
    id: 159,
    domain: 3,
    scenario: 5,
    taskStatement: "3.5: Iterative prompt refinement",
    question: "A team uses Claude Code hooks to enforce policy checks. They want to block writes to migration files but still run formatting checks after successful edits. Which setup is correct?",
    options: [
      { label: "A", text: "Use PostToolUse to block migration writes, because post hooks can stop already-run operations. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Use PreToolUse for blocking protected writes, and PostToolUse for non-blocking feedback actions such as formatting or type checks." },
      { label: "C", text: "Use only PostToolUse hooks for both blocking and feedback to simplify configuration. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Avoid hooks and rely on prompt instructions; enforcement should never be automated. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Blocking must happen before the tool executes, which is what PreToolUse is for. PostToolUse is appropriate for feedback and follow-up checks after actions complete. \"Use PostToolUse to block migration writes, because post hooks can stop already-run operations\" and C misuse post hooks for blocking. \"Avoid hooks and rely on prompt instructions; enforcement should never be automated\" gives up deterministic guardrails."
  },
  {
    id: 160,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6: CI/CD integration",
    question: "You are automating CI checks with the Claude Code SDK and want the agent to be read-only unless explicitly granted edit capability. Which approach matches the SDK model?",
    options: [
      { label: "A", text: "SDK sessions are write-enabled by default; disable writes by setting temperature to 0. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Disable tool use entirely; SDK automation should be text-only for CI. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Allow all tools and rely on a system prompt that asks the model not to edit files. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Default to read-only behavior and explicitly allow write-capable tools through the tool allowlist only when needed." }
    ],
    correctAnswer: "D",
    explanation: "A least-privilege setup is the robust CI pattern: start with read-only capabilities and explicitly allow edits only for workflows that require them. Prompt-only restrictions (option C) are weaker than tool-level controls. Options A and D are incorrect extremes."
  },
  // ============================================================
  // DOMAIN 2: Tool Design & MCP Integration (27 questions)
  // ============================================================

  {
    id: 161,
    domain: 2,
    scenario: 1,
    taskStatement: "2.1: Effective tool interfaces",
    question: "Your customer support system prompt includes the instruction 'always check the customer's order status before proceeding.' The agent has two tools: check_status (a general status tool) and lookup_order (the correct tool for order details). The agent consistently calls check_status instead of lookup_order when handling order queries. What is the most likely root cause?",
    options: [
      { label: "A", text: "Keyword-sensitive instructions in the system prompt ('check...status') create an unintended association with the check_status tool, overriding the tool descriptions." },
      { label: "B", text: "The check_status tool has a shorter name, making it easier for the model to select. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "The model randomly selects between tools with similar functionality. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "The lookup_order tool has a bug preventing it from being selected. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "System prompt keywords can create unintended tool associations. The phrase 'check the customer's order status' closely mirrors the check_status tool name, causing the model to preferentially select it. After updating tool descriptions, always review system prompts for conflicts that could override well-written descriptions. \"Keyword-sensitive instructions in the system prompt ('check...status') create an unintended …\" is wrong - name length does not drive selection. \"The model randomly selects between tools with similar functionality\" mischaracterizes model behavior. \"The lookup_order tool has a bug preventing it from being selected\" blames a technical issue when the problem is prompt-tool interaction."
  },
  {
    id: 162,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1: Explicit criteria",
    question: "A CI code review agent produces accurate security vulnerability warnings but its style violation warnings are 70% false positives. Developers have started ignoring ALL warnings, including legitimate security findings. What is the best immediate action?",
    options: [
      { label: "A", text: "Add a confidence threshold to all warnings to reduce noise. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Reduce the number of files analyzed per review to lower the total warning count. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "Send all warnings to a separate dashboard instead of PR comments. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Temporarily disable the style violation category while improving those prompts, so developers can trust the security findings that remain." }
    ],
    correctAnswer: "D",
    explanation: "High false positive rates in one category destroy trust in ALL categories. The fix is to temporarily disable the problematic category (style violations) while improving its prompts. This immediately restores trust in the accurate category (security). Confidence thresholds (option A) are unreliable. Moving warnings elsewhere (option C) doesn't fix trust. Reducing scope (option D) misses real issues."
  },
  {
    id: 163,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1: Explicit criteria",
    question: "A code review agent uses severity levels defined as: 'Critical = very important issues, Major = moderately important, Minor = less important.' Reviewers notice the agent assigns inconsistent severity — the same pattern is 'critical' in one file and 'minor' in another. What is the most effective fix?",
    options: [
      { label: "A", text: "Add more adjectives to each level ('Critical = extremely urgent and very important'). It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Reduce to two levels (high/low) to simplify the decision. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "Let the model decide severity without definitions and trust its judgment. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Replace prose severity definitions with concrete code examples showing what each severity level looks like — e.g., a SQL injection example for 'critical' and a missing comment for 'minor'." }
    ],
    correctAnswer: "D",
    explanation: "Concrete code examples for each severity level eliminate interpretation ambiguity. Showing 'this SQL injection is critical' and 'this missing comment is minor' gives the model clear, testable reference points. More prose adjectives (option A) remain subjective. Removing definitions (option C) makes inconsistency worse. Reducing levels (option D) loses useful granularity without fixing the calibration problem."
  },
  {
    id: 164,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3: Structured output with tool_use",
    question: "Your extraction schema has an enum field document_type with values ['invoice', 'receipt', 'purchase_order']. When the system encounters a delivery note, the model forces it into 'receipt' even though it's semantically different. What schema design change would handle this?",
    options: [
      { label: "A", text: "Add 'delivery_note' to the enum and every other possible document type. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Remove the enum and use a freeform string field instead. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "C", text: "Make the document_type field nullable so the model can skip it for unknown types. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Add an 'other' enum value paired with a freeform document_type_detail string field for extensible categorization." }
    ],
    correctAnswer: "D",
    explanation: "An 'other' enum value with a freeform detail string provides extensibility: known types are categorized precisely, while novel types are captured with context rather than forced into wrong categories. Adding every possible type (option A) is unmaintainable. Pure freeform (option B) loses the structure benefits of enums. Nullable (option D) loses the information entirely instead of capturing it."
  },
  {
    id: 165,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3: Structured output with tool_use",
    question: "Your extraction pipeline uses strict JSON schemas and produces syntactically valid output. However, date fields appear in inconsistent formats — some as 'MM/DD/YYYY', others as 'DD-MM-YYYY', depending on the source document. What is the best approach to ensure consistent date formatting?",
    options: [
      { label: "A", text: "Include explicit format normalization rules in the prompt alongside the strict schema, specifying that all dates must be ISO 8601 (YYYY-MM-DD)." },
      { label: "B", text: "Add regex validation to reject non-ISO dates and retry until the model produces the correct format. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Use a separate post-processing script that converts all date formats after extraction. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Define the date field as a number (Unix timestamp) to avoid format issues entirely. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Format normalization rules in the prompt alongside strict schemas guide the model to produce consistent output. The schema enforces structure while the prompt specifies format conventions. Regex rejection and retry (option A) wastes tokens on a preventable issue. Post-processing (option C) works but is less efficient than getting it right at extraction time. Unix timestamps (option D) lose readability and may confuse the model."
  },
  {
    id: 166,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5: Batch processing",
    question: "You submit a batch of 5,000 invoice extraction requests using the Message Batches API. When results return, 200 requests have failed — most due to oversized document content exceeding token limits. What is the correct recovery strategy?",
    options: [
      { label: "A", text: "Resubmit the entire batch of 5,000 to ensure consistency. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Identify failed requests by custom_id, chunk the oversized documents into smaller segments, and resubmit only the 200 failures with the modified input." },
      { label: "C", text: "Mark the 200 documents as unprocessable and exclude them from the dataset. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Switch to the synchronous API for all 5,000 documents to avoid batch failures. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "custom_id enables identifying exactly which requests failed. For oversized documents, chunking into smaller segments addresses the root cause. Resubmitting only failures is efficient. Resubmitting all 5,000 (option A) wastes cost and time on the 4,800 that already succeeded. Excluding documents (option C) loses data unnecessarily. Switching to synchronous (option D) loses the 50% cost savings and doesn't fix the token limit issue."
  },
  {
    id: 167,
    domain: 5,
    scenario: 3,
    taskStatement: "5.1: Context preservation",
    question: "In your multi-agent research system, the synthesis agent consistently runs out of context budget. Investigation reveals that upstream subagents (web search, document analysis) return verbose reasoning chains alongside their findings — full paragraphs explaining their search strategy, why they rejected certain sources, and their reasoning process. What is the most effective fix?",
    options: [
      { label: "A", text: "Modify upstream agents to return structured data — key facts, citations, and relevance scores — instead of verbose content and reasoning chains." },
      { label: "B", text: "Increase the synthesis agent's context window to accommodate the verbose output. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "C", text: "Have the coordinator truncate subagent responses to the first 500 tokens. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "D", text: "Run the synthesis agent multiple times, each with a subset of the upstream results. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "A",
    explanation: "Upstream agent optimization means modifying agents to return structured, concise output (key facts, citations, relevance scores) rather than verbose reasoning. This is critical when downstream agents have limited context budgets. Increasing context (option A) delays the problem and increases cost. Arbitrary truncation (option C) risks cutting important findings. Multiple runs (option D) loses the ability to synthesize across all findings."
  },
  {
    id: 168,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2: Escalation and ambiguity resolution",
    question: "A customer contacts support clearly frustrated, using phrases like 'this is ridiculous' and 'I've been waiting forever.' Their issue is a straightforward order status check that the agent can resolve in one tool call. The agent immediately escalates to a human agent due to the negative sentiment. Is this the correct behavior?",
    options: [
      { label: "A", text: "Yes, frustrated customers should always be escalated to preserve the relationship. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "B", text: "No. The agent should acknowledge the frustration, then resolve the straightforward issue. Escalation is only appropriate if the customer explicitly requests a human or reiterates their preference for one after the agent offers help." },
      { label: "C", text: "Yes, but only after confirming the sentiment score exceeds a 0.8 threshold. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "D", text: "No, the agent should ignore the frustration entirely and respond with just the order status. It assumes stable latency and clean success paths, which rarely holds for production agent graphs. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." }
    ],
    correctAnswer: "B",
    explanation: "Sentiment-based escalation is unreliable because frustration does not correlate with case complexity. When the issue is straightforward, the agent should acknowledge the frustration and offer resolution. Escalation should only happen if the customer explicitly requests a human or reiterates their preference after the agent offers help. Always escalating frustrated customers (options A, C) wastes human agent capacity on simple issues. Ignoring frustration (option D) provides poor customer experience."
  },
  {
    id: 169,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3: Error propagation",
    question: "A multi-agent research system produces a report on renewable energy. The web search subagent found data on solar, wind, and biomass, but the document analysis subagent failed to access a journal database for geothermal sources. The synthesis covers solar, wind, and biomass and never mentions geothermal or the access failure. What is the main flaw in this synthesis behavior?",
    options: [
      { label: "A", text: "Nothing is wrong; the report should only discuss sources that returned data. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "The entire report must be discarded whenever any subagent errors. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "It omits coverage of geothermal without stating that the gap exists because a source could not be reached, which misrepresents completeness." },
      { label: "D", text: "The model should fabricate geothermal statistics from parametric knowledge to keep sections balanced. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "C",
    explanation: "Synthesis should surface known coverage gaps (e.g., inaccessible journal DB) instead of silent omission, which reads as authoritative completeness. Partial results are still valuable when limitations are explicit. Discarding everything (C) or inventing data (D) are worse outcomes."
  },
  {
    id: 170,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A research synthesis agent produces a report comparing the GDP growth rates of 10 countries. The report presents all data as flowing prose paragraphs. Stakeholders complain that comparing numbers across countries is difficult. What rendering improvement would best serve this content?",
    options: [
      { label: "A", text: "Add bold formatting to the key numbers within the prose. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "Use content-appropriate rendering: present the financial comparison data as a structured table rather than prose, while keeping narrative context and analysis as prose." },
      { label: "C", text: "Convert the entire report to bullet points for scannability. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "Add a summary paragraph at the top with all 10 GDP figures. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." }
    ],
    correctAnswer: "B",
    explanation: "Content-appropriate rendering means matching the output format to the content type: financial comparison data belongs in tables (easy to scan and compare), while narrative analysis works best as prose. Flattening everything into one format (prose, bullets, or otherwise) makes some content harder to consume. Bold formatting (option A) is a minor improvement. Bullet points for everything (option C) loses narrative flow. A summary paragraph (option D) still uses prose for tabular data."
  },
  {
    id: 171,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6: Information provenance",
    question: "A research agent finds two apparently conflicting statistics: Source A reports 'global AI market size: $50B' and Source B reports 'global AI market size: $75B.' The synthesis agent flags this as a contradiction and asks which source to trust. Upon investigation, Source A collected data in 2023 and Source B in 2025. How should the synthesis handle this?",
    options: [
      { label: "A", text: "Select the more recent figure ($75B) as it is more current. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "B", text: "Present both values with publication dates, explaining that the difference reflects market growth over time rather than a factual contradiction." },
      { label: "C", text: "Average the two values and report $62.5B. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "Discard both values since they cannot be reconciled. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." }
    ],
    correctAnswer: "B",
    explanation: "Temporal awareness is key: different publication dates explain different numbers. Requiring and presenting publication dates turns apparent contradictions into a coherent narrative (market growth from $50B in 2023 to $75B in 2025). Selecting one (option A) loses context. Averaging (option B) produces a meaningless figure. Discarding both (option D) loses valuable trend data."
  },
  // ============================================================
  // DOMAIN 1: Agentic Architecture & Orchestration (40 questions)
  // ============================================================

  {
    id: 172,
    domain: 1,
    scenario: 3,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "A coordinator prompts the web search subagent with: 'Step 1: Search for climate change policies. Step 2: Filter results to peer-reviewed sources only. Step 3: Summarize the top 5 results.' The search returns mostly government reports rather than peer-reviewed papers. The subagent filters them all out in Step 2 and returns an empty summary. What is the root cause?",
    options: [
      { label: "A", text: "The web search tool is misconfigured and returning wrong result types. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "B", text: "The search query needs more specific keywords to find peer-reviewed sources. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "C", text: "The subagent needs access to a scholarly search tool instead of a web search tool. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe." },
      { label: "D", text: "The coordinator prompt uses rigid step-by-step procedures instead of research goals and quality criteria, preventing the subagent from adapting when results don't match expectations." }
    ],
    correctAnswer: "D",
    explanation: "Coordinator prompts should specify research goals and quality criteria, NOT step-by-step procedural instructions. A goal-oriented prompt like 'Find authoritative sources on climate change policies, prioritizing peer-reviewed research but including credible government reports' would let the subagent adapt when search results don't match the expected format. Rigid procedures prevent this adaptability. The search tool (option A) and keywords (option D) are not the core issue. A different tool (option C) may help but doesn't fix the prompt design flaw."
  },
  {
    id: 173,
    domain: 1,
    scenario: 1,
    taskStatement: "1.1: Design agentic loops",
    question: "A developer builds a customer support agent with a hardcoded tool sequence: the code always calls get_customer first, then lookup_order, then process_refund, regardless of the customer's actual request. A customer asks 'What are your return policy hours?' — the agent unnecessarily looks up their account and order history before answering. What is the fundamental design problem?",
    options: [
      { label: "A", text: "The agent needs more tools to handle policy questions. It outsources control flow to brittle prose cues instead of structured API or tool state the runtime can observe. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents." },
      { label: "B", text: "The tool descriptions need to be updated to clarify when each tool should be used. It trades explicit invariants for convenience and fails under retries, caching, or concurrent subagents. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns." },
      { label: "C", text: "The agent should have a separate pipeline for policy questions. It leans on informal heuristics that break down when tool outputs are partial, stale, or contradictory across turns. It assumes stable latency and clean success paths, which rarely holds for production agent graphs." },
      { label: "D", text: "The developer used a pre-configured decision tree instead of model-driven decision-making. The model should reason about which tools to call based on context, not follow a fixed sequence for every request." }
    ],
    correctAnswer: "D",
    explanation: "The distinction between model-driven decision-making and pre-configured decision trees is fundamental. Model-driven approaches let Claude reason about which tool to call based on context — for a policy question, no tools may be needed at all. Pre-configured sequences waste resources on unnecessary steps and cannot adapt to varied requests. More tools (option A) don't fix the rigid sequence. Separate pipelines (option C) over-engineer the solution. Better descriptions (option D) help but don't fix hardcoded sequencing."
  }
];
