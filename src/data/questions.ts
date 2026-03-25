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

  // --- 1.1: Design agentic loops ---
  {
    id: 1,
    domain: 1,
    scenario: 1,
    taskStatement: "1.1: Design agentic loops",
    question: "You are building a customer support agent that uses get_customer, lookup_order, process_refund, and escalate_to_human tools. The agent needs to autonomously resolve tickets by calling tools in sequence until the issue is resolved. How should you determine when the agent has finished processing a ticket?",
    options: [
      { label: "A", text: "Parse the assistant's text response for phrases like 'resolved' or 'complete' to detect when the agent is done." },
      { label: "B", text: "Set a maximum of 5 tool call iterations and terminate the loop after that count is reached." },
      { label: "C", text: "Check the API response's stop_reason field: continue the loop when it equals \"tool_use\" and exit when it equals \"end_turn\"." },
      { label: "D", text: "After each tool call, ask the model explicitly 'Are you done?' and parse the yes/no response." }
    ],
    correctAnswer: "C",
    explanation: "The correct approach is to use the stop_reason field from the API response. When stop_reason is \"tool_use\", the model wants to call another tool and the loop should continue. When stop_reason is \"end_turn\", the model has completed its work. Option A is an anti-pattern because parsing natural language for loop termination is fragile and unreliable - the model might use synonyms or ambiguous phrasing. Option B uses an arbitrary iteration cap, which can prematurely terminate complex tickets requiring many tool calls or waste resources on simple ones. Option D adds unnecessary overhead and is still natural language parsing in disguise."
  },
  {
    id: 2,
    domain: 1,
    scenario: 3,
    taskStatement: "1.1: Design agentic loops",
    question: "In a multi-agent research system, the coordinator agent calls a web search subagent, which returns results. The coordinator then needs to decide whether to call the document analysis subagent or synthesize the findings. A junior developer proposes terminating the coordinator's loop after exactly 3 iterations to prevent runaway costs. What is the primary risk of this approach?",
    options: [
      { label: "A", text: "Three iterations is too many and will always exceed the token budget." },
      { label: "B", text: "Arbitrary iteration caps can prematurely end complex research tasks that legitimately require more steps, while also wasting iterations on simple tasks that need fewer." },
      { label: "C", text: "The coordinator should never loop at all; it should make all decisions in a single pass." },
      { label: "D", text: "Three iterations is the correct number, but it should be configurable via an environment variable." }
    ],
    correctAnswer: "B",
    explanation: "Arbitrary iteration caps are an anti-pattern in agentic loop design. A fixed cap of 3 will cut short a complex research task that genuinely needs 5 tool calls (e.g., search, analyze doc 1, analyze doc 2, cross-reference, synthesize), producing incomplete results. Conversely, it forces the system to run 3 iterations even when 1 would suffice. Option A is wrong because 3 iterations is not inherently too many. Option C is wrong because multi-step research inherently requires looping. Option D misses the fundamental issue: the problem is not the number but the arbitrary fixed nature of the cap. The correct approach is to rely on stop_reason to let the model determine when it has enough information."
  },
  {
    id: 3,
    domain: 1,
    scenario: 4,
    taskStatement: "1.1: Design agentic loops",
    question: "A developer is using Claude to explore a legacy codebase. The agent reads files, searches for patterns, and traces call chains across multiple modules. The developer's implementation appends each tool result to the conversation messages array before sending the next API request. Why is this append-then-resend pattern essential?",
    options: [
      { label: "A", text: "It is not essential; the model remembers previous tool results from the session automatically." },
      { label: "B", text: "Appending tool results to the conversation provides the model with the full context of what it has discovered so far, enabling it to make informed decisions about what to explore next." },
      { label: "C", text: "It is only needed for billing purposes so Anthropic can track tool usage." },
      { label: "D", text: "Tool results should be summarized and replaced, not appended, to keep the context window small." }
    ],
    correctAnswer: "B",
    explanation: "In an agentic loop, the model is stateless between API calls. Each request must include the full conversation history including all previous tool results. By appending tool results to the messages array, you give the model the complete picture of what it has already discovered, allowing it to reason about next steps. Option A is wrong because the API is stateless - there is no automatic session memory. Option C is incorrect; appending is about context, not billing. Option D describes an optimization that can be applied selectively but is not the general approach - premature summarization can lose critical details the model needs for reasoning."
  },
  {
    id: 4,
    domain: 1,
    scenario: 5,
    taskStatement: "1.1: Design agentic loops",
    question: "Your CI pipeline uses an agent to review pull requests. The agent reads changed files, checks for style violations, runs static analysis tools, and posts comments. During testing, you notice the agent sometimes enters an infinite loop, repeatedly calling the same Bash tool to run linting. Which approach best prevents this while preserving the agent's ability to handle complex PRs?",
    options: [
      { label: "A", text: "Add a hard cap of 10 tool calls and terminate the loop regardless of the stop_reason." },
      { label: "B", text: "Check stop_reason for loop control, but add a safety timeout (e.g., 5 minutes wall-clock time) and log when it triggers so you can investigate the root cause." },
      { label: "C", text: "Parse the agent's text output for the word 'loop' or 'repeating' to detect when it is stuck." },
      { label: "D", text: "Remove the Bash tool from the agent's available tools so it cannot run linting." }
    ],
    correctAnswer: "B",
    explanation: "The best approach combines proper stop_reason-based loop control with a practical safety mechanism. A wall-clock timeout lets complex PRs use as many steps as needed while preventing genuine infinite loops, and logging the timeout helps debug the root cause. Option A's hard cap is an arbitrary iteration limit that may cut short legitimate complex reviews. Option C is fragile natural language parsing - an anti-pattern. Option D removes essential functionality; the agent needs Bash to run linting. The right solution preserves full capability while adding a sensible safety net."
  },
  {
    id: 5,
    domain: 1,
    scenario: 6,
    taskStatement: "1.1: Design agentic loops",
    question: "You are building a structured data extraction pipeline that processes invoices. The agent calls tools to read PDFs, extract fields, validate against a JSON schema, and retry extraction for any fields that fail validation. A colleague suggests checking if the assistant's response contains the JSON output to determine loop termination. What is wrong with this approach?",
    options: [
      { label: "A", text: "JSON output in the assistant's response is always valid, so there is no need to check." },
      { label: "B", text: "Parsing the assistant's natural language response for structured output is fragile; instead, use stop_reason to determine when the model is done, and validate the extracted data separately." },
      { label: "C", text: "The assistant never outputs JSON in its text response; it only returns JSON through tool calls." },
      { label: "D", text: "This approach is correct and is the recommended pattern for data extraction agents." }
    ],
    correctAnswer: "B",
    explanation: "Relying on parsing the assistant's text response for JSON (or any structured signal) to control the agentic loop is an anti-pattern. The model might include partial JSON, commentary around JSON, or JSON-like text that is not the final output. The correct approach is to use stop_reason for loop control (continue on \"tool_use\", exit on \"end_turn\") and then validate the extracted data through a separate validation step. Option A is wrong because JSON in text responses can be malformed. Option C is wrong because models can and do output JSON in text. Option D recommends the anti-pattern."
  },
  {
    id: 6,
    domain: 1,
    scenario: 1,
    taskStatement: "1.1: Design agentic loops",
    question: "Your customer support agent processes a refund request. The API response includes a tool_use content block requesting process_refund with amount: 45.99. After executing the refund tool and getting a success result, what should your code do next?",
    options: [
      { label: "A", text: "Return the refund success message to the user immediately and close the loop." },
      { label: "B", text: "Append the tool result to the messages array and make another API call, letting stop_reason determine whether the agent continues or stops." },
      { label: "C", text: "Parse the tool result for the word 'success' and terminate if found." },
      { label: "D", text: "Discard the tool result and ask the model to summarize what happened." }
    ],
    correctAnswer: "B",
    explanation: "After executing a tool, the result must be appended to the conversation and sent back to the model. The model may need to take additional actions (e.g., send a confirmation message, update the ticket status, or call escalate_to_human if the refund partially failed). Only the stop_reason should determine loop termination. Option A prematurely exits - the model might want to confirm the refund to the customer or take follow-up actions. Option C is natural language parsing of tool output, which is fragile. Option D discards valuable context the model needs to reason about next steps."
  },

  // --- 1.2: Multi-agent coordinator-subagent patterns ---
  {
    id: 7,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "You are designing a multi-agent research system where a coordinator delegates tasks to web search, document analysis, and synthesis subagents. Which architecture best describes the recommended pattern for this system?",
    options: [
      { label: "A", text: "A peer-to-peer mesh where each subagent directly communicates with every other subagent." },
      { label: "B", text: "A hub-and-spoke pattern where the coordinator is the central hub, delegating tasks to subagents and collecting their results." },
      { label: "C", text: "A pipeline where web search always runs first, then document analysis, then synthesis, with no coordinator." },
      { label: "D", text: "A shared-memory architecture where all agents read and write to the same context window simultaneously." }
    ],
    correctAnswer: "B",
    explanation: "The hub-and-spoke pattern is the recommended multi-agent coordinator-subagent architecture. The coordinator serves as the central hub that decomposes the research question, delegates specific tasks to specialized subagents (spokes), collects their results, and decides next steps. Option A's peer-to-peer mesh creates unmanageable complexity - subagents calling each other leads to unpredictable behavior and makes debugging nearly impossible. Option C's fixed pipeline is too rigid and prevents the coordinator from adapting (e.g., skipping web search if the answer is in local docs). Option D is not how multi-agent systems work - each agent has its own isolated context."
  },
  {
    id: 8,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "In your multi-agent research system, the coordinator delegates a task to the web search subagent. The web search subagent has its own conversation context. What is the key benefit of this isolated context approach?",
    options: [
      { label: "A", text: "It reduces API costs because each subagent uses fewer tokens than a single large conversation." },
      { label: "B", text: "Each subagent operates with only the context relevant to its task, preventing cross-contamination of concerns and keeping each agent focused on its specialty." },
      { label: "C", text: "Isolated contexts are required by the API; there is no way to share context between agents." },
      { label: "D", text: "It allows subagents to run on different LLM providers simultaneously." }
    ],
    correctAnswer: "B",
    explanation: "Isolated context is a core benefit of the hub-and-spoke multi-agent pattern. Each subagent receives only the context it needs for its specific task, which keeps it focused and prevents irrelevant information from degrading performance. The web search subagent does not need to know about the synthesis agent's prompt or the document analysis results. Option A may be a side effect but is not the primary benefit. Option C is wrong - you could share context, but you deliberately choose not to. Option D is irrelevant to the architectural decision of isolated contexts."
  },
  {
    id: 9,
    domain: 1,
    scenario: 3,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "Your coordinator decomposes a complex research question into subtasks. After receiving results from the web search and document analysis subagents, it notices a contradiction between them. In a hub-and-spoke architecture, what should the coordinator do?",
    options: [
      { label: "A", text: "Let the web search and document analysis subagents negotiate directly with each other to resolve the contradiction." },
      { label: "B", text: "Always prefer the web search results over document analysis since web data is more current." },
      { label: "C", text: "Delegate a follow-up task to the appropriate subagent with the contradictory details, or pass both perspectives to the synthesis subagent with instructions to reconcile them." },
      { label: "D", text: "Terminate the research and report that the question cannot be answered due to conflicting data." }
    ],
    correctAnswer: "C",
    explanation: "In a hub-and-spoke pattern, the coordinator is responsible for all orchestration decisions. When contradictions arise, the coordinator should either delegate targeted follow-up tasks to resolve the conflict or pass the contradiction explicitly to the synthesis subagent for reconciliation. Option A violates the hub-and-spoke pattern by having subagents communicate directly. Option B applies a rigid preference that may not be appropriate (documents might be more authoritative for some questions). Option D gives up prematurely when the coordinator has tools available to resolve the contradiction."
  },
  {
    id: 10,
    domain: 1,
    scenario: 4,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "A developer wants to use a multi-agent system to understand a legacy monolith. The coordinator decomposes the task as: Subagent A analyzes only the database layer, Subagent B analyzes only the API layer, and Subagent C analyzes only the UI layer. Each subagent is told to ignore anything outside its assigned layer. What is the primary risk of this decomposition?",
    options: [
      { label: "A", text: "Having three subagents is too expensive; a single agent should handle all layers." },
      { label: "B", text: "The decomposition boundaries are too narrow, risking incomplete coverage of cross-layer concerns like data flow from database through API to UI, transaction boundaries, and shared models." },
      { label: "C", text: "The subagents will conflict because they all need to read the same files." },
      { label: "D", text: "Three subagents is too few; each database table should have its own subagent." }
    ],
    correctAnswer: "B",
    explanation: "When task decomposition boundaries are too narrow, important cross-cutting concerns fall through the gaps. In a legacy monolith, understanding how data flows from the database through the API to the UI is often the most critical insight. Subagents told to strictly ignore other layers will miss shared models, cross-layer transactions, and architectural coupling. Option A is a cost concern, not an architectural risk. Option C is a practical issue but not the primary risk - file access can be coordinated. Option D makes the over-decomposition problem even worse."
  },
  {
    id: 11,
    domain: 1,
    scenario: 5,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "You are designing a CI system where a coordinator agent reviews PRs by delegating to specialized subagents: a security reviewer, a style checker, and a test coverage analyzer. The security reviewer subagent detects a critical SQL injection vulnerability. In a hub-and-spoke model, how should this finding reach the PR comment?",
    options: [
      { label: "A", text: "The security reviewer subagent posts the PR comment directly using the GitHub API." },
      { label: "B", text: "The security reviewer returns its finding to the coordinator, which aggregates all subagent results and posts a unified PR review comment." },
      { label: "C", text: "The security reviewer sends its finding to the style checker subagent, which formats and posts it." },
      { label: "D", text: "Each subagent maintains its own GitHub connection and posts comments independently in parallel." }
    ],
    correctAnswer: "B",
    explanation: "In hub-and-spoke architecture, all communication flows through the coordinator (hub). Subagents return their results to the coordinator, which aggregates findings from all subagents and produces a unified PR review. This ensures consistent formatting, avoids duplicate comments, and lets the coordinator prioritize findings (e.g., leading with the critical SQL injection). Options A and D violate the hub-and-spoke pattern by giving subagents direct external access. Option C has subagents communicating laterally, which also violates the pattern."
  },

  // --- 1.3: Subagent invocation/context passing ---
  {
    id: 12,
    domain: 1,
    scenario: 3,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "You are implementing the coordinator in a multi-agent research system using the Claude Agent SDK. To spawn a subagent that performs web search, which of the following is the correct approach?",
    options: [
      { label: "A", text: "Make a nested API call within the coordinator's tool handler, passing the full coordinator conversation as the subagent's prompt." },
      { label: "B", text: "Use the Task tool with an explicit prompt containing just the research question and relevant context, and ensure allowedTools includes \"Task\" if further sub-delegation is needed." },
      { label: "C", text: "Write the research question to a shared file and have the subagent poll for new tasks." },
      { label: "D", text: "Use environment variables to pass the research question to a separate process that runs the subagent." }
    ],
    correctAnswer: "B",
    explanation: "The Task tool is the SDK mechanism for spawning subagents. The prompt must explicitly contain all context the subagent needs because subagents do not inherit the parent's conversation context. If the subagent itself needs to spawn further subagents, allowedTools must include \"Task\". Option A is problematic because passing the full coordinator conversation defeats the purpose of isolated context and wastes tokens. Option C uses file-based polling, which is fragile and not how the SDK works. Option D uses process-level separation, which loses the structured tool call interface."
  },
  {
    id: 13,
    domain: 1,
    scenario: 3,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "A developer spawns a document analysis subagent from the coordinator using the Task tool, but the subagent produces a generic response that does not address the specific research question. The developer's Task prompt says: 'Analyze the documents.' What is the most likely cause?",
    options: [
      { label: "A", text: "The subagent needs a higher temperature setting to produce more specific output." },
      { label: "B", text: "The Task prompt lacks explicit context - the subagent does not inherit the coordinator's conversation, so it does not know which documents to analyze or what question to answer." },
      { label: "C", text: "The document analysis subagent is using the wrong model version." },
      { label: "D", text: "The Task tool has a bug and should be replaced with a direct API call." }
    ],
    correctAnswer: "B",
    explanation: "Subagents do not inherit the parent agent's conversation context. The Task prompt 'Analyze the documents' provides no specifics about which documents, what research question, or what format the analysis should take. The prompt must explicitly include all necessary context: the specific documents to analyze, the research question being investigated, and the expected output format. Option A is wrong because temperature affects randomness, not specificity from context. Option C is a configuration issue unrelated to the problem. Option D blames the tool when the issue is the developer's prompt."
  },
  {
    id: 14,
    domain: 1,
    scenario: 1,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "Your customer support system uses an AgentDefinition to define a refund specialist subagent. The AgentDefinition specifies the agent's system prompt, allowed tools (process_refund, get_customer), and output schema. When the coordinator invokes this subagent via the Task tool, what happens to the coordinator's system prompt and tool list?",
    options: [
      { label: "A", text: "The subagent inherits the coordinator's system prompt and merges it with its own AgentDefinition." },
      { label: "B", text: "The subagent uses only its own AgentDefinition configuration - it has its own system prompt and scoped tool list, completely independent of the coordinator." },
      { label: "C", text: "The coordinator's system prompt overrides the AgentDefinition's system prompt." },
      { label: "D", text: "The subagent receives no system prompt at all and relies entirely on the Task tool's prompt parameter." }
    ],
    correctAnswer: "B",
    explanation: "When a subagent is spawned via the Task tool with an AgentDefinition, it operates with its own isolated configuration. The AgentDefinition specifies the subagent's system prompt, allowed tools, and other parameters independently of the coordinator. This isolation is by design - it keeps subagents focused and prevents unintended capability leakage. Option A is wrong because there is no prompt merging. Option C is wrong because the coordinator does not override the subagent's configuration. Option D is wrong because the AgentDefinition does provide a system prompt."
  },
  {
    id: 15,
    domain: 1,
    scenario: 5,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "In a CI code review system, the coordinator needs to spawn a subagent to analyze test coverage for a specific PR. The coordinator knows the PR number, changed files, and repository context. Using fork_session, what is the key difference from using the Task tool?",
    options: [
      { label: "A", text: "fork_session creates a copy of the current conversation state for parallel exploration, while Task creates a fresh subagent with only the explicitly provided context." },
      { label: "B", text: "fork_session is faster because it skips the system prompt initialization." },
      { label: "C", text: "fork_session is only available in the CLI, not in the SDK." },
      { label: "D", text: "There is no difference; fork_session and Task are aliases for the same operation." }
    ],
    correctAnswer: "A",
    explanation: "fork_session and Task serve different purposes. fork_session creates a branch of the current conversation state, which is useful for parallel exploration where you want the forked session to have the same context as the parent. Task creates a fresh subagent with only the explicitly provided prompt and configuration, giving you isolated context. For a CI system analyzing test coverage, you would choose based on whether the subagent needs the coordinator's full conversation history (fork_session) or should start fresh with just the PR details (Task). Option B is incorrect about performance characteristics. Option C is wrong - fork_session is available in the SDK. Option D is wrong - they are fundamentally different operations."
  },
  {
    id: 16,
    domain: 1,
    scenario: 4,
    taskStatement: "1.3: Subagent invocation/context passing",
    question: "A developer wants a subagent to explore a specific module in a legacy codebase and return a summary. The Task tool call includes allowedTools: [\"Read\", \"Grep\", \"Glob\"]. The subagent also needs to spawn its own subagent to analyze a deeply nested dependency. What must be added to allowedTools?",
    options: [
      { label: "A", text: "Add \"Bash\" so the subagent can run arbitrary commands to spawn child processes." },
      { label: "B", text: "Add \"Task\" to allowedTools so the subagent can itself invoke the Task tool to create its own subagents." },
      { label: "C", text: "No change is needed; all subagents automatically have access to the Task tool." },
      { label: "D", text: "Add \"Fork\" to enable sub-delegation." }
    ],
    correctAnswer: "B",
    explanation: "For a subagent to spawn its own subagents, \"Task\" must be explicitly included in its allowedTools. This is not automatic - the tool access must be deliberately granted. This is an intentional design decision that prevents uncontrolled recursive sub-delegation. Option A is wrong because spawning child processes via Bash is not how the SDK handles sub-delegation. Option C is wrong because Task tool access is not automatic. Option D is wrong because the tool is called \"Task\", not \"Fork\"."
  },

  // --- 1.4: Multi-step workflows with enforcement ---
  {
    id: 17,
    domain: 1,
    scenario: 1,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "Your customer support agent must always look up the customer's account before processing any refund. You want to guarantee this ordering. Which approach provides the strongest enforcement?",
    options: [
      { label: "A", text: "Add a sentence to the system prompt: 'Always look up the customer before processing refunds.'" },
      { label: "B", text: "Implement a programmatic hook that blocks the process_refund tool call if get_customer has not been called previously in the conversation." },
      { label: "C", text: "Order the tools in the API request with get_customer listed before process_refund." },
      { label: "D", text: "Use a lower temperature to make the model more likely to follow the correct order." }
    ],
    correctAnswer: "B",
    explanation: "Programmatic prerequisites using hooks provide deterministic enforcement - the process_refund call will be physically blocked if get_customer has not been called, regardless of what the model decides. Option A is prompt-based guidance, which is probabilistic - the model usually follows it but can occasionally skip it, especially under complex conditions. Option C has no effect on tool call ordering; the API does not infer sequence from tool list order. Option D affects randomness but does not guarantee ordering. For compliance-critical workflows, programmatic enforcement is always preferred over prompt-based guidance."
  },
  {
    id: 18,
    domain: 1,
    scenario: 1,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "When the customer support agent escalates a ticket to a human agent using the escalate_to_human tool, what should the handoff include to ensure the human agent can continue without re-investigating?",
    options: [
      { label: "A", text: "Just the customer ID and a flag indicating escalation." },
      { label: "B", text: "The full raw conversation log including all API request/response payloads." },
      { label: "C", text: "A structured handoff summary containing: customer details, order information, actions already taken (e.g., refund attempted), the reason for escalation, and any relevant error messages." },
      { label: "D", text: "A link to the conversation in the logging dashboard for the human agent to review." }
    ],
    correctAnswer: "C",
    explanation: "A structured handoff summary provides the human agent with actionable context in an organized format. It should include what the agent already tried, what failed, customer/order context, and why escalation was triggered. Option A is too sparse - the human agent would need to re-investigate everything. Option B is too much raw data - API payloads include system prompts, token counts, and technical details that obscure the relevant information. Option D assumes the human has access to and time to review the logging dashboard, adding friction to the handoff."
  },
  {
    id: 19,
    domain: 1,
    scenario: 6,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "You have a structured data extraction pipeline with three steps: (1) extract raw fields from a document, (2) validate against a JSON schema, (3) transform and enrich the data. You need to ensure step 3 never runs on data that failed validation in step 2. Which implementation is most robust?",
    options: [
      { label: "A", text: "Include in the prompt: 'Do not proceed to enrichment if validation fails.'" },
      { label: "B", text: "Implement the pipeline as three separate tool calls where a programmatic hook on the transform tool checks that the validation tool's most recent result was a pass." },
      { label: "C", text: "Run all three steps in parallel and discard the enrichment result if validation failed." },
      { label: "D", text: "Set the model's temperature to 0 to ensure it always follows the correct order." }
    ],
    correctAnswer: "B",
    explanation: "A programmatic hook on the transform tool that verifies the validation tool passed provides deterministic enforcement. The transform simply cannot execute if validation has not succeeded. Option A is prompt-based guidance, which is probabilistic and can fail. Option C wastes resources running enrichment on potentially invalid data and risks race conditions. Option D does not guarantee workflow ordering; temperature 0 reduces randomness but does not enforce prerequisites."
  },
  {
    id: 20,
    domain: 1,
    scenario: 5,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "In your CI pipeline, the code review agent must run the test suite before approving a PR. A developer argues that a system prompt instruction is sufficient because 'the model always runs tests first in our testing.' Why is this reasoning flawed for a production CI system?",
    options: [
      { label: "A", text: "System prompts are ignored by newer model versions." },
      { label: "B", text: "Prompt-based guidance is probabilistic, not deterministic. In production at scale, even a 1% failure rate means PRs get approved without tests, which is unacceptable for a CI gate. Programmatic enforcement is needed." },
      { label: "C", text: "System prompts have a token limit that prevents including workflow instructions." },
      { label: "D", text: "The model runs tests first in testing because of the test data, not because of the prompt." }
    ],
    correctAnswer: "B",
    explanation: "The key distinction is probabilistic vs. deterministic enforcement. 'Always works in testing' does not mean 'guaranteed in production.' At scale, even rare prompt non-compliance becomes a real problem. If 1 in 100 PRs gets approved without running tests, that is a serious CI reliability issue. Programmatic hooks that block the approve action until tests have run provide the deterministic guarantee a CI system needs. Option A is wrong - system prompts are not ignored. Option C is wrong - token limits are not the issue. Option D misattributes the behavior."
  },
  {
    id: 21,
    domain: 1,
    scenario: 4,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "A developer uses Claude to generate boilerplate code for a new service. The workflow requires: (1) read the existing service template, (2) generate code based on the template, (3) run linting on the generated code. The developer wants to allow skipping the linting step for quick prototyping. Which approach best balances enforcement with flexibility?",
    options: [
      { label: "A", text: "Use programmatic enforcement for steps 1-2 (template must be read before generation) and prompt-based guidance for step 3 (linting), since linting is optional during prototyping." },
      { label: "B", text: "Use prompt-based guidance for all steps since the developer might want to skip any of them." },
      { label: "C", text: "Use programmatic enforcement for all steps with no exceptions." },
      { label: "D", text: "Remove linting from the workflow entirely since it is not always needed." }
    ],
    correctAnswer: "A",
    explanation: "This is a nuanced tradeoff. Steps 1-2 have a strict dependency (you cannot generate from a template you have not read), so programmatic enforcement is appropriate. Step 3 (linting) is a quality step that the developer explicitly wants to be optional during prototyping, making prompt-based guidance appropriate - the model is encouraged to lint but not blocked from skipping it. Option B removes enforcement from the critical template-reading prerequisite. Option C prevents the desired flexibility for prototyping. Option D permanently removes a useful quality check."
  },

  // --- 1.5: Agent SDK hooks for tool call interception ---
  {
    id: 22,
    domain: 1,
    scenario: 1,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your customer support agent should never process refunds over $500 without human approval. You implement this as a hook. Which type of hook is appropriate, and why?",
    options: [
      { label: "A", text: "A PostToolUse hook that reverses the refund after it executes if the amount exceeded $500." },
      { label: "B", text: "A hook that intercepts the process_refund tool call before execution, checks the amount parameter, and blocks the call if amount > 500, returning an error message instructing the agent to escalate." },
      { label: "C", text: "A prompt instruction saying 'Never refund more than $500 without human approval.'" },
      { label: "D", text: "A PostToolUse hook that logs a warning when refunds exceed $500." }
    ],
    correctAnswer: "B",
    explanation: "A pre-execution hook that blocks policy-violating tool calls before they execute is the correct pattern for enforcing business rules. The hook inspects the process_refund parameters, and if amount > 500, it blocks the call and returns a structured error telling the agent to escalate. Option A is dangerous - reversing a refund after execution may not be possible and creates financial complications. Option C is prompt-based guidance, which is probabilistic and unacceptable for financial compliance. Option D only logs after the fact - the unauthorized refund has already been processed."
  },
  {
    id: 23,
    domain: 1,
    scenario: 6,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your structured data extraction agent extracts phone numbers from documents. Different documents use different formats (e.g., '(555) 123-4567', '555.123.4567', '+1-555-123-4567'). You want all extracted phone numbers stored in E.164 format (+15551234567). Where should this normalization happen?",
    options: [
      { label: "A", text: "In the system prompt: 'Always output phone numbers in E.164 format.'" },
      { label: "B", text: "In a PostToolUse hook that intercepts the extraction tool's output and programmatically normalizes all phone number fields to E.164 format before the result is added to the conversation." },
      { label: "C", text: "In a separate agent that processes the extraction output." },
      { label: "D", text: "In the JSON schema validation step, rejecting any non-E.164 numbers and retrying." }
    ],
    correctAnswer: "B",
    explanation: "A PostToolUse hook for data normalization is the recommended pattern. It intercepts tool output and applies deterministic transformations (regex-based phone number normalization) before the data enters the conversation. This is reliable because it is programmatic, not probabilistic. Option A relies on the model to correctly format every variation, which is error-prone. Option C adds unnecessary complexity with a separate agent for a deterministic transformation. Option D wastes tokens on retry loops for something that can be fixed programmatically."
  },
  {
    id: 24,
    domain: 1,
    scenario: 5,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your CI agent uses a Bash tool to run commands during code review. You want to prevent the agent from ever running 'rm -rf' or 'git push --force' commands. Should you use a hook or a prompt instruction?",
    options: [
      { label: "A", text: "A prompt instruction is sufficient since the model will reliably follow 'never run destructive commands.'" },
      { label: "B", text: "A deterministic hook that inspects the Bash tool's command parameter and blocks any call containing dangerous patterns like 'rm -rf' or 'git push --force'." },
      { label: "C", text: "Both a hook and a prompt instruction, but the hook is the enforcement mechanism and the prompt helps the model avoid triggering the hook." },
      { label: "D", text: "Neither; the CI environment should use read-only filesystem permissions instead." }
    ],
    correctAnswer: "C",
    explanation: "The best approach combines both: a deterministic hook that physically blocks dangerous commands (the enforcement mechanism) and a prompt instruction that tells the model to avoid those commands (reducing unnecessary hook triggers). The hook is the safety net; the prompt is the first line of defense. Option A alone is insufficient for security-critical operations because prompts are probabilistic. Option B alone works for enforcement but causes a worse user experience when the model repeatedly tries blocked commands. Option D is a valid additional layer but does not address git operations and is not always feasible in CI environments."
  },
  {
    id: 25,
    domain: 1,
    scenario: 1,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "A PostToolUse hook on your get_customer tool normalizes the customer's address to a standard format after retrieval. During testing, you notice the model sometimes ignores the normalized address and uses the raw address from its earlier context. What should you do?",
    options: [
      { label: "A", text: "Increase the temperature so the model pays more attention to recent context." },
      { label: "B", text: "Ensure the hook modifies the tool result in the conversation messages before the model sees it, so the raw address is never present in the model's context." },
      { label: "C", text: "Add a prompt instruction: 'Always use the normalized address, not the raw address.'" },
      { label: "D", text: "Run the normalization hook twice to make sure it takes effect." }
    ],
    correctAnswer: "B",
    explanation: "The PostToolUse hook must modify the tool result in the conversation messages before the next API call, replacing the raw data with the normalized version. If the raw address was already in the model's context from a previous message, the hook needs to ensure the normalized version is what the model sees going forward. Option A does not solve the underlying data issue. Option C adds prompt-based guidance on top of a data problem. Option D is cargo-cult debugging that does not address the root cause of the raw data appearing in context."
  },
  {
    id: 26,
    domain: 1,
    scenario: 4,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "You are building a developer productivity tool where Claude generates code. A hook intercepts the Write tool to ensure generated files always include a copyright header. What makes this a better approach than prompting the model to include headers?",
    options: [
      { label: "A", text: "Hooks are faster than model inference." },
      { label: "B", text: "A deterministic hook guarantees 100% compliance regardless of model behavior, context window pressure, or prompt complexity, whereas prompt-based guidance may occasionally be skipped." },
      { label: "C", text: "Hooks can add headers in languages the model does not know." },
      { label: "D", text: "The model cannot write file headers; only hooks can." }
    ],
    correctAnswer: "B",
    explanation: "The fundamental advantage of hooks over prompts is determinism vs. probabilism. A hook that programmatically prepends a copyright header to every file write operation provides a 100% guarantee of compliance. Prompt-based guidance might fail under context window pressure, complex multi-file operations, or edge cases the prompt did not anticipate. Option A is misleading - both happen but serve different roles. Option C is wrong - models can handle many languages. Option D is wrong - models can include headers, just not with guaranteed reliability."
  },

  // --- 1.6: Task decomposition strategies ---
  {
    id: 27,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "Your multi-agent research system needs to analyze a collection of 50 research papers to answer a complex question. Which decomposition strategy is most appropriate?",
    options: [
      { label: "A", text: "Send all 50 papers to a single agent with instructions to analyze them all at once." },
      { label: "B", text: "Use a fixed sequential pipeline: paper 1, then paper 2, then paper 3, etc., each analyzed by the same agent." },
      { label: "C", text: "Per-file analysis where each paper gets its own subagent, followed by a cross-file integration pass that synthesizes findings across all papers." },
      { label: "D", text: "Randomly sample 5 papers and analyze only those, assuming they are representative." }
    ],
    correctAnswer: "C",
    explanation: "The per-file analysis plus cross-file integration pattern is ideal for large document collections. Each paper gets focused analysis in its own subagent (isolated context prevents cross-contamination), and then a synthesis pass integrates findings across all papers to answer the research question. Option A will likely exceed context window limits with 50 papers. Option B is sequential and slow without clear benefit over parallel per-file analysis. Option D discards 90% of the data without justification, risking missing critical findings."
  },
  {
    id: 28,
    domain: 1,
    scenario: 5,
    taskStatement: "1.6: Task decomposition strategies",
    question: "A CI pipeline needs to review a PR that modifies 15 files across 3 modules. The review should check each file for bugs and also verify cross-module interface compatibility. Which decomposition approach best handles this?",
    options: [
      { label: "A", text: "A fixed sequential pipeline: check file 1 for bugs, then file 2 for bugs, ..., then file 15, then check interfaces." },
      { label: "B", text: "Per-file analysis for bug checking (each file reviewed independently) followed by a cross-file integration pass focused on interface compatibility across the 3 modules." },
      { label: "C", text: "A single agent that reviews all 15 files in one pass for both bugs and interface compatibility." },
      { label: "D", text: "Three module-level agents that each review only their own module's files with no cross-module analysis." }
    ],
    correctAnswer: "B",
    explanation: "This mirrors the per-file analysis + cross-file integration pattern. Per-file bug checking can be parallelized across the 15 files for speed, and each file gets focused analysis. The cross-file integration pass then specifically examines how the 3 modules interact, catching interface mismatches that per-file analysis would miss. Option A is unnecessarily sequential. Option C risks context window issues and may miss details with so many files. Option D misses the critical cross-module interface compatibility check."
  },
  {
    id: 29,
    domain: 1,
    scenario: 4,
    taskStatement: "1.6: Task decomposition strategies",
    question: "A developer asks Claude to generate a complete CRUD API with 10 endpoints. One approach uses prompt chaining (a fixed sequential pipeline): generate models, then controllers, then routes, then tests. Another uses dynamic adaptive decomposition where the agent decides the order. When is the fixed pipeline preferable?",
    options: [
      { label: "A", text: "Never; dynamic decomposition is always superior." },
      { label: "B", text: "When the task has a well-understood, predictable structure with clear dependencies (models before controllers before routes), the fixed pipeline is simpler, more predictable, and easier to debug." },
      { label: "C", text: "When the developer wants the agent to be creative about the API design." },
      { label: "D", text: "When the number of endpoints exceeds 20." }
    ],
    correctAnswer: "B",
    explanation: "Fixed sequential pipelines (prompt chaining) excel when the task structure is well-understood and predictable. Generating a CRUD API has clear dependencies: models define the data, controllers use models, routes map to controllers, tests cover everything. This predictability makes a fixed pipeline simpler to implement, easier to debug, and more reliable than dynamic decomposition. Option A is dogmatic - the right decomposition depends on the task. Option C conflates decomposition strategy with creative freedom. Option D is arbitrary and unrelated to the choice between fixed and dynamic decomposition."
  },
  {
    id: 30,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "The coordinator in your research system uses dynamic adaptive decomposition. After the web search subagent returns results, the coordinator realizes the research question requires a different type of analysis than originally planned. What is the key advantage of dynamic decomposition in this situation?",
    options: [
      { label: "A", text: "Dynamic decomposition is cheaper because it uses fewer API calls." },
      { label: "B", text: "The coordinator can adapt its plan based on intermediate results, adding or modifying subtasks that were not in the original decomposition." },
      { label: "C", text: "Dynamic decomposition is faster because all subtasks run in parallel." },
      { label: "D", text: "The coordinator can change the model used by each subagent mid-execution." }
    ],
    correctAnswer: "B",
    explanation: "The key advantage of dynamic adaptive decomposition over fixed pipelines is the ability to react to intermediate results. If web search reveals the question requires statistical analysis rather than the originally planned qualitative analysis, the coordinator can adjust by spawning a different type of subagent. Fixed pipelines cannot adapt because the steps are predetermined. Option A is wrong - dynamic decomposition often uses more API calls due to the coordinator's reasoning overhead. Option C conflates parallelism with dynamism. Option D describes a capability unrelated to decomposition strategy."
  },

  // --- 1.7: Session state, resumption, forking ---
  {
    id: 31,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer is using Claude Code to refactor a large module. After making changes to 5 files, they need to take a break and continue tomorrow. They used `--resume` with a named session. When they resume, what is preserved?",
    options: [
      { label: "A", text: "Only the last tool call and its result are preserved; previous context is discarded." },
      { label: "B", text: "The full conversation history including all tool calls, results, and the model's reasoning, allowing the developer to continue exactly where they left off." },
      { label: "C", text: "Only the system prompt is preserved; the developer must re-explain what they were working on." },
      { label: "D", text: "The file changes are preserved, but the conversation context is lost." }
    ],
    correctAnswer: "B",
    explanation: "When using --resume with a session name, the full conversation history is preserved. This includes every message, tool call, tool result, and model response. The developer can continue the refactoring session with full context of what was already done. Option A incorrectly discards history. Option C loses all the work context. Option D conflates filesystem state with session state - file changes persist on disk regardless, but the conversation context is what --resume preserves."
  },
  {
    id: 32,
    domain: 1,
    scenario: 4,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer is exploring two different refactoring approaches for a legacy system. They want to evaluate both approaches independently without one polluting the other's context. Which feature is designed for this use case?",
    options: [
      { label: "A", text: "Open two terminal windows and run the same session in both." },
      { label: "B", text: "Use fork_session to create two independent branches from the current conversation state, each exploring a different approach with its own context." },
      { label: "C", text: "Use --resume to switch between two named sessions, manually re-explaining the context each time." },
      { label: "D", text: "Copy the conversation log to a file and paste it into a new session." }
    ],
    correctAnswer: "B",
    explanation: "fork_session is designed exactly for this scenario - parallel exploration of different approaches. It creates independent branches from the current conversation state, so both explorations start with the same context (understanding of the legacy system) but then diverge independently. Option A would cause conflicts with the same session state. Option C requires manual context management and loses the shared starting point. Option D is error-prone and loses the structured session state."
  },
  {
    id: 33,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer has been working in a long Claude Code session for 3 hours. The context window is nearly full, and the agent's responses are becoming less coherent. What is the recommended approach?",
    options: [
      { label: "A", text: "Continue the session and hope the model handles the long context." },
      { label: "B", text: "Start a fresh session with a concise summary of the current state and remaining tasks, rather than resuming the stale session." },
      { label: "C", text: "Delete the session and start completely from scratch with no context." },
      { label: "D", text: "Use fork_session to create a branch, which automatically compresses the context." }
    ],
    correctAnswer: "B",
    explanation: "When a session becomes stale with a nearly full context window, starting fresh with a summary is the recommended approach. The summary preserves the essential decisions, completed work, and remaining tasks without carrying the full weight of 3 hours of tool calls and intermediate reasoning. Option A ignores a known degradation problem. Option C loses all context unnecessarily - a summary preserves the important parts. Option D is wrong because fork_session does not compress context; it copies it, so both branches would have the same context window pressure."
  },
  {
    id: 34,
    domain: 1,
    scenario: 5,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "Your CI pipeline uses Claude Code to review PRs. Each PR review starts a new session. A developer argues that sessions should be resumed across multiple PRs to build up 'knowledge' about the codebase over time. Why is this problematic?",
    options: [
      { label: "A", text: "Resuming sessions is not supported in CI environments." },
      { label: "B", text: "Long-running sessions accumulate stale context from previous PRs (old file contents, resolved issues) that can confuse the agent and lead to reviews based on outdated information." },
      { label: "C", text: "Session resumption costs more because Anthropic charges per-session fees." },
      { label: "D", text: "The CI server does not have enough disk space to store session history." }
    ],
    correctAnswer: "B",
    explanation: "Resuming sessions across PRs accumulates stale results. The agent would carry context about previous PRs' file states, issues, and discussions, which may conflict with the current PR's changes. For example, if a file was refactored in PR #42, the agent reviewing PR #43 with the resumed session might reference the pre-refactoring state. Fresh sessions with relevant context (like CLAUDE.md and project conventions) are more reliable for CI. Option A is a technical claim that is not necessarily true. Option C describes a non-existent pricing model. Option D is a storage concern, not an architectural one."
  },
  {
    id: 35,
    domain: 1,
    scenario: 4,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "A developer uses --resume with a named session 'auth-refactor' to continue work from yesterday. The codebase has changed significantly since then because a colleague merged a large PR overnight. What risk does this create?",
    options: [
      { label: "A", text: "No risk; the resumed session will automatically detect and adapt to codebase changes." },
      { label: "B", text: "The resumed session's context contains stale file contents and analysis from yesterday. The agent may reference outdated code, make assumptions based on removed functions, or suggest changes that conflict with the colleague's merged work." },
      { label: "C", text: "The risk is only that the session will be slower to load." },
      { label: "D", text: "The resumed session will crash if it detects file changes." }
    ],
    correctAnswer: "B",
    explanation: "This is the stale context problem with session resumption. The session was saved with yesterday's codebase state in its conversation history. Tool results from reading files contain yesterday's content. The model's reasoning and plans reference yesterday's code structure. After a significant codebase change, this stale context can lead the agent to make incorrect assumptions. The developer should either start a fresh session with a summary of remaining tasks or at minimum have the agent re-read changed files before continuing. Option A is wrong - there is no automatic change detection. Option C understates the risk. Option D is wrong - sessions do not crash on external changes."
  },
  {
    id: 36,
    domain: 1,
    scenario: 2,
    taskStatement: "1.7: Session state, resumption, forking",
    question: "You want to test whether Claude Code generates better React components using TypeScript or JavaScript for your project. Using fork_session from your current session (which has project context loaded), you create two branches. What is true about the forked sessions?",
    options: [
      { label: "A", text: "Both forks share live state - changes in one appear in the other." },
      { label: "B", text: "Each fork is an independent copy of the conversation state at the point of forking. Changes in one fork do not affect the other, allowing genuine parallel experimentation." },
      { label: "C", text: "The original session is deleted when forks are created." },
      { label: "D", text: "Forks can only be created from the beginning of a session, not from the current point." }
    ],
    correctAnswer: "B",
    explanation: "fork_session creates independent copies of the conversation state at the point of forking. Each fork then evolves independently - the TypeScript branch and JavaScript branch will have different tool calls, results, and reasoning from the fork point onward, while sharing the same pre-fork context about the project. Option A describes shared mutable state, which would defeat the purpose of forking. Option C is wrong - the original session is preserved. Option D is wrong - forking happens at the current point in the conversation, which is the whole purpose."
  },

  // --- Additional D1 questions to reach 40 ---
  {
    id: 37,
    domain: 1,
    scenario: 1,
    taskStatement: "1.2: Multi-agent coordinator-subagent patterns",
    question: "Your customer support system has grown to include a billing specialist subagent, a technical support subagent, and a returns subagent. The coordinator routes tickets to the appropriate subagent. A new requirement says that complex tickets may need input from multiple subagents. In hub-and-spoke, how should this be handled?",
    options: [
      { label: "A", text: "Have the billing subagent call the technical support subagent directly when it detects a technical issue." },
      { label: "B", text: "The coordinator delegates to the billing subagent first, collects its result, then delegates to the technical support subagent with relevant context from the billing analysis, and finally synthesizes both results." },
      { label: "C", text: "Create a new 'multi-specialist' subagent that has all the tools of billing, technical, and returns combined." },
      { label: "D", text: "Run all three subagents simultaneously and let the customer choose which result to use." }
    ],
    correctAnswer: "B",
    explanation: "In hub-and-spoke, the coordinator manages all cross-subagent coordination. It delegates to each specialist sequentially (or in parallel if independent), collects results, and synthesizes them. The coordinator passes relevant context from one subagent's results to the next. Option A violates hub-and-spoke by having lateral communication between subagents. Option C collapses the separation of concerns that makes the multi-agent architecture valuable. Option D puts coordination burden on the customer, which is a poor experience."
  },
  {
    id: 38,
    domain: 1,
    scenario: 3,
    taskStatement: "1.6: Task decomposition strategies",
    question: "Your research system receives the query: 'Compare the environmental policies of the G7 nations and predict their impact on carbon emissions by 2030.' The coordinator must decompose this. Which decomposition avoids the 'too narrow' anti-pattern?",
    options: [
      { label: "A", text: "Create 7 subagents, one per nation, each analyzing only their assigned country's policy in complete isolation." },
      { label: "B", text: "Create 7 per-country analysis subagents, then a cross-country comparison subagent that receives all 7 analyses and identifies patterns, contrasts, and combined emissions projections." },
      { label: "C", text: "Send the entire query to a single subagent and let it handle everything." },
      { label: "D", text: "Create 21 subagents: 7 for policy extraction, 7 for impact analysis, and 7 for prediction." }
    ],
    correctAnswer: "B",
    explanation: "The query explicitly asks for comparison and combined impact, which requires cross-country analysis. Option A decomposes too narrowly - 7 isolated country analyses will miss the comparison and combined emissions prediction that the query requires. Option B correctly uses per-country analysis (the 'per-file' pattern) followed by a cross-file integration pass for comparison and synthesis. Option C lacks parallelism and may exceed context limits. Option D over-decomposes, creating unnecessary coordination overhead without clear benefit."
  },
  {
    id: 39,
    domain: 1,
    scenario: 6,
    taskStatement: "1.5: Agent SDK hooks for tool call interception",
    question: "Your data extraction agent processes invoices from multiple vendors. Some vendors use 'MM/DD/YYYY' dates, others use 'DD-MM-YYYY'. You need all dates stored in ISO 8601 format (YYYY-MM-DD). You implement a PostToolUse hook for normalization. Why is this preferable to having the model normalize dates in-context?",
    options: [
      { label: "A", text: "PostToolUse hooks run faster than model inference." },
      { label: "B", text: "A PostToolUse hook applies a deterministic date parsing algorithm that handles all vendor formats consistently, while the model might misinterpret ambiguous dates like '03/04/2025' (March 4 vs April 3) differently depending on context." },
      { label: "C", text: "The model cannot parse dates at all." },
      { label: "D", text: "PostToolUse hooks can access the internet to verify dates." }
    ],
    correctAnswer: "B",
    explanation: "Date normalization is a classic case where deterministic hooks outperform probabilistic model reasoning. A date like '03/04/2025' is genuinely ambiguous - it could be March 4 or April 3 depending on the vendor's locale. A deterministic hook can apply vendor-specific parsing rules consistently, while the model might interpret it differently based on surrounding context or make inconsistent choices across documents. Option A is not the primary benefit. Option C is wrong - models can parse dates but not always correctly. Option D describes capability hooks do not typically have."
  },
  {
    id: 40,
    domain: 1,
    scenario: 2,
    taskStatement: "1.4: Multi-step workflows with enforcement",
    question: "In a Claude Code workflow, a developer wants to ensure that every generated file is added to the project's CLAUDE.md as a documented module before the session ends. A teammate suggests using a prompt: 'Remember to update CLAUDE.md before finishing.' Why is this insufficient for a team-wide standard?",
    options: [
      { label: "A", text: "CLAUDE.md is read-only and cannot be updated by the model." },
      { label: "B", text: "Prompt-based guidance is probabilistic. Under context pressure or complex sessions, the model may forget this instruction. For a team-wide standard, a programmatic hook that checks whether CLAUDE.md was updated with new module entries before allowing the session to end would provide reliable enforcement." },
      { label: "C", text: "CLAUDE.md is not part of the Claude Code workflow." },
      { label: "D", text: "The prompt instruction is sufficient; programmatic enforcement is overkill for documentation tasks." }
    ],
    correctAnswer: "B",
    explanation: "For team-wide standards, programmatic enforcement is necessary because prompt-based guidance fails probabilistically. In long sessions with many tool calls, the instruction to update CLAUDE.md can be lost in context. A hook that verifies CLAUDE.md was modified to include new module entries before allowing session completion ensures 100% compliance. Option A is wrong - CLAUDE.md can be written to. Option C is wrong - CLAUDE.md is central to Claude Code workflows. Option D is wrong - if it is a team standard, occasional non-compliance creates inconsistency."
  },

  // ============================================================
  // DOMAIN 2: Tool Design & MCP Integration (27 questions)
  // ============================================================

  // --- 2.1: Effective tool interfaces ---
  {
    id: 41,
    domain: 2,
    scenario: 1,
    taskStatement: "2.1: Effective tool interfaces",
    question: "You are defining the tool descriptions for the customer support agent's four tools: get_customer, lookup_order, process_refund, and escalate_to_human. The get_customer description says: 'Gets customer information.' Why is this description inadequate?",
    options: [
      { label: "A", text: "The description is too short. Tool descriptions are the primary mechanism for LLM tool selection and should include input formats, expected parameters, edge cases, and boundaries of what the tool can and cannot do." },
      { label: "B", text: "The description is fine; tool descriptions are not important because the model selects tools based on their names." },
      { label: "C", text: "The description should include the tool's implementation code." },
      { label: "D", text: "The description needs to be in JSON format." }
    ],
    correctAnswer: "A",
    explanation: "Tool descriptions are the primary mechanism the LLM uses to decide which tool to call and with what parameters. A description like 'Gets customer information' does not tell the model: what input is expected (email? customer ID? phone number?), what information is returned (name, order history, account status?), edge cases (what happens if the customer is not found?), or boundaries (does it return payment info or just profile data?). Option B is wrong - descriptions are far more important than names for tool selection. Option C confuses description with implementation. Option D confuses format with content."
  },
  {
    id: 42,
    domain: 2,
    scenario: 1,
    taskStatement: "2.1: Effective tool interfaces",
    question: "The customer support agent has two tools: lookup_order (description: 'Look up an order by order ID to get order details, shipping status, and item list') and get_customer (description: 'Look up customer information including their recent orders and order history'). The agent frequently calls get_customer when it should call lookup_order for a specific order. What is the most likely cause?",
    options: [
      { label: "A", text: "The model is randomly selecting tools." },
      { label: "B", text: "The tool descriptions overlap - both mention 'orders', making it ambiguous which tool to use when the agent needs order information. The descriptions should clearly delineate boundaries." },
      { label: "C", text: "The model prefers tools with shorter names." },
      { label: "D", text: "lookup_order should be renamed to something more descriptive." }
    ],
    correctAnswer: "B",
    explanation: "When tool descriptions overlap, the LLM cannot reliably distinguish which tool to use for a given situation. Both tools mention orders, so when the agent needs order info, it is ambiguous whether to use lookup_order (specific order by ID) or get_customer (includes order history). The fix is to make descriptions clearly delineate boundaries: get_customer should say 'Returns customer profile and account status. For detailed order information, use lookup_order instead.' Option A is wrong - models do not randomly select tools. Option C is wrong - name length does not drive selection. Option D focuses on naming when the description overlap is the real issue."
  },
  {
    id: 43,
    domain: 2,
    scenario: 6,
    taskStatement: "2.1: Effective tool interfaces",
    question: "You are designing an extraction tool for a structured data pipeline. The tool extracts fields from invoice documents. Which tool description best follows interface design best practices?",
    options: [
      { label: "A", text: "'Extracts data from invoices.'" },
      { label: "B", text: "'Extract structured fields from an invoice document. Input: document_text (string, required) - the full text content of the invoice. Output: JSON object with fields: vendor_name (string), invoice_date (ISO 8601), line_items (array of {description, quantity, unit_price}), total (number). Returns null for fields not found in the document. Does NOT validate the extracted data - use validate_extraction for validation.'" },
      { label: "C", text: "'Takes a document and returns JSON. See API docs for details.'" },
      { label: "D", text: "'Invoice tool - handles everything related to invoices including extraction, validation, and storage.'" }
    ],
    correctAnswer: "B",
    explanation: "Option B follows all best practices for tool descriptions: it specifies the input format and type, describes the output schema with field types, explains edge case behavior (null for missing fields), and clearly delineates boundaries (extraction only, not validation). Option A is too vague. Option C references external docs the model cannot read. Option D describes a tool that does too many things and overlaps with other tools (validation, storage), creating confusion about tool selection."
  },
  {
    id: 44,
    domain: 2,
    scenario: 4,
    taskStatement: "2.1: Effective tool interfaces",
    question: "A developer creates a tool called 'analyze_code' with the description: 'Analyzes code for bugs, performance issues, security vulnerabilities, style violations, and generates documentation.' Why is this tool design problematic?",
    options: [
      { label: "A", text: "The tool name is too generic." },
      { label: "B", text: "A tool that does too many things makes it hard for the model to know when to use it, and the broad scope means its description will overlap with more focused tools. Single-responsibility tools with clear boundaries are easier for the model to select correctly." },
      { label: "C", text: "The tool should also include test generation to be complete." },
      { label: "D", text: "The description is too long." }
    ],
    correctAnswer: "B",
    explanation: "Tools should follow single-responsibility principles. A tool that analyzes bugs, performance, security, style, and generates docs has so many responsibilities that its description will inevitably overlap with any focused tool for those individual tasks. The model will struggle to decide when to use this broad tool vs. specialized tools. Better to have separate tools: check_bugs, check_performance, check_security, check_style, generate_docs, each with clear boundaries. Option A is a minor concern compared to the scope issue. Option C would make the problem worse. Option D misidentifies the issue - length is fine if the content is focused."
  },

  // --- 2.2: Structured error responses for MCP tools ---
  {
    id: 45,
    domain: 2,
    scenario: 1,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "The customer support agent calls lookup_order with an order ID, but the order database is temporarily unavailable. The tool returns: 'Error: Could not find order.' The agent tells the customer the order does not exist. What is wrong with this error response design?",
    options: [
      { label: "A", text: "The error message is too short." },
      { label: "B", text: "The error response fails to distinguish between a transient failure (database unavailable) and a valid empty result (order not found). A structured error with isError: true, errorCategory: 'transient', and isRetryable: true would let the agent retry rather than reporting a false negative to the customer." },
      { label: "C", text: "Error messages should always be in JSON format." },
      { label: "D", text: "The tool should never return errors; it should return a default order instead." }
    ],
    correctAnswer: "B",
    explanation: "This illustrates a critical distinction in MCP error design: access failures vs. valid empty results. A database timeout is a transient error that should be retried, while 'order not found' is a valid result. The error response 'Could not find order' is ambiguous - the model cannot tell which case occurred. Structured error responses with isError, errorCategory ('transient' vs 'validation' vs 'permission'), and isRetryable fields give the model the information it needs to respond appropriately. Option A misses the structural issue. Option C focuses on format, not semantics. Option D would return incorrect data."
  },
  {
    id: 46,
    domain: 2,
    scenario: 6,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "Your extraction tool encounters an invoice PDF that is password-protected and cannot be read. Which structured error response best helps the agent handle this situation?",
    options: [
      { label: "A", text: "{ \"result\": null }" },
      { label: "B", text: "\"Error reading document\"" },
      { label: "C", text: "{ \"isError\": true, \"errorCategory\": \"permission\", \"message\": \"Document is password-protected and cannot be read. Requires password or unprotected version.\", \"isRetryable\": false }" },
      { label: "D", text: "{ \"isError\": true, \"errorCategory\": \"transient\", \"message\": \"Document read failed\", \"isRetryable\": true }" }
    ],
    correctAnswer: "C",
    explanation: "Option C provides the correct structured error response. isError: true signals this is an error, not a valid empty result. errorCategory: 'permission' accurately categorizes the issue (access/permission problem). The message explains the specific issue and what would be needed to resolve it. isRetryable: false correctly indicates that retrying will not help - the document needs a password. Option A returns null, which the agent might interpret as 'no data found' rather than an access error. Option B is an unstructured string. Option D incorrectly marks it as transient and retryable - retrying a password-protected PDF will fail every time."
  },
  {
    id: 47,
    domain: 2,
    scenario: 3,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "The web search tool in your research system hits a rate limit from the search API. The tool returns: { isError: true, errorCategory: 'transient', message: 'Rate limited by search API. Retry after 30 seconds.', isRetryable: true }. What should a well-designed agent do with this response?",
    options: [
      { label: "A", text: "Report to the user that web search is permanently unavailable." },
      { label: "B", text: "Recognize the transient, retryable error and wait before retrying the search, or proceed with other available information and retry the search later." },
      { label: "C", text: "Switch to a different search engine immediately." },
      { label: "D", text: "Ignore the error and use the partial results." }
    ],
    correctAnswer: "B",
    explanation: "The structured error response gives the agent clear signals: isRetryable: true means the operation will likely succeed later, errorCategory: 'transient' means this is temporary, and the message suggests waiting 30 seconds. A well-designed agent should either wait and retry or continue with other tasks (like document analysis) and come back to the web search. Option A misinterprets a transient error as permanent. Option C is an overreaction to a temporary issue. Option D ignores the error entirely - there are no partial results from a rate-limited request."
  },
  {
    id: 48,
    domain: 2,
    scenario: 5,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "Your CI agent's Bash tool runs a test suite that finds zero test failures. The tool returns: { \"exitCode\": 0, \"stdout\": \"0 tests failed, 150 passed\", \"stderr\": \"\" }. The agent interprets this as an error because '0 tests failed' contains the word 'failed'. What error response improvement would prevent this misinterpretation?",
    options: [
      { label: "A", text: "Remove the word 'failed' from the test output formatting." },
      { label: "B", text: "Include an explicit isError: false in the tool result when the command succeeds, so the agent has a structured signal rather than relying on text parsing of stdout." },
      { label: "C", text: "Set the model temperature to 0 to prevent misinterpretation." },
      { label: "D", text: "Add a prompt instruction: 'exitCode 0 means success.'" }
    ],
    correctAnswer: "B",
    explanation: "A structured isError field gives the agent a definitive signal about whether the tool call succeeded, independent of the text content. When isError: false is present alongside exitCode: 0, the agent has two structured signals confirming success, regardless of what words appear in stdout. Option A modifies the test framework output, which may not be feasible. Option C does not prevent text misinterpretation. Option D helps but is probabilistic compared to a structured field."
  },

  // --- 2.3: Distribute tools across agents and configure tool_choice ---
  {
    id: 49,
    domain: 2,
    scenario: 1,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your customer support system has grown to include 18 tools: get_customer, lookup_order, process_refund, escalate_to_human, check_inventory, update_shipping, apply_coupon, cancel_order, send_email, create_ticket, close_ticket, add_note, transfer_agent, check_warranty, initiate_return, track_package, update_address, and verify_identity. The agent is increasingly making incorrect tool selections. What is the most likely cause?",
    options: [
      { label: "A", text: "The model needs a higher max_tokens setting to consider all tools." },
      { label: "B", text: "Having 18 tools available to a single agent degrades tool selection reliability. The tool set should be scoped per agent role, giving each specialized subagent only the tools relevant to its function." },
      { label: "C", text: "The tools need to be listed in alphabetical order." },
      { label: "D", text: "The model is too old; a newer version will handle 18 tools fine." }
    ],
    correctAnswer: "B",
    explanation: "Research and practice show that too many tools (around 18+) degrades the LLM's ability to reliably select the correct tool. The solution is to scope tool access per agent role: a refund specialist gets process_refund, lookup_order, and get_customer; a shipping specialist gets track_package, update_shipping, and update_address; etc. The coordinator routes to the right specialist, which has a manageable tool set. Option A is unrelated to tool selection quality. Option C has no effect on selection. Option D deflects from the architectural issue."
  },
  {
    id: 50,
    domain: 2,
    scenario: 3,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "In your multi-agent research system, you want the web search subagent to always use the search tool on its first turn rather than starting with reasoning text. Which tool_choice configuration achieves this?",
    options: [
      { label: "A", text: "tool_choice: \"auto\" - lets the model decide freely." },
      { label: "B", text: "tool_choice: \"any\" - forces the model to use some tool but does not specify which one." },
      { label: "C", text: "tool_choice: { type: \"tool\", name: \"web_search\" } - forces the model to call the web_search tool specifically." },
      { label: "D", text: "tool_choice: \"none\" - prevents tool use entirely." }
    ],
    correctAnswer: "C",
    explanation: "Forced tool selection with tool_choice: { type: \"tool\", name: \"web_search\" } guarantees the model calls web_search on its first turn, skipping any preliminary reasoning text. This is useful when you know the first action should always be a specific tool call. Option A (\"auto\") lets the model choose freely, which may result in reasoning text before the search. Option B (\"any\") forces a tool call but the model might pick the wrong tool if multiple are available. Option D disables tools entirely."
  },
  {
    id: 51,
    domain: 2,
    scenario: 5,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your CI pipeline has a security review subagent and a style review subagent. The security subagent has tools: run_sast_scan, check_dependencies, verify_secrets_not_exposed. The style subagent has tools: run_linter, check_formatting, verify_naming_conventions. A developer proposes giving both subagents all 6 tools 'for flexibility.' Why is this a bad idea?",
    options: [
      { label: "A", text: "The tools will conflict if both agents try to run them simultaneously." },
      { label: "B", text: "Scoped tool access ensures each subagent stays focused on its role. Giving the security agent style tools means it might waste time running the linter instead of focusing on security analysis, and vice versa." },
      { label: "C", text: "The API does not allow the same tool to be assigned to multiple agents." },
      { label: "D", text: "Six tools is too many for any single agent." }
    ],
    correctAnswer: "B",
    explanation: "Scoped tool access is a key principle of multi-agent tool distribution. Each subagent should only have tools relevant to its role, which keeps it focused and prevents role confusion. The security subagent with access to run_linter might decide to check style issues instead of focusing on its security mandate. Scoped access also improves tool selection reliability by reducing the number of options. Option A describes a different concern (concurrency). Option C is technically wrong. Option D - 6 tools is manageable but still more than each agent needs."
  },
  {
    id: 52,
    domain: 2,
    scenario: 4,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "A developer is using Claude for codebase exploration. The agent has tool_choice: \"auto\" and access to Read, Grep, Glob, Bash, Edit, and Write. The developer notices the agent sometimes generates long reasoning text before its first tool call, slowing exploration. What tool_choice setting would improve the initial response for a codebase exploration task?",
    options: [
      { label: "A", text: "tool_choice: \"none\" to force pure reasoning first." },
      { label: "B", text: "tool_choice: \"any\" to force the agent to start with a tool call rather than generating reasoning text." },
      { label: "C", text: "tool_choice: { type: \"tool\", name: \"Bash\" } to always start with a shell command." },
      { label: "D", text: "Remove all tools except Read to simplify the choice." }
    ],
    correctAnswer: "B",
    explanation: "tool_choice: \"any\" forces the model to call some tool rather than generating text, which eliminates the initial reasoning preamble. For codebase exploration, the first action should almost always be a tool call (Grep, Glob, or Read), so forcing a tool call upfront improves responsiveness. Option A prevents tool use entirely, which is counterproductive for exploration. Option C forces a specific tool that may not be the best first step. Option D removes essential exploration tools."
  },

  // --- 2.4: Integrate MCP servers ---
  {
    id: 53,
    domain: 2,
    scenario: 2,
    taskStatement: "2.4: Integrate MCP servers",
    question: "A development team wants to connect their Claude Code setup to a custom MCP server that provides access to their internal documentation and API specs. Where should the MCP server configuration be placed so it is shared across the team?",
    options: [
      { label: "A", text: "In each developer's ~/.claude.json file." },
      { label: "B", text: "In the project-level .mcp.json file, which is committed to the repository and shared across all team members." },
      { label: "C", text: "In the system prompt as a text description of the MCP server." },
      { label: "D", text: "In an environment variable that each developer sets manually." }
    ],
    correctAnswer: "B",
    explanation: "Project-level .mcp.json is the correct location for team-shared MCP server configurations. It is committed to the repository, ensuring all team members have the same MCP server access without individual setup. Option A (user-level ~/.claude.json) is for personal MCP servers that should not be shared, like individual developer tools. Option C is not how MCP servers are configured. Option D requires manual setup per developer, which is error-prone and not version-controlled."
  },
  {
    id: 54,
    domain: 2,
    scenario: 2,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your .mcp.json needs to include credentials for an internal MCP server. The API key should not be committed to the repository. How should the credential be handled in .mcp.json?",
    options: [
      { label: "A", text: "Hardcode the API key directly in .mcp.json since it is only used by developers." },
      { label: "B", text: "Use environment variable expansion in .mcp.json (e.g., { \"apiKey\": \"${INTERNAL_API_KEY}\" }) so the actual credential is stored in each developer's environment, not in the repository." },
      { label: "C", text: "Store the API key in a separate .env file and reference it by filename." },
      { label: "D", text: "Encrypt the API key and store the encrypted version in .mcp.json." }
    ],
    correctAnswer: "B",
    explanation: "Environment variable expansion in .mcp.json is the designed mechanism for handling credentials. The .mcp.json file uses ${VARIABLE_NAME} syntax, and the actual credential is stored in the developer's environment (e.g., via .bashrc, .env file, or secrets manager). This keeps the credential out of version control while allowing the MCP server configuration to be shared. Option A commits secrets to the repo, which is a security anti-pattern. Option C describes a mechanism that is not how .mcp.json works. Option D adds complexity without using the built-in mechanism."
  },
  {
    id: 55,
    domain: 2,
    scenario: 4,
    taskStatement: "2.4: Integrate MCP servers",
    question: "A developer has a personal MCP server that connects to their private note-taking system. They do not want this configuration shared with the team. Where should this MCP server be configured?",
    options: [
      { label: "A", text: "In the project-level .mcp.json so the team can also access their notes." },
      { label: "B", text: "In the user-level ~/.claude.json, which is personal to the developer and not committed to any repository." },
      { label: "C", text: "In a separate .mcp-personal.json file in the project directory." },
      { label: "D", text: "In the CLAUDE.md file as a tool description." }
    ],
    correctAnswer: "B",
    explanation: "User-level ~/.claude.json is designed for personal MCP server configurations that should not be shared with the team. It is stored in the developer's home directory, not in any project repository. Option A would expose personal notes to the entire team. Option C uses a non-standard configuration file that Claude Code does not recognize. Option D confuses project instructions with MCP server configuration."
  },
  {
    id: 56,
    domain: 2,
    scenario: 6,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your structured data extraction system uses an MCP server that exposes a catalog of JSON schemas for different document types (invoices, receipts, purchase orders). In MCP terminology, these schema catalogs are best represented as:",
    options: [
      { label: "A", text: "MCP tools, each returning a specific schema when called." },
      { label: "B", text: "MCP resources, which serve as content catalogs that the agent can browse and reference without executing actions." },
      { label: "C", text: "MCP prompts, which are reusable prompt templates." },
      { label: "D", text: "MCP hooks, which intercept tool calls." }
    ],
    correctAnswer: "B",
    explanation: "MCP resources are the appropriate abstraction for content catalogs like schema collections. Resources represent data that can be browsed and referenced - they are informational, not action-oriented. The JSON schema catalog is a reference the agent consults when deciding how to structure its extraction output. Option A (tools) are for performing actions, not serving reference content. Option C (prompts) are reusable prompt templates, not content catalogs. Option D is not an MCP concept in this context."
  },

  // --- 2.5: Built-in tools ---
  {
    id: 57,
    domain: 2,
    scenario: 4,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A developer asks Claude to find all files in the project that contain the function name 'calculateTax'. Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Glob - it searches for file name patterns." },
      { label: "B", text: "Read - read every file in the project and search manually." },
      { label: "C", text: "Grep - it searches for content patterns within files." },
      { label: "D", text: "Bash - run 'find . -name calculateTax' to locate the files." }
    ],
    correctAnswer: "C",
    explanation: "Grep is the built-in tool designed for searching content within files. It finds all files containing a specific text pattern or regex, which is exactly what is needed to find occurrences of 'calculateTax'. Option A (Glob) searches for file name patterns (e.g., '*.ts'), not file content. Option B (Read) would require reading every file, which is extremely inefficient. Option D (Bash) could work but find searches file names, not content - you would need 'grep -r', and the built-in Grep tool is the idiomatic choice."
  },
  {
    id: 58,
    domain: 2,
    scenario: 2,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "Claude Code needs to rename a variable from 'userEmail' to 'customerEmail' in a specific file. The variable appears 12 times in the file. Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Read the file, then Write the entire file with all 12 occurrences changed." },
      { label: "B", text: "Use Edit with replace_all to find 'userEmail' and replace with 'customerEmail' across all occurrences in the file." },
      { label: "C", text: "Use Bash to run sed to do a find-and-replace." },
      { label: "D", text: "Use Grep to find all occurrences, then Edit each one individually." }
    ],
    correctAnswer: "B",
    explanation: "The Edit tool with replace_all is designed for exactly this use case - replacing all occurrences of a specific string within a file. It sends only the diff, making it efficient. Option A works but is wasteful - Read + Write sends the entire file content twice when only the variable name changes. Option C uses Bash as a workaround when a built-in tool exists for the task. Option D makes 12 individual Edit calls when a single replace_all handles all occurrences."
  },
  {
    id: 59,
    domain: 2,
    scenario: 5,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A CI agent needs to find all TypeScript test files in the project (files matching the pattern '*.test.ts' or '*.spec.ts'). Which built-in tool is most appropriate?",
    options: [
      { label: "A", text: "Grep with the pattern '*.test.ts'" },
      { label: "B", text: "Glob with patterns like '**/*.test.ts' and '**/*.spec.ts'" },
      { label: "C", text: "Read the src directory and look for test files." },
      { label: "D", text: "Bash with 'ls -R | grep test'" }
    ],
    correctAnswer: "B",
    explanation: "Glob is the built-in tool designed for finding files by name pattern. It supports patterns like '**/*.test.ts' to recursively find all TypeScript test files. Option A is wrong because Grep searches file content, not file names. Option C is wrong because Read operates on individual files, not directories, and would be extremely inefficient. Option D could work but uses Bash as a workaround when the dedicated Glob tool exists for this exact purpose."
  },
  {
    id: 60,
    domain: 2,
    scenario: 4,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "Claude Code attempts to use Edit to change a function signature, but the old_string parameter matches multiple locations in the file, causing the Edit to fail. What is the recommended recovery approach?",
    options: [
      { label: "A", text: "Use Bash with sed to make the change instead." },
      { label: "B", text: "Provide more surrounding context in old_string to make it unique, or if that is not possible, use Read to get the full file content and Write to replace the entire file." },
      { label: "C", text: "Delete the file and recreate it with the changes." },
      { label: "D", text: "Use Grep to find the exact line number, then use Edit with just that line." }
    ],
    correctAnswer: "B",
    explanation: "When Edit fails due to non-unique matching, the first approach is to include more surrounding context in old_string to make it uniquely identify the target location. If the text truly cannot be made unique (e.g., identical function signatures in different code blocks), the fallback is Read + Write to replace the entire file. Option A uses an external tool when built-in tools can handle it. Option C is destructive and unnecessary. Option D misunderstands Edit - it matches text content, not line numbers, and a single line may still not be unique."
  },
  {
    id: 61,
    domain: 2,
    scenario: 6,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A structured data extraction pipeline needs to process 200 invoice PDFs stored in a directory. The agent should first find all PDFs, then read each one. What is the correct sequence of built-in tools?",
    options: [
      { label: "A", text: "Use Grep to search for PDF content, then Read each result." },
      { label: "B", text: "Use Glob with '**/*.pdf' to find all PDF files, then use Read on each file path returned by Glob." },
      { label: "C", text: "Use Read on the directory to list all files, then filter for PDFs." },
      { label: "D", text: "Use Bash with 'cat *.pdf' to read all PDFs at once." }
    ],
    correctAnswer: "B",
    explanation: "The correct sequence is Glob for file discovery followed by Read for file content. Glob with '**/*.pdf' efficiently finds all PDF file paths in the directory tree. Then Read processes each PDF file individually. Option A is wrong because Grep searches file content by text pattern, not file names, and PDFs are binary files. Option C is wrong because Read operates on files, not directories. Option D would concatenate binary PDF data, producing unusable output."
  },

  // --- Additional 2.1 questions ---
  {
    id: 62,
    domain: 2,
    scenario: 3,
    taskStatement: "2.1: Effective tool interfaces",
    question: "Your research system has a web_search tool and a scholarly_search tool. The web_search description says 'Search the web for information' and scholarly_search says 'Search for academic papers and research.' During testing, the agent uses web_search for academic queries. How should you fix the descriptions?",
    options: [
      { label: "A", text: "Rename scholarly_search to google_scholar_search." },
      { label: "B", text: "Add explicit boundaries to each description: web_search should say 'For general web results. For academic papers, use scholarly_search.' and scholarly_search should say 'For peer-reviewed academic papers and citations. For general web information, use web_search.'" },
      { label: "C", text: "Remove web_search entirely so the agent can only use scholarly_search." },
      { label: "D", text: "Add 'DO NOT use for academic queries' in capitals to web_search's description." }
    ],
    correctAnswer: "B",
    explanation: "The best fix is to add explicit boundary statements to both tool descriptions, creating clear delineation. Each description should state what it IS for and explicitly reference the other tool for the alternative use case. This eliminates the overlap that caused the incorrect tool selection. Option A changes the name but does not fix the description overlap. Option C removes useful functionality. Option D uses aggressive formatting but still does not tell the model what tool to use instead."
  },

  // --- Additional 2.2 questions ---
  {
    id: 63,
    domain: 2,
    scenario: 4,
    taskStatement: "2.2: Structured error responses for MCP tools",
    question: "A developer's custom MCP tool for running database queries returns a validation error when the agent sends malformed SQL. The error response is: { isError: true, errorCategory: 'validation', message: 'Invalid SQL: missing WHERE clause in UPDATE statement. All UPDATE statements must include a WHERE clause for safety.', isRetryable: true }. Why is isRetryable: true appropriate for a validation error?",
    options: [
      { label: "A", text: "Validation errors should never be retryable." },
      { label: "B", text: "The agent can fix the SQL by adding a WHERE clause and retry with a corrected query. The validation error provides enough information for the agent to understand and correct the mistake." },
      { label: "C", text: "isRetryable should be false because the same query will fail again." },
      { label: "D", text: "isRetryable only applies to transient errors." }
    ],
    correctAnswer: "B",
    explanation: "Validation errors can be retryable when the error message provides enough information for the agent to correct the input. Here, the message clearly states 'missing WHERE clause in UPDATE statement' and the safety requirement, giving the agent what it needs to generate a corrected query. Option A and D are too rigid - retryability depends on whether the issue is fixable, not the error category. Option C is technically correct that the SAME query would fail, but isRetryable means the agent can fix and retry with a corrected version."
  },

  // --- Additional 2.3 questions ---
  {
    id: 64,
    domain: 2,
    scenario: 6,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "Your data extraction system has three specialized agents: a PDF reader agent (tools: read_pdf, ocr_scan), a field extractor agent (tools: extract_fields, validate_schema), and a data enrichment agent (tools: geocode_address, normalize_currency). The coordinator assigns a batch of invoices. Using tool_choice: \"auto\" for all agents, the field extractor occasionally calls validate_schema before extract_fields. How should you fix this?",
    options: [
      { label: "A", text: "Use tool_choice: { type: \"tool\", name: \"extract_fields\" } for the field extractor's first turn to force extraction before validation." },
      { label: "B", text: "Remove validate_schema from the field extractor's tools." },
      { label: "C", text: "Add a prompt instruction: 'Always extract before validating.'" },
      { label: "D", text: "Give all tools to all agents so any agent can do any step." }
    ],
    correctAnswer: "A",
    explanation: "Using forced tool selection on the first turn ensures the field extractor always starts with extraction, then switches to tool_choice: \"auto\" for subsequent turns where it can validate. This combines deterministic first-step behavior with flexible subsequent behavior. Option B removes a necessary tool. Option C is probabilistic and may fail. Option D collapses the multi-agent architecture and creates the 18-tool degradation problem."
  },

  // --- Additional 2.4 questions ---
  {
    id: 65,
    domain: 2,
    scenario: 5,
    taskStatement: "2.4: Integrate MCP servers",
    question: "Your CI system needs MCP access to a Jira server for creating issues from code review findings. The Jira credentials differ between staging and production environments. How should the .mcp.json handle this?",
    options: [
      { label: "A", text: "Create two separate .mcp.json files: .mcp.staging.json and .mcp.production.json." },
      { label: "B", text: "Use environment variable expansion in .mcp.json (e.g., ${JIRA_API_TOKEN}) and set different values for the environment variable in staging vs. production CI configurations." },
      { label: "C", text: "Hardcode the staging credentials and manually change them for production deployments." },
      { label: "D", text: "Store both sets of credentials in .mcp.json with if/else logic." }
    ],
    correctAnswer: "B",
    explanation: "Environment variable expansion is the designed solution for environment-specific credentials. A single .mcp.json uses ${JIRA_API_TOKEN}, and the CI system sets different values for that variable in staging vs. production. This keeps credentials out of the repository and supports multiple environments with one configuration file. Option A requires maintaining duplicate configuration files. Option C hardcodes secrets in version control. Option D is not supported syntax in .mcp.json."
  },

  // --- Additional 2.5 questions ---
  {
    id: 66,
    domain: 2,
    scenario: 2,
    taskStatement: "2.5: Built-in tools (Read, Write, Edit, Grep, Glob, Bash)",
    question: "A developer asks Claude Code to add a new import statement to the top of a file. The file has a unique first line (a specific comment header). The agent uses Edit with the first line as old_string and prepends the import. This works. But another file has a generic first line ('import React from \"react\"') that appears in 50 files. What should the agent do for that file?",
    options: [
      { label: "A", text: "Use Edit with just 'import React from \"react\"' as old_string." },
      { label: "B", text: "Include more surrounding context in old_string (e.g., the first 3-4 lines of the file) to make the match unique, or fall back to Read + Write if uniqueness cannot be achieved." },
      { label: "C", text: "Use Bash to prepend the import with sed." },
      { label: "D", text: "Use Grep to find the file first, then Edit." }
    ],
    correctAnswer: "B",
    explanation: "Edit requires unique text matching. When the simple match is not unique, include more surrounding lines as context. For example, including the first 3 lines ('import React from \"react\"' followed by the next two unique imports) will likely create a unique match. If the text still is not unique (extremely rare), Read + Write is the established fallback. Option A will fail because the match is not unique. Option C uses an external tool unnecessarily. Option D finds files by content but does not solve the uniqueness problem for Edit."
  },
  {
    id: 67,
    domain: 2,
    scenario: 1,
    taskStatement: "2.3: Distribute tools across agents and configure tool_choice",
    question: "The customer support coordinator needs to route incoming tickets to the right subagent. It only needs to analyze the ticket content and call the Task tool to delegate - it should not process refunds or look up orders itself. What is the correct tool configuration for the coordinator?",
    options: [
      { label: "A", text: "Give the coordinator all 18 tools plus the Task tool so it can handle any situation." },
      { label: "B", text: "Give the coordinator only the Task tool, since its sole job is to analyze tickets and delegate to specialized subagents." },
      { label: "C", text: "Give the coordinator the Task tool plus get_customer and lookup_order for initial triage." },
      { label: "D", text: "Give the coordinator no tools; it should delegate via text in its response." }
    ],
    correctAnswer: "B",
    explanation: "The coordinator's role is purely orchestration: analyze the ticket and delegate to the appropriate specialist. It only needs the Task tool for delegation. Giving it domain-specific tools (like process_refund or lookup_order) risks the coordinator trying to handle tasks itself instead of delegating to the specialized subagent that is better equipped. Option A gives far too many tools and defeats the multi-agent architecture. Option C gives triage tools that are better handled by subagents. Option D removes the structured delegation mechanism."
  },

  // ============================================================
  // DOMAIN 3: Claude Code Configuration & Workflows (30 questions)
  // DOMAIN 4: Prompt Engineering & Structured Output (27 questions)
  // DOMAIN 5: Context Management & Reliability (26 questions)
  // ============================================================

  {
    id: 68,
    domain: 3,
    scenario: 2,
    taskStatement: "3.1",
    question: "Your engineering team uses Claude Code across multiple projects. A senior developer wants to enforce their personal code style preferences (e.g., tab width, import ordering) in every project they work on, without affecting teammates. Where should they place their CLAUDE.md configuration?",
    options: [
      { label: "A", text: "In the project root CLAUDE.md file" },
      { label: "B", text: "In ~/.claude/CLAUDE.md" },
      { label: "C", text: "In .claude/rules/ with a glob pattern matching all files" },
      { label: "D", text: "In a shared .claude/commands/ directory committed to git" }
    ],
    correctAnswer: "B",
    explanation: "~/.claude/CLAUDE.md is the user-level configuration that applies to all projects for that specific user. It is not committed to version control, so it won't affect teammates. Project-level CLAUDE.md (option A) would affect all team members. .claude/rules/ (option C) is for path-specific rules within a project. .claude/commands/ (option D) is for custom slash commands, not configuration preferences."
  },
  {
    id: 69,
    domain: 3,
    scenario: 3,
    taskStatement: "3.1",
    question: "A team building a multi-agent research system has a monorepo with separate directories for each subagent (web-search/, doc-analysis/, synthesis/). Each subagent directory needs its own Claude Code instructions for tool usage and output format. The team also needs shared conventions across all agents. What is the most effective CLAUDE.md configuration strategy?",
    options: [
      { label: "A", text: "Put all instructions in a single root CLAUDE.md file" },
      { label: "B", text: "Use a root CLAUDE.md for shared conventions and directory-level CLAUDE.md files in each subagent folder for agent-specific instructions" },
      { label: "C", text: "Create separate ~/.claude/CLAUDE.md files for each team member" },
      { label: "D", text: "Use .claude/commands/ to define agent-specific behavior" }
    ],
    correctAnswer: "B",
    explanation: "The CLAUDE.md hierarchy supports this pattern: a project-level root CLAUDE.md defines shared conventions inherited by all subdirectories, while directory-level CLAUDE.md files in each subagent folder provide context-specific instructions. A single root file (option A) would become unwieldy and lack specificity. User-level files (option C) are per-developer, not per-agent. Commands (option D) are for executable actions, not persistent configuration."
  },
  {
    id: 70,
    domain: 3,
    scenario: 2,
    taskStatement: "3.1",
    question: "A developer's CLAUDE.md file is growing large with sections for testing standards, API conventions, database patterns, and deployment rules. They want to modularize it for maintainability. What is the recommended approach?",
    options: [
      { label: "A", text: "Split into multiple CLAUDE.md files in nested subdirectories" },
      { label: "B", text: "Use @import syntax to reference separate modular files from the main CLAUDE.md" },
      { label: "C", text: "Create a .claude/config.json with sections for each concern" },
      { label: "D", text: "Use environment variables to conditionally load different instruction sets" }
    ],
    correctAnswer: "B",
    explanation: "The @import syntax allows CLAUDE.md to reference separate modular files (e.g., @testing-standards.md, @api-conventions.md), keeping instructions organized and maintainable. Nested subdirectory CLAUDE.md files (option A) only apply within those directories, not globally. There is no .claude/config.json format (option C). Environment-variable-based loading (option D) is not a supported feature of CLAUDE.md."
  },
  {
    id: 71,
    domain: 3,
    scenario: 5,
    taskStatement: "3.1",
    question: "A team maintains topic-specific rule files for Claude Code: one for testing conventions, one for security review standards, and one for documentation requirements. Where should these files be stored so they are automatically loaded as project instructions?",
    options: [
      { label: "A", text: "In the project root as separate .md files" },
      { label: "B", text: "In .claude/rules/ as individual rule files" },
      { label: "C", text: "In .claude/commands/ with appropriate frontmatter" },
      { label: "D", text: "In ~/.claude/rules/ for global availability" }
    ],
    correctAnswer: "B",
    explanation: ".claude/rules/ is specifically designed for topic-specific rule files that are automatically loaded as project instructions. Files in the project root (option A) are not automatically loaded by Claude Code. .claude/commands/ (option C) is for custom slash commands, not rule files. ~/.claude/rules/ (option D) is not the standard location for project-specific rules."
  },
  {
    id: 72,
    domain: 3,
    scenario: 2,
    taskStatement: "3.2",
    question: "A team wants to create a custom slash command that generates a new API endpoint with boilerplate code, tests, and documentation. The command should be available to all team members working on the project. Where should the command definition be placed?",
    options: [
      { label: "A", text: "~/.claude/commands/ on each developer's machine" },
      { label: "B", text: ".claude/commands/ in the project repository" },
      { label: "C", text: ".claude/skills/ with a SKILL.md file" },
      { label: "D", text: "In the root CLAUDE.md with command instructions" }
    ],
    correctAnswer: "B",
    explanation: ".claude/commands/ in the project repository is the correct location for project-level custom slash commands that are shared via git with all team members. ~/.claude/commands/ (option A) would work but requires each developer to set it up individually and wouldn't stay in sync. Skills (option C) are a different mechanism. CLAUDE.md (option D) provides instructions but doesn't define invokable slash commands."
  },
  {
    id: 73,
    domain: 3,
    scenario: 4,
    taskStatement: "3.2",
    question: "A developer frequently uses a personal workflow for exploring legacy codebases that involves specific search patterns and summarization steps. They don't want this command available to their team. Where should they define this custom command?",
    options: [
      { label: "A", text: ".claude/commands/ in the project repository" },
      { label: "B", text: "~/.claude/commands/ in their home directory" },
      { label: "C", text: ".claude/rules/ with a path-specific glob pattern" },
      { label: "D", text: "As a shell alias that invokes Claude Code" }
    ],
    correctAnswer: "B",
    explanation: "~/.claude/commands/ is the personal commands directory that is not committed to version control and only available to that specific developer. Project-level .claude/commands/ (option A) would be shared with the team via git. .claude/rules/ (option C) is for path-specific rules, not commands. A shell alias (option D) wouldn't integrate with Claude Code's slash command system."
  },
  {
    id: 74,
    domain: 3,
    scenario: 3,
    taskStatement: "3.2",
    question: "A team is defining a skill for their multi-agent research system that needs to run in an isolated fork context and requires access to specific tools. Which frontmatter fields should be included in the SKILL.md file?",
    options: [
      { label: "A", text: "context: main, tools: [web_search, doc_analysis]" },
      { label: "B", text: "context: fork, allowed-tools: [web_search, doc_analysis]" },
      { label: "C", text: "mode: isolated, permissions: [web_search, doc_analysis]" },
      { label: "D", text: "context: fork, argument-hint: 'research query', scope: restricted" }
    ],
    correctAnswer: "B",
    explanation: "Skills support frontmatter with 'context: fork' for isolated execution and 'allowed-tools' to specify which tools the skill can use. Option A uses incorrect field names ('main' is not a valid context value, and 'tools' is not the correct field name). Option C uses entirely fabricated field names. Option D includes 'scope: restricted' which is not a valid frontmatter field."
  },
  {
    id: 75,
    domain: 3,
    scenario: 5,
    taskStatement: "3.2",
    question: "An enterprise has defined skills at multiple levels: an enterprise-managed skill, a developer's personal skill, a project-level skill, and a plugin-provided skill, all with the same name. Which skill takes priority when invoked?",
    options: [
      { label: "A", text: "Project-level skill, since it's closest to the code" },
      { label: "B", text: "Personal skill, since user preferences override everything" },
      { label: "C", text: "Enterprise skill, since enterprise policies take highest priority" },
      { label: "D", text: "Plugin skill, since plugins are external integrations" }
    ],
    correctAnswer: "C",
    explanation: "The skills priority order is Enterprise > Personal > Project > Plugins. Enterprise-managed skills take highest priority to ensure organizational policies and compliance requirements are enforced. Personal skills (option B) override project and plugin but not enterprise. Project-level (option A) only overrides plugins. Plugins (option D) have the lowest priority."
  },
  {
    id: 76,
    domain: 3,
    scenario: 2,
    taskStatement: "3.3",
    question: "A team wants to enforce that all test files across the entire monorepo (regardless of directory) follow specific patterns: use React Testing Library, avoid enzyme, and include accessibility checks. Test files are scattered across src/components/, src/pages/, src/utils/, and packages/*/. What is the best approach?",
    options: [
      { label: "A", text: "Add a CLAUDE.md file in every directory that contains test files" },
      { label: "B", text: "Create a rule file in .claude/rules/ with a paths field using the glob pattern **/*.test.tsx" },
      { label: "C", text: "Add the testing rules to the root CLAUDE.md file" },
      { label: "D", text: "Create a .claude/commands/test-rules command that developers must run manually" }
    ],
    correctAnswer: "B",
    explanation: "Path-specific rules in .claude/rules/ with YAML paths fields supporting glob patterns (e.g., **/*.test.tsx) are ideal for cross-directory conventions. They load automatically when editing matching files. Adding CLAUDE.md to every directory (option A) is unmaintainable and error-prone as the codebase grows. Root CLAUDE.md (option C) would load these rules for all files, not just tests. Manual commands (option D) require developer discipline and don't enforce automatically."
  },
  {
    id: 77,
    domain: 3,
    scenario: 6,
    taskStatement: "3.3",
    question: "A team processes multiple file types for data extraction: CSV files need specific parsing rules, JSON files need schema validation rules, and XML files need namespace handling rules. Each file type exists across many directories. What is the most maintainable Claude Code configuration?",
    options: [
      { label: "A", text: "Three separate rule files in .claude/rules/, each with a paths field matching the respective file extension (e.g., **/*.csv, **/*.json, **/*.xml)" },
      { label: "B", text: "A single .claude/rules/ file with all rules combined" },
      { label: "C", text: "Directory-level CLAUDE.md files in every directory containing these file types" },
      { label: "D", text: "A root CLAUDE.md with conditional sections for each file type" }
    ],
    correctAnswer: "A",
    explanation: "Separate rule files in .claude/rules/ each with their own paths field and glob pattern is the most maintainable approach. Rules load only when editing matching files, so CSV rules won't clutter context when editing JSON files. A single combined file (option B) would load all rules regardless of which file type is being edited. Directory-level CLAUDE.md files (option C) would require duplication across directories. Root CLAUDE.md with conditionals (option D) doesn't support conditional loading natively."
  },
  {
    id: 78,
    domain: 3,
    scenario: 5,
    taskStatement: "3.3",
    question: "A rule file in .claude/rules/ has the following paths field: paths: ['src/api/**/*.ts', 'src/graphql/**/*.ts']. When will this rule be loaded?",
    options: [
      { label: "A", text: "Whenever any TypeScript file in the project is edited" },
      { label: "B", text: "Only when editing TypeScript files under src/api/ or src/graphql/ directories" },
      { label: "C", text: "Only when running CI commands that touch API or GraphQL files" },
      { label: "D", text: "At project initialization regardless of which files are being edited" }
    ],
    correctAnswer: "B",
    explanation: "Path-specific rules load only when editing files that match the glob patterns in the paths field. This rule specifically targets TypeScript files under src/api/ and src/graphql/. It does not apply to all TypeScript files (option A), it's not CI-specific (option C), and it does not load at initialization regardless of context (option D)."
  },
  {
    id: 79,
    domain: 3,
    scenario: 4,
    taskStatement: "3.4",
    question: "A developer needs to refactor a legacy authentication system that spans 15 files across 4 directories, with multiple valid approaches (OAuth migration, session-based refactor, or hybrid). What execution mode should they use in Claude Code?",
    options: [
      { label: "A", text: "Direct execution to quickly implement the refactor" },
      { label: "B", text: "Plan mode to evaluate approaches and coordinate multi-file changes before executing" },
      { label: "C", text: "Create a custom slash command for each approach and run them sequentially" },
      { label: "D", text: "Use the explore subagent to automatically implement the best approach" }
    ],
    correctAnswer: "B",
    explanation: "Plan mode is designed for large-scale changes involving multiple files with multiple valid approaches. It allows Claude to evaluate tradeoffs and create a coordinated plan before making changes. Direct execution (option A) risks inconsistent changes across files without a plan. Custom commands (option C) don't help with approach selection. The explore subagent (option D) is for verbose discovery, not implementation."
  },
  {
    id: 80,
    domain: 3,
    scenario: 2,
    taskStatement: "3.4",
    question: "A developer asks Claude Code to rename a variable in a single function from 'userData' to 'customerProfile'. What is the appropriate execution mode?",
    options: [
      { label: "A", text: "Plan mode, since renaming could have downstream effects" },
      { label: "B", text: "Direct execution, since this is a simple, well-scoped change" },
      { label: "C", text: "Use the explore subagent first to find all references" },
      { label: "D", text: "Plan mode with manual approval for each file change" }
    ],
    correctAnswer: "B",
    explanation: "Direct execution is appropriate for simple, well-scoped changes like renaming a variable in a single function. Plan mode (options A and D) adds unnecessary overhead for trivial changes. The explore subagent (option C) is for verbose discovery of unfamiliar codebases, not simple rename operations."
  },
  {
    id: 81,
    domain: 3,
    scenario: 4,
    taskStatement: "3.4",
    question: "A developer is exploring an unfamiliar legacy codebase to understand how the payment processing pipeline works before making any changes. They want verbose output about file structures, function relationships, and data flow. What should they use?",
    options: [
      { label: "A", text: "Direct execution with broad search queries" },
      { label: "B", text: "Plan mode to create a modification plan" },
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
    taskStatement: "3.5",
    question: "A developer is iterating on a Claude Code prompt for extracting product data from unstructured supplier emails. The current prompt uses prose like 'extract relevant product information including prices and quantities.' Results are inconsistent. What is the most effective refinement approach?",
    options: [
      { label: "A", text: "Add more detailed prose describing what 'relevant' means" },
      { label: "B", text: "Provide concrete input/output examples showing exact extraction from sample emails" },
      { label: "C", text: "Increase the model's temperature for more creative extraction" },
      { label: "D", text: "Add a system prompt explaining the business context" }
    ],
    correctAnswer: "B",
    explanation: "Concrete input/output examples are more effective than prose descriptions for achieving consistent output. They demonstrate exactly what to extract and in what format, eliminating ambiguity. More detailed prose (option A) still leaves room for interpretation. Temperature adjustments (option C) affect randomness, not accuracy of extraction. Business context (option D) may help but doesn't solve the core consistency problem."
  },
  {
    id: 83,
    domain: 3,
    scenario: 2,
    taskStatement: "3.5",
    question: "A developer wants Claude Code to generate a complex data validation module but isn't sure about the exact requirements yet. They want Claude to help clarify requirements before implementation. What pattern should they use?",
    options: [
      { label: "A", text: "Provide a vague prompt and iterate on the output" },
      { label: "B", text: "Write detailed requirements upfront in CLAUDE.md" },
      { label: "C", text: "Use the interview pattern where Claude asks clarifying questions before implementing" },
      { label: "D", text: "Generate multiple versions and pick the best one" }
    ],
    correctAnswer: "C",
    explanation: "The interview pattern is an iterative refinement technique where Claude asks clarifying questions before implementing, helping to surface requirements the developer may not have considered. Vague prompts with iteration (option A) wastes cycles on wrong directions. Writing detailed requirements upfront (option B) assumes you know them already. Generating multiple versions (option D) is wasteful when requirements are unclear."
  },
  {
    id: 84,
    domain: 3,
    scenario: 5,
    taskStatement: "3.5",
    question: "A CI pipeline uses Claude Code to fix linting issues. When Claude fixes one issue, it sometimes introduces new ones. What iterative strategy is most effective?",
    options: [
      { label: "A", text: "Fix all issues in parallel in a single pass" },
      { label: "B", text: "Use sequential issue fixing, verifying each fix before proceeding to the next" },
      { label: "C", text: "Increase the context window to include more of the codebase" },
      { label: "D", text: "Add all linting rules to CLAUDE.md so Claude knows them upfront" }
    ],
    correctAnswer: "B",
    explanation: "Sequential issue fixing with verification between each fix prevents cascading problems. Each fix is validated before moving on, ensuring one fix doesn't introduce new issues. Parallel fixing (option A) is exactly what causes the cascading problem. Increasing context (option C) doesn't prevent the issue. Adding rules to CLAUDE.md (option D) helps with awareness but doesn't prevent fix interactions."
  },
  {
    id: 85,
    domain: 3,
    scenario: 6,
    taskStatement: "3.5",
    question: "A team is using Claude Code to build an invoice data extractor. They want to verify that their prompt handles edge cases correctly (missing fields, unusual formats, multi-currency invoices). What is the best iterative approach?",
    options: [
      { label: "A", text: "Deploy to production and monitor error rates" },
      { label: "B", text: "Write test cases for edge cases first, then iterate on the prompt until all tests pass" },
      { label: "C", text: "Add verbose error handling to the extraction code" },
      { label: "D", text: "Use plan mode to think through edge cases theoretically" }
    ],
    correctAnswer: "B",
    explanation: "Test-driven iteration means writing test cases for expected edge cases first, then refining the prompt until all tests pass. This provides objective verification of correctness. Deploying to production (option A) risks errors reaching users. Error handling (option C) catches failures but doesn't prevent them. Theoretical planning (option D) doesn't validate against real data."
  },
  {
    id: 86,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6",
    question: "A CI pipeline needs to run Claude Code for automated code review on every pull request. The review should run non-interactively and produce a pass/fail result. Which Claude Code flags are essential?",
    options: [
      { label: "A", text: "--batch and --silent for background processing" },
      { label: "B", text: "-p (--print) for non-interactive mode" },
      { label: "C", text: "--ci-mode with a webhook URL for results" },
      { label: "D", text: "--daemon to keep a persistent session running" }
    ],
    correctAnswer: "B",
    explanation: "The -p (--print) flag runs Claude Code in non-interactive mode, which is essential for CI/CD pipelines where there's no terminal for interactive input. Options A, C, and D reference flags that don't exist in Claude Code. The -p flag is the standard approach for integrating Claude Code into automated pipelines."
  },
  {
    id: 87,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6",
    question: "A team's CI pipeline needs Claude Code to output structured JSON matching a specific schema so downstream tools can parse the review results. Which flags should they combine?",
    options: [
      { label: "A", text: "-p with --output-format json and --json-schema to define the expected structure" },
      { label: "B", text: "-p with --format json and --validate" },
      { label: "C", text: "--structured-output with a JSON schema file path" },
      { label: "D", text: "--output json with --strict-mode" }
    ],
    correctAnswer: "A",
    explanation: "--output-format json produces JSON output and --json-schema specifies the expected structure, combined with -p for non-interactive mode. This is the standard combination for structured CI output. Options B, C, and D reference incorrect flag names that don't exist in Claude Code."
  },
  {
    id: 88,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6",
    question: "A CI pipeline runs Claude Code for both code review and test generation on the same PR. A developer notices that context from the code review is leaking into the test generation step, causing test names to reference review comments. What is the correct solution?",
    options: [
      { label: "A", text: "Add a --clear-context flag between runs" },
      { label: "B", text: "Use session context isolation by running separate Claude Code instances for review and test generation" },
      { label: "C", text: "Pipe the review output to /dev/null before running test generation" },
      { label: "D", text: "Use a shared context with explicit section boundaries" }
    ],
    correctAnswer: "B",
    explanation: "Session context isolation means running separate Claude Code instances for different tasks, ensuring no context leaks between them. This is a key CI/CD integration principle. --clear-context (option A) is not a real flag. Piping to /dev/null (option C) only hides output, doesn't clear context. Shared context with boundaries (option D) still allows leakage."
  },
  {
    id: 89,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6",
    question: "A CI pipeline uses Claude Code to generate tests for new code. The repository already has 500+ existing test files. Developers notice Claude sometimes generates tests that duplicate existing test cases. What should the pipeline do?",
    options: [
      { label: "A", text: "Add a deduplication step after test generation" },
      { label: "B", text: "Provide existing test files in the prompt context so Claude can avoid generating duplicates" },
      { label: "C", text: "Limit Claude to generating only unit tests, not integration tests" },
      { label: "D", text: "Use a smaller model to reduce the chance of copying existing patterns" }
    ],
    correctAnswer: "B",
    explanation: "Providing existing test files to Claude Code gives it awareness of what already exists, allowing it to generate complementary rather than duplicate tests. Post-generation deduplication (option A) wastes compute and may miss subtle duplicates. Limiting test types (option C) doesn't address duplication. Model size (option D) doesn't affect duplication likelihood."
  },
  {
    id: 90,
    domain: 3,
    scenario: 1,
    taskStatement: "3.1",
    question: "A support team deploys a customer service agent using Claude Code. They need different instructions for handling refund workflows versus escalation workflows, and both sets of rules should apply project-wide. How should they organize their CLAUDE.md configuration?",
    options: [
      { label: "A", text: "Create two separate CLAUDE.md files in the project root" },
      { label: "B", text: "Use a single CLAUDE.md with @import syntax to pull in refund-rules.md and escalation-rules.md" },
      { label: "C", text: "Put refund rules in a refunds/ directory CLAUDE.md and escalation rules in an escalations/ directory CLAUDE.md" },
      { label: "D", text: "Define both rule sets in ~/.claude/CLAUDE.md" }
    ],
    correctAnswer: "B",
    explanation: "The @import syntax lets you modularize a single CLAUDE.md by referencing separate files. This keeps both rule sets project-wide while maintaining separation of concerns. You can't have two CLAUDE.md files in the same directory (option A). Directory-level files (option C) only apply within those directories. User-level config (option D) shouldn't contain project-specific rules."
  },
  {
    id: 91,
    domain: 3,
    scenario: 2,
    taskStatement: "3.2",
    question: "A developer is creating a custom slash command that accepts a component name as an argument and generates a React component with tests. They want to provide a hint to users about what argument to pass. Which frontmatter field should they use?",
    options: [
      { label: "A", text: "description: 'Component name to generate'" },
      { label: "B", text: "argument-hint: 'component name'" },
      { label: "C", text: "args: { name: 'string' }" },
      { label: "D", text: "input-schema: { type: 'string', description: 'component name' }" }
    ],
    correctAnswer: "B",
    explanation: "The argument-hint frontmatter field provides a hint to users about what argument a custom command expects. It appears in the command's help text. Options A, C, and D use field names that are not part of the Claude Code command frontmatter specification."
  },
  {
    id: 92,
    domain: 3,
    scenario: 4,
    taskStatement: "3.3",
    question: "A team has a convention that all database migration files (found in various packages within a monorepo) must include rollback logic and use specific transaction patterns. The migration files follow a naming pattern like YYYYMMDD_description.sql across multiple directories. A directory-level CLAUDE.md won't work because migrations exist in packages/*/migrations/. What should they use?",
    options: [
      { label: "A", text: "A root CLAUDE.md with migration instructions that apply to all files" },
      { label: "B", text: "A rule file in .claude/rules/ with paths: ['**/migrations/*.sql']" },
      { label: "C", text: "A custom command that adds migration instructions when invoked" },
      { label: "D", text: "Individual CLAUDE.md files in each package's migrations/ directory" }
    ],
    correctAnswer: "B",
    explanation: "A .claude/rules/ file with a glob pattern like **/migrations/*.sql targets migration files across all packages without requiring duplicate configuration. Root CLAUDE.md (option A) would load migration rules even when not working on migrations. Custom commands (option C) require manual invocation. Individual CLAUDE.md files (option D) require maintenance across many directories."
  },
  {
    id: 93,
    domain: 3,
    scenario: 3,
    taskStatement: "3.4",
    question: "A developer needs to add a new subagent to a multi-agent research system. This requires creating a new directory, defining agent configuration, writing tool integrations, updating the coordinator routing logic, and modifying shared types. What is the appropriate approach?",
    options: [
      { label: "A", text: "Direct execution since the developer knows exactly what to add" },
      { label: "B", text: "Plan mode since this involves multi-file modifications across the system" },
      { label: "C", text: "Use a custom slash command for agent creation" },
      { label: "D", text: "Direct execution with the explore subagent running in parallel" }
    ],
    correctAnswer: "B",
    explanation: "Plan mode is appropriate for multi-file modifications that need coordination. Adding a subagent touches multiple files (config, tools, routing, types) and requires a coherent plan to ensure consistency. Even if the developer knows the goal, planning helps coordinate the changes. Direct execution (option A) risks inconsistent partial changes. A custom command (option C) may not exist. Running explore in parallel with direct execution (option D) is not how the tools work together."
  },
  {
    id: 94,
    domain: 3,
    scenario: 1,
    taskStatement: "3.5",
    question: "A customer support agent built with Claude Code occasionally provides refund amounts that don't match the order total. The team wants to iteratively improve accuracy. Which refinement technique is most directly effective?",
    options: [
      { label: "A", text: "Add more general instructions about being accurate with numbers" },
      { label: "B", text: "Provide concrete examples showing input orders and expected refund calculations with exact amounts" },
      { label: "C", text: "Increase the model temperature for more diverse responses" },
      { label: "D", text: "Add a disclaimer that refund amounts should be verified" }
    ],
    correctAnswer: "B",
    explanation: "Concrete input/output examples demonstrating exact refund calculations are more effective than prose descriptions. They show the model precisely how to derive amounts from order data. General accuracy instructions (option A) are vague and unlikely to change behavior. Higher temperature (option C) increases randomness. Disclaimers (option D) don't improve accuracy."
  },
  {
    id: 95,
    domain: 3,
    scenario: 5,
    taskStatement: "3.6",
    question: "A team uses Claude Code in CI to provide automated PR feedback. Reviewers notice that Claude's comments sometimes reference code from other PRs that were reviewed in the same CI runner. What is the root cause and fix?",
    options: [
      { label: "A", text: "The CI runner has too much memory; reduce the allocation" },
      { label: "B", text: "Claude Code sessions are not isolated between PR reviews; use separate instances per review" },
      { label: "C", text: "The model is hallucinating code from its training data" },
      { label: "D", text: "PR branches are not properly checked out before review" }
    ],
    correctAnswer: "B",
    explanation: "If Claude Code instances are shared or reuse session context between PR reviews, context from one review can leak into another. The fix is session context isolation: each PR review should run in its own separate Claude Code instance. Memory allocation (option A) is unrelated. Training data hallucination (option C) would produce generic code, not code from specific other PRs. Branch checkout (option D) is a separate concern."
  },
  {
    id: 96,
    domain: 3,
    scenario: 6,
    taskStatement: "3.6",
    question: "A batch data extraction pipeline uses Claude Code in CI to process incoming files. The team wants the output to conform to a specific JSON schema so it can be loaded directly into their data warehouse. What is the correct approach?",
    options: [
      { label: "A", text: "Add JSON formatting instructions to the prompt and hope for the best" },
      { label: "B", text: "Use -p with --output-format json and --json-schema specifying the warehouse schema" },
      { label: "C", text: "Post-process Claude's text output with a JSON parser" },
      { label: "D", text: "Use a fine-tuned model specifically for JSON output" }
    ],
    correctAnswer: "B",
    explanation: "The -p flag for non-interactive mode combined with --output-format json and --json-schema ensures Claude Code produces structured JSON matching the specified schema. Prompt instructions alone (option A) don't guarantee valid JSON. Post-processing (option C) adds complexity and may fail on malformed output. Fine-tuning (option D) is unnecessary when schema enforcement is available."
  },
  {
    id: 97,
    domain: 3,
    scenario: 5,
    taskStatement: "3.1",
    question: "A team discovers that their CI pipeline's Claude Code instructions conflict with a developer's personal ~/.claude/CLAUDE.md settings, causing inconsistent review results between local development and CI. What is the correct understanding of CLAUDE.md precedence?",
    options: [
      { label: "A", text: "CI environment variables override all CLAUDE.md settings" },
      { label: "B", text: "User-level ~/.claude/CLAUDE.md, project-level, and directory-level all contribute to context with directory-level being most specific" },
      { label: "C", text: "Project-level CLAUDE.md always overrides user-level settings" },
      { label: "D", text: "The last-loaded CLAUDE.md file completely replaces all previous ones" }
    ],
    correctAnswer: "B",
    explanation: "CLAUDE.md follows a hierarchical model: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md or root), and directory-level all contribute to the context, with directory-level being the most specific. They don't override each other; they accumulate. In CI, user-level files typically don't exist, which explains the inconsistency. Environment variables (option A) don't override CLAUDE.md. Files don't replace each other (option D)."
  },
  {
    id: 98,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1",
    question: "A CI code review agent flags 60% of functions as 'potentially problematic,' overwhelming developers with false positives. The prompt says 'review code for potential issues.' What is the most effective fix?",
    options: [
      { label: "A", text: "Add a confidence threshold: only flag issues with >80% confidence" },
      { label: "B", text: "Replace the vague instruction with explicit criteria like 'flag functions where behavior contradicts their documentation or where error returns are silently ignored'" },
      { label: "C", text: "Reduce the amount of code sent to the model per request" },
      { label: "D", text: "Switch to a smaller model that produces fewer outputs" }
    ],
    correctAnswer: "B",
    explanation: "Explicit criteria ('flag when behavior contradicts comments,' 'flag silently ignored errors') dramatically reduce false positives by giving the model concrete, testable conditions. Vague instructions like 'potential issues' cast too wide a net. Confidence thresholds (option A) are unreliable because confidence-based filtering fails in practice. Reducing input (option C) doesn't fix the criteria problem. Smaller models (option D) would be less accurate."
  },
  {
    id: 99,
    domain: 4,
    scenario: 1,
    taskStatement: "4.1",
    question: "A customer support agent uses sentiment analysis to flag potentially angry customers for priority handling. The team notices many neutral queries are being flagged. A team member suggests adding a confidence score threshold to reduce false positives. Is this a good approach?",
    options: [
      { label: "A", text: "Yes, a 90% confidence threshold will eliminate most false positives" },
      { label: "B", text: "Yes, but only if combined with keyword matching" },
      { label: "C", text: "No, confidence-based filtering for sentiment is unreliable; instead use explicit behavioral criteria like 'customer has repeated the same complaint more than twice'" },
      { label: "D", text: "No, remove sentiment analysis entirely and rely on customer self-reporting" }
    ],
    correctAnswer: "C",
    explanation: "Confidence-based filtering fails for subjective tasks like sentiment analysis because the model's confidence scores don't reliably correlate with accuracy. Explicit behavioral criteria (e.g., 'repeated same complaint >2 times,' 'used profanity,' 'requested manager') are concrete and testable. Threshold tuning (options A, B) doesn't fix the fundamental unreliability. Removing analysis entirely (option D) loses valuable capability."
  },
  {
    id: 100,
    domain: 4,
    scenario: 6,
    taskStatement: "4.1",
    question: "A data extraction pipeline flags extracted prices as 'suspicious' based on the vague criterion 'unusually high or low prices.' This generates hundreds of false positives daily. What change would most reduce false positives while maintaining detection of genuine anomalies?",
    options: [
      { label: "A", text: "Add explicit criteria: 'flag prices that exceed 3 standard deviations from the product category median or are negative values'" },
      { label: "B", text: "Increase the model temperature to generate more nuanced assessments" },
      { label: "C", text: "Add a secondary model to verify the first model's flags" },
      { label: "D", text: "Batch the suspicious flags and review them weekly instead of daily" }
    ],
    correctAnswer: "A",
    explanation: "Replacing vague criteria ('unusually high or low') with explicit, testable conditions ('exceeds 3 standard deviations from category median' or 'negative values') gives the model concrete rules to apply. This directly reduces false positives. Temperature changes (option B) add randomness. A secondary model (option C) adds cost without fixing the root criterion problem. Batching (option D) delays but doesn't reduce false positives."
  },
  {
    id: 101,
    domain: 4,
    scenario: 5,
    taskStatement: "4.1",
    question: "A code review agent has been producing many false positive 'security vulnerability' warnings. The team realizes that these false positives erode developer trust in the tool. Which statement best describes why reducing false positives is critical?",
    options: [
      { label: "A", text: "False positives increase API costs due to longer conversations" },
      { label: "B", text: "False positives erode trust, causing developers to ignore all warnings, including true positives" },
      { label: "C", text: "False positives slow down the CI pipeline significantly" },
      { label: "D", text: "False positives indicate the model needs fine-tuning" }
    ],
    correctAnswer: "B",
    explanation: "The primary danger of false positives is trust erosion: when developers are overwhelmed with incorrect warnings, they begin ignoring all warnings, including legitimate security issues. This is the 'boy who cried wolf' effect. While false positives may have cost (option A) and speed (option C) implications, the trust impact is the most critical concern. False positives indicate a prompt criteria problem, not necessarily a need for fine-tuning (option D)."
  },
  {
    id: 102,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2",
    question: "A team is building a data extraction system that must handle ambiguous supplier emails where product names sometimes appear in subject lines, sometimes in the body, and sometimes abbreviated. Which prompting technique is most effective for achieving consistent extraction across these variations?",
    options: [
      { label: "A", text: "Zero-shot with detailed instructions about where to look for product names" },
      { label: "B", text: "Few-shot prompting with examples showing extraction from each ambiguous pattern (subject-line, body, abbreviated)" },
      { label: "C", text: "Chain-of-thought prompting asking the model to reason about where product names might appear" },
      { label: "D", text: "Multiple independent extraction passes combined with majority voting" }
    ],
    correctAnswer: "B",
    explanation: "Few-shot prompting is most effective for consistent output when handling ambiguous patterns. By demonstrating extraction from each variation (subject, body, abbreviations), the model learns to handle all patterns consistently. Zero-shot instructions (option A) leave room for interpretation. Chain-of-thought (option C) helps with reasoning but doesn't ensure consistent format. Majority voting (option D) adds cost without addressing the core consistency issue."
  },
  {
    id: 103,
    domain: 4,
    scenario: 1,
    taskStatement: "4.2",
    question: "A support agent needs to categorize customer issues into predefined categories. Some issues could plausibly fit multiple categories (e.g., 'my refund didn't arrive' could be billing or shipping). How should the prompt handle this?",
    options: [
      { label: "A", text: "Provide few-shot examples that explicitly demonstrate how to categorize ambiguous cases, showing the reasoning for the chosen category" },
      { label: "B", text: "Let the model assign multiple categories and sort it out downstream" },
      { label: "C", text: "Add a rule that says 'when in doubt, choose the first applicable category'" },
      { label: "D", text: "Use a decision tree that eliminates ambiguity through sequential questions" }
    ],
    correctAnswer: "A",
    explanation: "Few-shot examples demonstrating ambiguous-case handling are the most effective technique. By showing examples of borderline cases with clear categorization logic, the model learns the prioritization pattern. Multiple categories (option B) pushes complexity downstream. Arbitrary rules like 'choose the first' (option C) don't capture the nuanced logic needed. Decision trees (option D) are rigid and hard to maintain."
  },
  {
    id: 104,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2",
    question: "An extraction system encounters a new invoice format it hasn't seen before, but the format shares structural similarities with formats shown in the few-shot examples. What is the expected behavior?",
    options: [
      { label: "A", text: "The model will fail because the exact format wasn't in the examples" },
      { label: "B", text: "The model will generalize from the few-shot examples to extract data from the novel format" },
      { label: "C", text: "The model will hallucinate data to fill expected fields" },
      { label: "D", text: "The model will request additional examples before proceeding" }
    ],
    correctAnswer: "B",
    explanation: "A key benefit of few-shot prompting is that it enables generalization to novel patterns. When the model has seen structurally similar examples, it can apply learned extraction patterns to new formats. It won't fail outright (option A) if structural cues are present. Well-constructed few-shot examples reduce hallucination (option C). Models don't typically request more examples mid-extraction (option D)."
  },
  {
    id: 105,
    domain: 4,
    scenario: 6,
    taskStatement: "4.2",
    question: "A team notices their extraction model occasionally hallucinates product codes that don't exist in the source document. Which prompting approach most directly addresses this?",
    options: [
      { label: "A", text: "Add a post-processing validation step that checks product codes against a database" },
      { label: "B", text: "Include few-shot examples where some fields are absent in the source, demonstrating that the model should output null rather than hallucinate" },
      { label: "C", text: "Lower the temperature to 0 to eliminate all hallucination" },
      { label: "D", text: "Add an instruction saying 'do not hallucinate'" }
    ],
    correctAnswer: "B",
    explanation: "Few-shot examples demonstrating correct handling of missing data (outputting null rather than inventing values) reduce hallucination in extraction tasks. The model learns that leaving a field empty is acceptable. Post-processing (option A) catches but doesn't prevent hallucination. Temperature 0 (option C) doesn't eliminate hallucination. Generic instructions (option D) are less effective than demonstrated examples."
  },
  {
    id: 106,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3",
    question: "A team needs Claude to reliably return structured JSON for a data extraction pipeline. They're debating between instructing Claude to output JSON via the system prompt versus using tool_use with a JSON schema. Which approach is most reliable?",
    options: [
      { label: "A", text: "System prompt instructions with 'respond only in JSON' are equally reliable" },
      { label: "B", text: "tool_use with JSON schemas is most reliable for structured output because it enforces the schema at the API level" },
      { label: "C", text: "Custom stop sequences to force JSON formatting" },
      { label: "D", text: "A regex-based parser on free-text output" }
    ],
    correctAnswer: "B",
    explanation: "tool_use with JSON schemas is the most reliable method for structured output because the schema is enforced at the API level, guaranteeing valid JSON structure. System prompt instructions (option A) can still produce malformed JSON or extra text. Stop sequences (option C) don't ensure valid JSON. Regex parsing (option D) is fragile and error-prone."
  },
  {
    id: 107,
    domain: 4,
    scenario: 1,
    taskStatement: "4.3",
    question: "A customer support system uses tool_use to structure its responses. The team wants Claude to always use a specific tool rather than sometimes responding with plain text. Which tool_choice setting should they use?",
    options: [
      { label: "A", text: "tool_choice: 'auto' - let Claude decide when to use tools" },
      { label: "B", text: "tool_choice: 'any' - Claude must use one of the available tools but can choose which" },
      { label: "C", text: "Force a specific tool by name so Claude always uses that exact tool" },
      { label: "D", text: "tool_choice: 'none' with a system prompt requiring tool use" }
    ],
    correctAnswer: "C",
    explanation: "Forcing a specific tool by name ensures Claude always uses that exact tool, which is the most reliable approach when you need a specific structured output every time. 'auto' (option A) lets Claude choose whether to use tools at all. 'any' (option B) requires tool use but doesn't guarantee which tool. 'none' with a system prompt (option D) contradicts itself and won't force tool use."
  },
  {
    id: 108,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3",
    question: "A team uses strict JSON schemas for invoice extraction. After deployment, they discover that while the JSON is always syntactically valid, some extracted values are semantically wrong (e.g., a shipping address in the billing address field). What does this reveal about strict schemas?",
    options: [
      { label: "A", text: "The schema isn't strict enough and needs more regex validation" },
      { label: "B", text: "Strict schemas eliminate syntax errors but not semantic errors; field values can be structurally valid but contextually wrong" },
      { label: "C", text: "The model needs fine-tuning to understand the difference between billing and shipping" },
      { label: "D", text: "Strict schemas are not suitable for complex extraction tasks" }
    ],
    correctAnswer: "B",
    explanation: "Strict schemas guarantee structural validity (correct JSON, correct field names and types) but cannot enforce semantic correctness. A shipping address is a valid string for a billing address field as far as the schema is concerned. More regex (option A) can't distinguish address types. Fine-tuning (option C) may help but isn't the lesson here. Strict schemas are still valuable (option D); they just need supplemental validation."
  },
  {
    id: 109,
    domain: 4,
    scenario: 6,
    taskStatement: "4.3",
    question: "An extraction schema has a field for 'tax_id' that is sometimes not present in source documents. The team notices Claude sometimes fills in plausible but fabricated tax IDs. What schema design change would help prevent this?",
    options: [
      { label: "A", text: "Make the tax_id field required and add validation" },
      { label: "B", text: "Make the tax_id field nullable so Claude can return null when the value isn't in the source document" },
      { label: "C", text: "Remove the tax_id field entirely from the schema" },
      { label: "D", text: "Add a default value of '000-000-000' for missing tax IDs" }
    ],
    correctAnswer: "B",
    explanation: "Making the field nullable gives Claude a legitimate way to express 'this information is not present' rather than being forced to populate the field with a hallucinated value. Required fields (option A) force population. Removing the field (option C) loses the capability entirely. Default values (option D) create misleading data."
  },
  {
    id: 110,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4",
    question: "An extraction pipeline produces a JSON output that fails schema validation. The error is: 'price field is string, expected number.' What is the most effective retry strategy?",
    options: [
      { label: "A", text: "Simply retry the same prompt; the model may produce different output" },
      { label: "B", text: "Retry with the error message appended to the prompt: 'Previous output had error: price field is string, expected number. Please correct this.'" },
      { label: "C", text: "Increase temperature and retry to encourage different formatting" },
      { label: "D", text: "Switch to a different model for the retry attempt" }
    ],
    correctAnswer: "B",
    explanation: "Retry-with-error-feedback is the most effective strategy: appending the specific error message to the prompt gives the model explicit information about what went wrong, allowing it to correct the specific issue. Blind retry (option A) may produce the same error. Increased temperature (option C) adds randomness without addressing the specific error. Switching models (option D) is expensive and unnecessary for a correctable error."
  },
  {
    id: 111,
    domain: 4,
    scenario: 1,
    taskStatement: "4.4",
    question: "A support agent tries to look up a customer's order but the order number isn't in the system. The agent retries the lookup three times, each time failing. What should the system do?",
    options: [
      { label: "A", text: "Retry with different query formats (e.g., with/without dashes in order number)" },
      { label: "B", text: "Recognize that retries are ineffective for missing information and ask the customer to verify the order number" },
      { label: "C", text: "Escalate to a human agent after 3 failed retries" },
      { label: "D", text: "Generate a plausible order record based on the customer's description" }
    ],
    correctAnswer: "B",
    explanation: "Retries are ineffective when the fundamental problem is missing information. If the order number doesn't exist in the system, no amount of retrying will find it. The correct action is to ask the customer to verify or provide the correct number. Format variations (option A) might help in some cases but don't address fundamentally missing data. Escalation (option C) is premature. Fabricating records (option D) is dangerous."
  },
  {
    id: 112,
    domain: 4,
    scenario: 5,
    taskStatement: "4.4",
    question: "A CI review system has a high false-positive rate for 'suspicious patterns.' The team adds a detected_pattern field to the review output. How should this field be used?",
    options: [
      { label: "A", text: "To automatically filter out known false positive patterns" },
      { label: "B", text: "To analyze patterns that trigger false positives and refine the review criteria accordingly" },
      { label: "C", text: "To display in the PR comments so developers can see what triggered the flag" },
      { label: "D", text: "To train a classifier that predicts false positives" }
    ],
    correctAnswer: "B",
    explanation: "The detected_pattern field is primarily valuable for analyzing which patterns trigger false positives, enabling the team to refine review criteria and reduce the false-positive rate over time. Automatic filtering (option A) may suppress true positives. Display (option C) is useful but not the primary purpose. Training a classifier (option D) adds unnecessary complexity."
  },
  {
    id: 113,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4",
    question: "An invoice extraction system is extracting both a stated total from the document and individual line items. The team wants to detect extraction errors. What self-correction technique should they implement?",
    options: [
      { label: "A", text: "Run the extraction twice and compare outputs" },
      { label: "B", text: "Include a calculated_total field (sum of line items) alongside the stated_total field, and flag discrepancies" },
      { label: "C", text: "Add a confidence score to the total field" },
      { label: "D", text: "Use a separate validation API to check the total" }
    ],
    correctAnswer: "B",
    explanation: "Including both a calculated_total (computed from extracted line items) and a stated_total (directly from the document) enables self-correction: discrepancies indicate extraction errors. This is a built-in consistency check. Running twice (option A) is expensive and may produce the same error. Confidence scores (option C) are unreliable. External validation (option D) adds latency and cost."
  },
  {
    id: 114,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5",
    question: "A company needs to process 10,000 supplier invoices for data extraction. The results are needed within 48 hours, not in real-time. Cost is a primary concern. Which approach is most appropriate?",
    options: [
      { label: "A", text: "Process all invoices synchronously through the standard API" },
      { label: "B", text: "Use the Message Batches API for 50% cost savings with up to 24-hour processing time" },
      { label: "C", text: "Split into 10 parallel API streams for faster processing" },
      { label: "D", text: "Use a smaller, cheaper model for bulk processing" }
    ],
    correctAnswer: "B",
    explanation: "The Message Batches API provides 50% cost savings and allows up to 24 hours for processing, making it ideal for non-real-time bulk workloads. Since results are needed within 48 hours, the 24-hour processing window fits. Synchronous processing (option A) costs twice as much. Parallel streams (option C) don't offer cost savings. A smaller model (option D) may sacrifice extraction quality."
  },
  {
    id: 115,
    domain: 4,
    scenario: 1,
    taskStatement: "4.5",
    question: "A support team wants to use the Message Batches API to process customer support tickets. However, each ticket may require multiple tool calls (lookup_order, get_customer, process_refund) to resolve. Is the Batches API appropriate?",
    options: [
      { label: "A", text: "Yes, the Batches API handles multi-turn tool calling automatically" },
      { label: "B", text: "No, the Message Batches API does not support multi-turn tool calling; each batch item is a single request-response" },
      { label: "C", text: "Yes, but only if tool calls are pre-computed" },
      { label: "D", text: "No, because the Batches API has a latency SLA that conflicts with tool call delays" }
    ],
    correctAnswer: "B",
    explanation: "The Message Batches API does not support multi-turn tool calling. Each batch item is a single request-response cycle. Support tickets requiring sequential tool calls (lookup, then refund, then confirm) cannot be fully resolved in a single batch request. The API doesn't automatically handle multi-turn (option A). Pre-computing defeats the purpose (option C). The API has no latency SLA (option D)."
  },
  {
    id: 116,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5",
    question: "A team submits a batch of 5,000 invoice extraction requests using the Message Batches API. They need to match each result back to its source invoice for downstream processing. What mechanism does the API provide for this?",
    options: [
      { label: "A", text: "Results are returned in the same order as submitted" },
      { label: "B", text: "Each request includes a custom_id field that is returned with the corresponding result for correlation" },
      { label: "C", text: "The API returns a mapping file with request-to-result associations" },
      { label: "D", text: "Results include the original request content for matching" }
    ],
    correctAnswer: "B",
    explanation: "The custom_id field on each batch request is returned with the corresponding result, enabling reliable correlation between requests and results. Order-based matching (option A) is not guaranteed. No mapping file is produced (option C). Results don't include original request content (option D)."
  },
  {
    id: 117,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5",
    question: "A real-time data extraction API receives individual documents and must return results within 2 seconds. A developer suggests switching to the Message Batches API to save costs. Is this appropriate?",
    options: [
      { label: "A", text: "Yes, the cost savings justify a slight increase in latency" },
      { label: "B", text: "No, the Batches API has no latency SLA and processing can take up to 24 hours; it is inappropriate for real-time requirements" },
      { label: "C", text: "Yes, if they set a priority flag on the batch requests" },
      { label: "D", text: "No, but only because single-document batches are not supported" }
    ],
    correctAnswer: "B",
    explanation: "The Message Batches API has no latency SLA and processing can take up to 24 hours. It is designed for latency-tolerant, non-blocking workloads and is completely inappropriate for real-time 2-second response requirements. There is no priority flag mechanism (option C). Single-item batches are technically possible but miss the point (option D)."
  },
  {
    id: 118,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6",
    question: "A CI pipeline asks Claude to generate code and then review its own output for bugs in the same conversation. The review rarely finds issues. What is the fundamental problem?",
    options: [
      { label: "A", text: "The model is too confident in its own output" },
      { label: "B", text: "The model retains its reasoning context from generation, making it biased toward validating its own logic rather than critically reviewing it" },
      { label: "C", text: "The review prompt is too vague" },
      { label: "D", text: "Self-review only works with chain-of-thought prompting enabled" }
    ],
    correctAnswer: "B",
    explanation: "Self-review is limited because the model retains its reasoning context from the generation step. It tends to validate the same logic it just used rather than approaching the code with fresh critical eyes. This is a fundamental limitation of same-session review. Confidence (option A) is a symptom, not the root cause. Prompt vagueness (option C) may contribute but isn't the core issue. Chain-of-thought (option D) doesn't solve the context retention problem."
  },
  {
    id: 119,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6",
    question: "A team wants more effective automated code review in CI. They've learned that self-review is limited. What alternative approach would be most effective?",
    options: [
      { label: "A", text: "Use a different model for review than for generation" },
      { label: "B", text: "Use independent review instances that don't share context with the generation session" },
      { label: "C", text: "Add a delay between generation and review to 'reset' the model" },
      { label: "D", text: "Use the same instance but with a strongly-worded adversarial review prompt" }
    ],
    correctAnswer: "B",
    explanation: "Independent review instances are more effective because they approach the code without the reasoning context that influenced generation. A fresh instance reviews the code on its own merits. Different models (option A) add complexity without addressing the core context issue. Delays (option C) don't clear context in the same session. Adversarial prompts (option D) still operate within the same biased context."
  },
  {
    id: 120,
    domain: 4,
    scenario: 5,
    taskStatement: "4.6",
    question: "A large PR modifies 20 files across 3 modules. The team wants comprehensive AI review. What multi-pass review strategy would be most effective?",
    options: [
      { label: "A", text: "Send all 20 files in a single context window for holistic review" },
      { label: "B", text: "A multi-pass approach: first pass reviews each file locally (per-file), second pass reviews cross-file integration points" },
      { label: "C", text: "Review files in alphabetical order with cumulative context" },
      { label: "D", text: "Only review files with the most changes, skip minor modifications" }
    ],
    correctAnswer: "B",
    explanation: "A multi-pass approach combining per-file local review (catching issues within each file) with a cross-file integration pass (catching inconsistencies between modules) provides comprehensive coverage. A single holistic review (option A) may miss details in a large context. Alphabetical order (option C) has no logical basis. Skipping minor files (option D) may miss important bugs in small changes."
  },
  {
    id: 121,
    domain: 4,
    scenario: 3,
    taskStatement: "4.1",
    question: "A research synthesis agent is flagging too many sources as 'potentially unreliable.' The current instruction says 'evaluate source reliability.' What explicit criteria would most effectively reduce false positives while maintaining detection of truly unreliable sources?",
    options: [
      { label: "A", text: "Flag sources with confidence below 70%" },
      { label: "B", text: "Flag sources where the publication has no identifiable editorial review process, the author has no verifiable credentials in the claimed domain, or the claims contradict multiple peer-reviewed sources" },
      { label: "C", text: "Flag all sources that aren't from top-10 journals" },
      { label: "D", text: "Let the model use its judgment about what constitutes unreliable" }
    ],
    correctAnswer: "B",
    explanation: "Explicit, testable criteria (no editorial review, unverifiable credentials, contradicting peer-reviewed sources) give the model concrete conditions to check rather than subjective assessment. Confidence thresholds (option A) are unreliable. Top-10 journal filtering (option C) is overly restrictive and misses good sources. Relying on judgment (option D) is what caused the problem."
  },
  {
    id: 122,
    domain: 4,
    scenario: 1,
    taskStatement: "4.2",
    question: "A customer support bot must extract order IDs from free-text customer messages. Customers write order IDs in various formats: 'ORD-12345', '#12345', 'order number 12345', or just '12345' buried in a sentence. What prompting technique would yield the most consistent extraction?",
    options: [
      { label: "A", text: "A regex pattern that matches all known order ID formats" },
      { label: "B", text: "Few-shot examples demonstrating extraction from each format variation" },
      { label: "C", text: "A system prompt saying 'extract order IDs from messages'" },
      { label: "D", text: "A two-step chain: first classify the message format, then extract" }
    ],
    correctAnswer: "B",
    explanation: "Few-shot examples showing extraction from each format variation (prefixed, hash, spelled out, embedded) enable consistent extraction across all patterns. Regex (option A) breaks on natural language context ('order number 12345'). A generic system prompt (option C) leaves handling of variations to the model's discretion. Two-step classification (option D) is unnecessarily complex for this task."
  },
  {
    id: 123,
    domain: 4,
    scenario: 1,
    taskStatement: "4.3",
    question: "A support agent uses tool_use with tool_choice set to 'auto.' The team notices that Claude sometimes responds with plain text instead of using the get_customer tool when a customer provides their email. What should they change?",
    options: [
      { label: "A", text: "Add stronger instructions in the system prompt to always use tools" },
      { label: "B", text: "Change tool_choice to force the get_customer tool when customer identification is needed" },
      { label: "C", text: "Remove the plain text response capability entirely" },
      { label: "D", text: "Add more few-shot examples showing tool use" }
    ],
    correctAnswer: "B",
    explanation: "Forcing a specific tool via tool_choice is the reliable way to ensure tool use in specific situations, rather than relying on the model to choose correctly with 'auto.' System prompt instructions (option A) can still be overridden by the model's judgment. You can't remove plain text capability (option C). Few-shot examples (option D) improve but don't guarantee behavior."
  },
  {
    id: 124,
    domain: 4,
    scenario: 6,
    taskStatement: "4.4",
    question: "An extraction system retries a failed request by appending the validation error. On the second attempt, it produces different but still invalid output. On the third attempt, it succeeds. What is the recommended limit for retry attempts?",
    options: [
      { label: "A", text: "Unlimited retries until success" },
      { label: "B", text: "Exactly one retry to minimize latency" },
      { label: "C", text: "A small number of retries (2-3) with error feedback, then fallback to human review or error reporting" },
      { label: "D", text: "No retries; fail fast and queue for human processing" }
    ],
    correctAnswer: "C",
    explanation: "A small number of retries (2-3) with error feedback balances success likelihood against cost and latency. Most correctable errors resolve within 2-3 attempts. Unlimited retries (option A) risk infinite loops and high costs. One retry (option B) may miss fixable errors. No retries (option D) wastes the opportunity to self-correct simple errors."
  },
  {
    id: 125,
    domain: 4,
    scenario: 6,
    taskStatement: "4.5",
    question: "A team processes monthly batches of 50,000 documents using the Message Batches API. They want to monitor progress and handle partial failures. Which statement about the Batches API is correct?",
    options: [
      { label: "A", text: "The API provides real-time progress updates via webhooks" },
      { label: "B", text: "If one request in the batch fails, the entire batch is cancelled" },
      { label: "C", text: "Each request in the batch is processed independently; failures in some requests don't affect others, and custom_id enables tracking individual results" },
      { label: "D", text: "Batch processing guarantees that all results are returned simultaneously" }
    ],
    correctAnswer: "C",
    explanation: "Each request in a batch is processed independently. Failures in individual requests don't cancel the batch, and custom_id on each request allows tracking which succeeded and which failed. There are no real-time webhook updates (option A). The batch doesn't fail atomically (option B). Results are not guaranteed to return simultaneously (option D)."
  },
  {
    id: 126,
    domain: 4,
    scenario: 3,
    taskStatement: "4.6",
    question: "A multi-agent research system has a synthesis agent that combines findings from web search and document analysis subagents. The coordinator wants the synthesis to be reviewed for accuracy. Should the same synthesis agent review its own output?",
    options: [
      { label: "A", text: "Yes, the synthesis agent has the most context about the combined findings" },
      { label: "B", text: "No, an independent review instance should check the synthesis because the synthesis agent retains its reasoning biases" },
      { label: "C", text: "Yes, but only after a mandatory 30-second delay" },
      { label: "D", text: "No, only a human reviewer can effectively evaluate synthesis quality" }
    ],
    correctAnswer: "B",
    explanation: "An independent review instance is more effective because the synthesis agent retains its reasoning context and biases from the synthesis process. A fresh instance can critically evaluate the output without those biases. While the synthesis agent has context (option A), that context creates blind spots. Delays (option C) don't reset model context. Human review (option D) may not always be feasible at scale."
  },
  {
    id: 127,
    domain: 4,
    scenario: 1,
    taskStatement: "4.1",
    question: "A support agent flags potential fraud using the criterion 'unusual account activity.' This generates 200+ false positives daily. Which replacement criteria would be most effective?",
    options: [
      { label: "A", text: "Add a machine learning fraud detection model as a pre-filter" },
      { label: "B", text: "Replace with explicit criteria: 'flag accounts with >5 failed login attempts in 1 hour, password changes from a new IP within 24 hours of a large purchase, or refund requests exceeding the original order value'" },
      { label: "C", text: "Increase the threshold for 'unusual' to reduce flags" },
      { label: "D", text: "Only flag activity during off-business hours" }
    ],
    correctAnswer: "B",
    explanation: "Explicit, concrete criteria with specific thresholds and conditions replace the subjective 'unusual' with testable rules. Each criterion targets a known fraud pattern. A pre-filter (option A) adds complexity without fixing the vague prompt. Adjusting the 'unusual' threshold (option C) is still subjective. Time-based filtering (option D) misses many fraud patterns and creates false negatives."
  },
  {
    id: 128,
    domain: 5,
    scenario: 1,
    taskStatement: "5.1",
    question: "A customer support agent is handling a complex case that has spanned 30+ messages. The conversation includes specific dollar amounts ($47.99 refund, $12.50 shipping credit), order numbers, and timestamps. The context is getting long. A developer suggests using progressive summarization to compress the conversation. What is the primary risk?",
    options: [
      { label: "A", text: "The summarization will take too long to process" },
      { label: "B", text: "Progressive summarization risks losing specific numerical values like exact refund amounts and order numbers that are critical to case resolution" },
      { label: "C", text: "The customer will notice the summary and feel their issue is being trivialized" },
      { label: "D", text: "Summarization will cause the model to forget tool outputs" }
    ],
    correctAnswer: "B",
    explanation: "Progressive summarization's primary risk is loss of specific numerical values, order IDs, and precise details that are critical for accurate case resolution. A summary might say 'customer is owed a refund' instead of '$47.99 refund plus $12.50 shipping credit.' Processing time (option A) is minor. Customer visibility (option C) is not an issue since summarization is internal. Tool output handling (option D) is a separate concern."
  },
  {
    id: 129,
    domain: 5,
    scenario: 3,
    taskStatement: "5.1",
    question: "A research agent has accumulated findings from 15 different sources across a long conversation. A study from source #3 contradicts findings from source #11, but both were discussed many messages apart. What technique helps ensure this contradiction is not overlooked?",
    options: [
      { label: "A", text: "Increase the context window size to hold all findings" },
      { label: "B", text: "Extract structured 'case facts' blocks summarizing key findings with source attribution, making contradictions visible" },
      { label: "C", text: "Always process sources in chronological order" },
      { label: "D", text: "Only keep the most recent 5 source findings in context" }
    ],
    correctAnswer: "B",
    explanation: "Structured 'case facts' blocks consolidate key findings with source attribution in a compact format that makes contradictions visible regardless of when they were discussed. The 'lost in the middle' effect means information discussed early or in the middle of long conversations can be overlooked. Increasing context (option A) doesn't solve the 'lost in middle' problem. Chronological processing (option C) doesn't help with cross-source comparison. Keeping only recent findings (option D) would lose source #3 entirely."
  },
  {
    id: 130,
    domain: 5,
    scenario: 1,
    taskStatement: "5.1",
    question: "A support agent uses multiple tools (get_customer, lookup_order, process_refund) during a long conversation. The developer notices that tool results are accumulating and consuming a disproportionate amount of the context window. What is happening and what should be done?",
    options: [
      { label: "A", text: "Tool results are being duplicated; enable deduplication" },
      { label: "B", text: "Tool results accumulate tokens disproportionately because each tool call adds its full response to context; extract only the relevant fields from tool results" },
      { label: "C", text: "The tools are returning too much data; reduce the API response payload size" },
      { label: "D", text: "Switch to tools that return less verbose output formats" }
    ],
    correctAnswer: "B",
    explanation: "Tool results accumulate tokens disproportionately because each tool call's full response is added to the conversation context. Over many interactions, this rapidly consumes the context window. The solution is to extract and retain only the relevant fields rather than keeping full tool responses. Deduplication (option A) may help with repeated lookups but isn't the core issue. Reducing payload size (option C) and less verbose tools (option D) help but don't address accumulated results."
  },
  {
    id: 131,
    domain: 5,
    scenario: 3,
    taskStatement: "5.1",
    question: "A research agent processes information from 20 sources in a long conversation. The 'lost in the middle' effect means information from which position is most likely to be overlooked?",
    options: [
      { label: "A", text: "The most recent sources, because the model focuses on earlier context" },
      { label: "B", text: "The earliest sources, because they're furthest from the current position" },
      { label: "C", text: "Sources discussed in the middle of the conversation, because models attend more strongly to the beginning and end of context" },
      { label: "D", text: "All positions are equally likely to be overlooked" }
    ],
    correctAnswer: "C",
    explanation: "The 'lost in the middle' effect is a well-documented phenomenon where language models attend more strongly to information at the beginning and end of the context window, with information in the middle being most likely to be overlooked. This makes structured extraction of key facts essential for long conversations. Recent sources (option A) are actually well-attended. Earliest sources (option B) also receive relatively strong attention."
  },
  {
    id: 132,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2",
    question: "A customer explicitly says 'I want to speak with a human manager.' The AI support agent has a 95% confidence it can resolve the issue. What should the agent do?",
    options: [
      { label: "A", text: "Attempt resolution first since it has high confidence, then escalate if the customer asks again" },
      { label: "B", text: "Honor the explicit human request immediately and escalate to a human agent using the escalate_to_human tool" },
      { label: "C", text: "Ask the customer why they want a human to determine if it's truly necessary" },
      { label: "D", text: "Offer to resolve the issue and mention that a human is available if needed" }
    ],
    correctAnswer: "B",
    explanation: "Explicit human requests must be honored immediately regardless of the agent's confidence level. When a customer asks to speak with a human, that request takes precedence over any automated resolution capability. Attempting resolution first (option A) ignores the customer's stated preference. Questioning the request (option C) is dismissive. Offering alternatives (option D) delays the customer's explicit request."
  },
  {
    id: 133,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2",
    question: "A support agent encounters a refund request that falls outside documented policy: the customer wants a refund on a customized item, but the policy only addresses standard items. What is the appropriate action?",
    options: [
      { label: "A", text: "Deny the refund since it's not covered by policy" },
      { label: "B", text: "Approve the refund to maintain customer satisfaction" },
      { label: "C", text: "Escalate to a human agent because there is a policy gap that the AI cannot authoritatively resolve" },
      { label: "D", text: "Apply the standard item refund policy to the customized item" }
    ],
    correctAnswer: "C",
    explanation: "Policy gaps are a key escalation trigger. When the agent encounters a situation not covered by documented policy, it should escalate to a human who can make an authoritative decision. Denying (option A) or approving (option B) the refund would be the agent making a policy decision it's not authorized to make. Applying the wrong policy (option D) could set incorrect precedents."
  },
  {
    id: 134,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2",
    question: "A customer calls about 'order 12345' but the lookup returns two orders with similar numbers: #12345 (placed January) and #12345-B (placed March). What should the agent do?",
    options: [
      { label: "A", text: "Default to the most recent order (#12345-B) since it's likely the one they're asking about" },
      { label: "B", text: "Default to the original order (#12345) since the customer didn't mention '-B'" },
      { label: "C", text: "Ask the customer for additional identifiers to determine which order they mean, such as the order date or items purchased" },
      { label: "D", text: "Present information about both orders and let the customer pick" }
    ],
    correctAnswer: "C",
    explanation: "When multiple matches exist, the agent should ask for additional identifiers (date, items, etc.) to resolve the ambiguity. This prevents acting on the wrong order. Defaulting to most recent (option A) or original (option B) is a guess that could result in the wrong action. Presenting both orders (option D) could work but asking targeted questions is more efficient and professional."
  },
  {
    id: 135,
    domain: 5,
    scenario: 1,
    taskStatement: "5.2",
    question: "A team member suggests using sentiment analysis to trigger escalation: when the customer's sentiment score drops below a threshold, automatically escalate. Is this reliable?",
    options: [
      { label: "A", text: "Yes, sentiment analysis accurately detects frustrated customers who need human attention" },
      { label: "B", text: "Yes, but only when combined with keyword detection" },
      { label: "C", text: "No, sentiment-based escalation is unreliable; some customers express frustration through calm, polite language, and some enthusiastic language is misread as anger" },
      { label: "D", text: "No, because sentiment analysis is too slow for real-time escalation" }
    ],
    correctAnswer: "C",
    explanation: "Sentiment-based escalation is unreliable because sentiment analysis has significant limitations: calm but deeply frustrated customers may not trigger it, while enthusiastic or emphatic language may falsely trigger it. Explicit behavioral triggers (customer requests human, agent cannot progress, policy gap) are more reliable. Adding keywords (option B) helps but doesn't solve the fundamental unreliability. Speed (option D) is not the issue."
  },
  {
    id: 136,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3",
    question: "The web search subagent returns an error: 'API rate limit exceeded.' The coordinator agent receives this error. What should it propagate to the synthesis agent?",
    options: [
      { label: "A", text: "Nothing; suppress the error and work with available results" },
      { label: "B", text: "A generic 'search failed' message" },
      { label: "C", text: "Structured error context: failure type (rate limit), attempted query, partial results if any, and alternative approaches (retry after delay, use cached results)" },
      { label: "D", text: "The raw API error message" }
    ],
    correctAnswer: "C",
    explanation: "Structured error context enables downstream agents to make informed decisions. Knowing it's a rate limit (temporary, retryable) vs. an auth failure (permanent) matters. Partial results and alternatives give the synthesis agent options. Suppressing errors (option A) leads to incomplete or misleading synthesis. Generic messages (option B) don't enable recovery. Raw errors (option D) may lack actionable context."
  },
  {
    id: 137,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3",
    question: "The document analysis subagent queries an internal knowledge base and receives zero results for a specific topic. How should this be communicated to the coordinator?",
    options: [
      { label: "A", text: "Report 'No information available on this topic'" },
      { label: "B", text: "Distinguish between 'access failure' (couldn't reach the database) and 'valid empty result' (database was queried successfully but contains no matching documents), as they require different handling" },
      { label: "C", text: "Skip this source and proceed with other subagent results" },
      { label: "D", text: "Generate a summary based on the agent's training data to fill the gap" }
    ],
    correctAnswer: "B",
    explanation: "Distinguishing access failures from valid empty results is critical: an access failure means the information might exist but wasn't retrieved (worth retrying), while a valid empty result means the source genuinely has no relevant content (don't retry). Generic 'no information' (option A) conflates these. Silently skipping (option C) loses important metadata. Generating from training data (option D) introduces unreliable information."
  },
  {
    id: 138,
    domain: 5,
    scenario: 3,
    taskStatement: "5.3",
    question: "In a multi-agent research system, the web search subagent fails. The coordinator agent terminates the entire research task. Is this the correct behavior?",
    options: [
      { label: "A", text: "Yes, if one subagent fails, the results cannot be complete" },
      { label: "B", text: "No, the system should not terminate on a single subagent failure; it should continue with other subagents and report the gap in the final synthesis" },
      { label: "C", text: "Yes, but only if the failed subagent was the primary source" },
      { label: "D", text: "No, the coordinator should retry the failed subagent indefinitely" }
    ],
    correctAnswer: "B",
    explanation: "A multi-agent system should not terminate on a single subagent failure. The coordinator should continue with other available subagents and clearly report the gap in the final synthesis. Users can then decide if the partial results are sufficient. Complete termination (options A, C) is too aggressive. Indefinite retry (option D) blocks the entire pipeline."
  },
  {
    id: 139,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4",
    question: "A developer has been exploring a large legacy codebase with Claude Code for 2 hours. They notice Claude's responses are becoming less accurate and it's 'forgetting' findings from early in the session. What is happening?",
    options: [
      { label: "A", text: "The model is experiencing fatigue from prolonged use" },
      { label: "B", text: "Context degradation in extended sessions: as the context fills with exploration data, earlier findings are displaced or become lost in the middle" },
      { label: "C", text: "The codebase has changed while they were exploring" },
      { label: "D", text: "The model's API key is rate-limited after extended use" }
    ],
    correctAnswer: "B",
    explanation: "Context degradation in extended sessions is a real phenomenon: as the context window fills with new exploration data, earlier findings receive less attention or are displaced entirely. This is compounded by the 'lost in the middle' effect. Model fatigue (option A) is not a real concept. Codebase changes (option C) are possible but unlikely to cause the described symptoms. Rate limiting (option D) would cause errors, not inaccuracy."
  },
  {
    id: 140,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4",
    question: "During a long codebase exploration session, a developer wants to preserve key findings so they aren't lost as context fills up. What technique is recommended?",
    options: [
      { label: "A", text: "Copy findings into a separate document manually" },
      { label: "B", text: "Use scratchpad files to persist key findings outside the conversation context, which Claude can reference later" },
      { label: "C", text: "Periodically restart the session and re-explore" },
      { label: "D", text: "Use a larger model with more context capacity" }
    ],
    correctAnswer: "B",
    explanation: "Scratchpad files persist key findings outside the conversation context, serving as external memory that Claude can read back later. This prevents loss of important discoveries as the context window fills. Manual copying (option A) works but doesn't integrate with Claude's workflow. Restarting (option C) loses all context. Larger context (option D) delays but doesn't prevent degradation."
  },
  {
    id: 141,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4",
    question: "A developer is exploring a codebase and wants to delegate investigation of a specific subsystem without polluting their main conversation context. What should they use?",
    options: [
      { label: "A", text: "A new terminal window with a separate Claude session" },
      { label: "B", text: "Subagent delegation, which runs an isolated exploration and returns only the summary to the main context" },
      { label: "C", text: "A custom command that runs in the background" },
      { label: "D", text: "The /compact command to make room for the subsystem exploration" }
    ],
    correctAnswer: "B",
    explanation: "Subagent delegation runs exploration in isolation and returns only the summary, keeping the main conversation context clean. A new terminal (option A) works but loses integration with the current session. Background commands (option C) are a different mechanism. /compact (option D) reduces existing context but doesn't prevent new content from filling it."
  },
  {
    id: 142,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4",
    question: "A developer's Claude Code session crashes during a complex multi-file refactoring. They had identified 8 files that needed changes and completed 5 of them. What practice would have helped them recover?",
    options: [
      { label: "A", text: "Making smaller, more frequent git commits" },
      { label: "B", text: "Using structured state persistence (e.g., a progress file listing identified files, completed changes, and remaining tasks) for crash recovery" },
      { label: "C", text: "Using a more stable internet connection" },
      { label: "D", text: "Running Claude Code in a Docker container for isolation" }
    ],
    correctAnswer: "B",
    explanation: "Structured state persistence means maintaining a progress file that tracks the plan (which files, what changes, what's done, what remains). After a crash, a new session can read this file and resume. Git commits (option A) help with code recovery but not with the plan/context. Connection stability (option C) and containers (option D) address different failure modes."
  },
  {
    id: 143,
    domain: 5,
    scenario: 4,
    taskStatement: "5.4",
    question: "A developer's Claude Code session has become slow and responses are degrading after extensive codebase exploration. What command should they use to reduce context size while preserving key information?",
    options: [
      { label: "A", text: "/reset to start a completely fresh session" },
      { label: "B", text: "/compact to reduce context while preserving important information" },
      { label: "C", text: "/clear to delete conversation history" },
      { label: "D", text: "/summarize to generate a session summary" }
    ],
    correctAnswer: "B",
    explanation: "/compact is specifically designed to reduce context size while preserving important information from the session. It compresses the conversation without losing key findings. /reset (option A) would lose everything. /clear (option C) would delete history without preservation. /summarize (option D) is not a standard Claude Code command for this purpose."
  },
  {
    id: 144,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5",
    question: "An extraction system reports 95% aggregate accuracy across all document types. However, when the team examines performance on handwritten invoices specifically, accuracy drops to 60%. What does this reveal about aggregate metrics?",
    options: [
      { label: "A", text: "The 95% accuracy is incorrect and should be recalculated" },
      { label: "B", text: "Aggregate accuracy can mask poor performance on specific segments; stratified evaluation across document types is necessary" },
      { label: "C", text: "Handwritten invoices should be excluded from the dataset" },
      { label: "D", text: "The model needs more training data to improve overall accuracy" }
    ],
    correctAnswer: "B",
    explanation: "Aggregate accuracy can mask poor performance on segments. A 95% overall accuracy that hides 60% accuracy on handwritten invoices means those documents are being processed unreliably. Stratified random sampling across document types reveals these segment-specific weaknesses. The aggregate isn't wrong (option A); it's misleading. Excluding handwritten invoices (option C) ignores the problem. More training data (option D) may help but doesn't address the evaluation gap."
  },
  {
    id: 145,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5",
    question: "A data extraction system provides field-level confidence scores (e.g., 'vendor_name: 0.95, tax_amount: 0.45'). How should these scores be used in a human review workflow?",
    options: [
      { label: "A", text: "Only display the highest confidence fields to speed up human review" },
      { label: "B", text: "Route documents with any field below a calibrated confidence threshold to human review, while auto-approving fully high-confidence documents" },
      { label: "C", text: "Ignore confidence scores and randomly sample for human review" },
      { label: "D", text: "Use confidence scores to weight the importance of fields in the output" }
    ],
    correctAnswer: "B",
    explanation: "Field-level confidence scores enable targeted human review: documents where all fields are high-confidence can be auto-approved, while those with low-confidence fields are routed to human reviewers who can focus on the uncertain fields. Showing only high-confidence (option A) hides problems. Random sampling (option C) wastes reviewer time on correct extractions. Weighting by confidence (option D) misuses the scores."
  },
  {
    id: 146,
    domain: 5,
    scenario: 6,
    taskStatement: "5.5",
    question: "A team deploys confidence scores for their extraction system, but reviewers notice that items marked '0.9 confidence' are correct only 70% of the time. What is the problem and solution?",
    options: [
      { label: "A", text: "The model is overconfident; lower all scores by 20%" },
      { label: "B", text: "The confidence scores are not calibrated; they should be calibrated using a validation set where predicted confidence is compared against actual accuracy" },
      { label: "C", text: "Confidence scores above 0.85 should be treated as unreliable" },
      { label: "D", text: "Switch to a different model with better calibration" }
    ],
    correctAnswer: "B",
    explanation: "Confidence scores must be calibrated so that a 0.9 score actually corresponds to ~90% accuracy. Calibration uses a validation set to measure the relationship between predicted confidence and actual accuracy, then adjusts accordingly. Simple offset (option A) doesn't account for non-linear miscalibration. Treating high scores as unreliable (option C) loses the benefit. Switching models (option D) may not solve the calibration issue."
  },
  {
    id: 147,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6",
    question: "A research synthesis agent combines information from multiple sources. The web search subagent finds that 'Market X grew 15% in 2025' while the document analysis subagent finds a report stating 'Market X grew 8% in 2025.' How should the synthesis agent handle this conflict?",
    options: [
      { label: "A", text: "Use the higher figure since it likely represents a more optimistic forecast" },
      { label: "B", text: "Average the two figures and report 11.5% growth" },
      { label: "C", text: "Annotate the conflict explicitly: present both figures with their sources, noting the discrepancy for the reader to evaluate" },
      { label: "D", text: "Use the figure from the more recent source" }
    ],
    correctAnswer: "C",
    explanation: "When conflicting statistics are found, the synthesis should annotate the conflict rather than arbitrarily selecting one value. Presenting both figures with source attribution allows the reader to evaluate the discrepancy. Choosing the higher (option A) or averaging (option B) fabricates false precision. Recency (option D) isn't always a reliable quality signal without more context."
  },
  {
    id: 148,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6",
    question: "A research agent synthesizes findings into a report. The team wants every claim in the report to be traceable to its source. What structure should the synthesis output maintain?",
    options: [
      { label: "A", text: "A bibliography at the end of the report" },
      { label: "B", text: "Claim-source mappings that preserve provenance: each claim is linked to its source, evidence, and confidence level" },
      { label: "C", text: "Footnotes with URLs for each paragraph" },
      { label: "D", text: "A summary section listing all sources consulted" }
    ],
    correctAnswer: "B",
    explanation: "Claim-source mappings must be preserved as structured intermediates: each claim linked to its specific evidence, source document, and confidence level. This enables verification and trust. A bibliography (option A) lists sources but doesn't map specific claims. Footnotes (option C) and source lists (option D) provide weaker provenance than structured claim-level mappings."
  },
  {
    id: 149,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6",
    question: "A research agent finds statistical data from multiple sources but none of the sources include publication dates. The team uses this data in a market analysis. What risk does this introduce?",
    options: [
      { label: "A", text: "No risk, as statistical data doesn't change significantly over time" },
      { label: "B", text: "The data may be outdated, leading to incorrect conclusions; temporal data should require publication dates to be included for proper context" },
      { label: "C", text: "The risk is minimal if the sources are reputable" },
      { label: "D", text: "This only matters for financial data, not general statistics" }
    ],
    correctAnswer: "B",
    explanation: "Temporal data requires publication dates for proper context. Market statistics from 2020 vs 2025 could tell completely different stories. Without dates, the synthesis may combine current and outdated data, leading to incorrect conclusions. Statistics do change over time (option A). Source reputation (option C) doesn't eliminate temporal validity concerns. All statistical data has temporal relevance (option D)."
  },
  {
    id: 150,
    domain: 5,
    scenario: 3,
    taskStatement: "5.6",
    question: "A multi-agent research system needs to pass findings between subagents. What intermediate data structure best preserves information provenance?",
    options: [
      { label: "A", text: "Plain text summaries passed between agents" },
      { label: "B", text: "Structured intermediates containing: claim, supporting evidence, source identifier, and confidence score for each finding" },
      { label: "C", text: "JSON arrays of URLs that were consulted" },
      { label: "D", text: "A shared vector database that agents can query" }
    ],
    correctAnswer: "B",
    explanation: "Structured intermediates with claim, evidence, source, and confidence fields preserve full provenance as data moves between agents. Plain text (option A) loses structure and provenance. URL lists (option C) don't capture extracted claims or evidence. Vector databases (option D) are useful for retrieval but don't inherently maintain claim-level provenance."
  },
];
