# Building with the Claude API - Study Notes & Quiz

---

## Anthropic Overview

### Lesson 1: Overview of Claude Models

**Three model families optimized for different priorities:**

| Model | Strength | Trade-off | Best for |
|-------|----------|-----------|----------|
| **Opus** | Highest intelligence | Higher cost and latency | Complex, multi-step tasks requiring deep reasoning and planning |
| **Sonnet** | Balanced intelligence, speed, cost | Middle ground | Most practical use cases, strong coding abilities |
| **Haiku** | Fastest, cheapest | No reasoning capabilities like Opus/Sonnet | Real-time user interactions, high-volume processing |

**Selection framework:** Intelligence priority → Opus. Speed priority → Haiku. Balanced requirements → Sonnet.

**Key insight:** Use multiple models in the same application based on specific task requirements rather than picking a single model. All models share core capabilities (text generation, coding, image analysis) — the main difference is optimization focus.

---

## Accessing Claude with the API

### Lesson 2: Accessing the API

**API Access Flow = 5-step process:**

1. **Client → Developer's server** — never access Anthropic API directly from client apps (keep API key secret)
2. **Server → Anthropic API** using SDK (Python, TypeScript, JavaScript, Go, Ruby) or plain HTTP. Required params: API key + model name + messages list + max_tokens
3. **Text generation** has 4 stages:
   - **Tokenization** — breaking input into tokens (words/word parts/symbols/spaces)
   - **Embedding** — converting tokens to number lists representing all possible word meanings
   - **Contextualization** — adjusting embeddings based on neighboring tokens to determine precise meaning
   - **Generation** — output layer produces probabilities for next word, selects using probability + randomness, repeats
4. **Stop condition** — max_tokens reached OR special `end_of_sequence` token generated
5. **Response** — API returns generated text + usage counts + stop_reason to server, server sends to client

**Key terms:** Token = text chunk. Embedding = numerical representation of word meanings. Contextualization = meaning refinement using neighboring words. Max_tokens = generation length limit. Stop_reason = why model stopped generating.

---

### Lesson 3: Making a Request

**Setup steps:**
1. Install packages: `pip install anthropic python-dotenv`
2. Store API key in `.env` file with `ANTHROPIC_API_KEY="your_key"` (ignore in version control)
3. Load environment variable with `python-dotenv`
4. Create client and define model variable

**API request structure:**
- Function: `client.messages.create()`
- Required arguments: `model`, `max_tokens`, `messages`
- `max_tokens` = safety limit for generation length (not target length)
- Messages = list of dicts with `role` and `content`

**Message types:**
- User message: `{"role": "user", "content": "your text"}`
- Assistant message: contains model-generated responses

**Extracting text:** `message.content[0].text`

---

### Lesson 4: Multi-Turn Conversations

**Key limitation:** Anthropic API stores NO messages. Each request is independent with no memory.

**Solution:** Manually maintain message list in code and send entire conversation history with every follow-up request.

**Conversation flow:**
1. Send initial user message
2. Receive assistant response
3. Append assistant response to message history
4. Add new user message to history
5. Send complete history for context-aware follow-up

**Helper functions needed:**
- `add_user_message(messages, text)` — appends user message to history
- `add_assistant_message(messages, text)` — appends assistant response to history
- `chat(messages)` — sends message history to API and returns response

**Without message history = no context/continuity. With complete history = Claude maintains conversation context.**

---

### Lesson 5: System Prompts

**Definition:** Technique to customize Claude's response style and tone by assigning a specific role or behavior pattern.

**Implementation:** Pass system prompt as plain string using `system` keyword argument.

**Purpose:** Control *how* Claude responds rather than *what* it responds. Same question gets different treatment based on assigned role.

**Structure:** First line assigns role ("You are a patient math tutor"), followed by specific behavioral instructions.

**Technical detail:** Create params dictionary, conditionally add `system` key if prompt provided, pass params with `**` unpacking. Handle `None` case by excluding system parameter entirely.

---

### Lesson 6: Temperature

**Definition:** Parameter (0-1) that controls randomness in text generation by influencing token selection probabilities.

**Temperature effects:**
- **Temperature 0** = deterministic output, always selects highest probability token
- **Higher temperature** = increases chance of selecting lower probability tokens, more creative/unexpected outputs

**Usage guidelines:**
- Low temperature (near 0) = data extraction, factual tasks requiring consistency
- High temperature (near 1) = creative tasks like brainstorming, writing, jokes, marketing

**Key insight:** Temperature directly manipulates the probability distribution of next token selection.

---

### Lesson 7: Response Streaming

**Definition:** Display AI responses chunk-by-chunk as they're generated instead of waiting for complete response.

**Problem:** AI responses can take 10-30 seconds. Users expect immediate feedback.

**Event types:**
- `message_start` = initial acknowledgment
- `content_block_start` = text generation begins
- `content_block_delta` = contains actual text chunks (most important)
- `content_block_stop` / `message_stop` = generation complete

**Implementation:**
- Basic: `client.messages.create(stream=True)` returns event iterator
- Simplified: `client.messages.stream()` with `text_stream` property extracts just text
- Final message: `stream.get_final_message()` assembles all chunks for storage

---

### Lesson 8: Controlling Model Output

**Two techniques beyond prompt modification:**

**1. Pre-filling Assistant Messages:**
- Add assistant message at end of conversation to steer response direction
- Claude sees it as already authored content and continues from the exact endpoint
- Must stitch together pre-fill + generated response
- Example: Pre-fill "Coffee is better because" → Claude continues with justification

**2. Stop Sequences:**
- Force Claude to halt generation when specific string appears
- Provide `stop_sequence` string in chat function
- Generated stop sequence text NOT included in final output
- Example: Prompt "count 1 to 10" + stop sequence "five" → Output stops at "four, "

---

### Lesson 9: Structured Data

**Problem:** Claude automatically adds markdown formatting, headers, commentary when generating JSON/code.

**Solution pattern:**
1. User message = request for structured data
2. Assistant message prefill = opening delimiter (e.g., `` ```json ``)
3. Stop sequence = closing delimiter (e.g., `` ``` ``)

**How it works:** Claude sees prefilled message, assumes it already started response, generates only the requested content, stops when hitting delimiter.

**Result:** Raw structured data output with no extra formatting or commentary. Works for JSON, Python code, lists, etc.

---

## Prompt Evaluation

### Lesson 10: Prompt Evaluation

**Three paths after writing a prompt:**
1. Test once/twice, deploy to production (**trap**)
2. Test with custom inputs, minor tweaks for corner cases (**trap**)
3. Run through evaluation pipeline for objective scoring (**recommended**)

**Key takeaway:** Engineers commonly under-test prompts. Use evaluation pipelines to get objective performance scores.

---

### Lesson 11: A Typical Eval Workflow

**6-step iterative process:**

1. **Write initial prompt draft** — create baseline
2. **Create evaluation dataset** — collection of test inputs (3 examples or thousands, hand-written or LLM-generated)
3. **Generate prompt variations** — interpolate each dataset input into prompt template
4. **Get LLM responses** — feed each prompt variation to Claude, collect outputs
5. **Grade responses** — use grader system to score each response (e.g., 1-10 scale), average for overall score
6. **Iterate** — modify prompt based on scores, repeat, compare versions

**Key points:** No standard methodology exists. Many tools available. Can start simple. Objective scoring enables systematic A/B comparison.

---

### Lesson 12: Generating Test Datasets

**Dataset generation approaches:** Manual assembly or automated with Claude (use faster models like Haiku for generation).

**Dataset structure:** Array of JSON objects with `task` property describing user requests.

**Generation process:** Prompt Claude → pre-fill with `` ```json `` → stop sequence `` ``` `` → parse response as JSON → save to file.

---

### Lesson 13: Running the Eval

**Three core functions:**
- `run_prompt` = merges test case with prompt, sends to Claude, returns output
- `run_test_case` = calls run_prompt, grades result, returns summary dictionary
- `run_eval` = loops through dataset, calls run_test_case for each, assembles results

**Eval pipeline core:** dataset + prompt + LLM + grader, with minimal code complexity.

---

### Lesson 14: Model-Based Grading

**Three grader types:**

| Grader | How it works | Pros | Cons |
|--------|-------------|------|------|
| **Code graders** | Programmatic checks (length, syntax, readability) | Fast, consistent | Limited to measurable properties |
| **Model graders** | Additional API call to evaluate output | Highly flexible for quality assessment | May be inconsistent, adds cost |
| **Human graders** | Person evaluates responses | Most flexible | Time-consuming, tedious |

**Implementation for model graders:**
- Create detailed prompt requesting strengths/weaknesses/reasoning/score (not just score alone — avoids default middling scores)
- Use JSON response format with pre-filled assistant message and stop sequences
- Parse returned JSON for score and reasoning
- Calculate average scores across test cases

---

### Lesson 15: Code-Based Grading

**Core validators:**
- `validate_json()` — attempts JSON parsing, returns 10 if valid, 0 if error
- `validate_python()` — attempts AST parsing, returns 10 if valid, 0 if error
- `validate_regex()` — attempts regex compilation, returns 10 if valid, 0 if error

**Scoring system:** Final score = (model_score + syntax_score) / 2 — combines semantic evaluation with syntax validation.

**Dataset requirement:** Must include `format` key specifying expected output type.

---

## Prompt Engineering Techniques

### Lesson 16: Prompt Engineering Overview

**Module structure:** Start with initial poor prompt → Apply techniques step-by-step → Evaluate improvements after each technique → Observe performance gains.

**Key components:**
- `prompt_input_spec` = dictionary defining required prompt inputs
- `extra_criteria` = additional validation requirements for model grading
- `output.html` = formatted evaluation report

**Expect poor scores initially** (e.g., 2.32) with basic prompts. Scores improve as techniques are applied.

---

### Lesson 17: Being Clear and Direct

**Rule:** Use simple, direct language with action verbs in the first line.

**Structure:** Action verb + clear task description + output specifications.

**Examples:**
- "Write three paragraphs about how solar panels work"
- "Generate a one day meal plan for an athlete that meets their dietary restrictions"

**Result:** Score increase from 2.32 to 3.92 in example.

---

### Lesson 18: Being Specific

**Two types of guidelines:**

| Type | What it does | When to use |
|------|-------------|-------------|
| **Type A (Attributes)** | Lists qualities/attributes desired in output (length, structure, format) | Recommended for almost all prompts |
| **Type B (Steps)** | Provides specific steps for model to follow in reasoning | Complex problems where broader perspective needed |

**Both techniques often combined in professional prompts.**

**Example improvement:** Score jumped from 3.92 to 7.86 when guidelines added.

---

### Lesson 19: Structure with XML Tags

**Purpose:** Organize and delineate different content sections within prompts to improve AI comprehension.

**Implementation:** Wrap content sections in descriptive XML tags like `<sales_records>`, `<my_code>`, `<athlete_information>`.

**Tag naming:** Use descriptive, specific tag names — "sales_records" better than "data".

**Benefits:** Makes prompt structure obvious to AI, reduces confusion about content boundaries, improves output quality even for smaller content blocks.

---

### Lesson 20: Providing Examples (Few-Shot Prompting)

**One-shot = single example. Multi-shot = multiple examples.**

**Key applications:**
- Corner case handling (sarcasm detection, edge scenarios)
- Complex output formatting (JSON structures, specific formats)
- Clarifying expected response quality/style

**Best practices:**
- Add context for corner cases ("be especially careful with sarcasm")
- Include reasoning explaining why output is ideal
- Use highest-scoring examples from prompt evaluations as templates
- Place examples after main instructions/guidelines
- Wrap examples with XML tags to distinguish from actual prompt content

---

## Tool Use with Claude

### Lesson 21: Introducing Tool Use

**Default limitation:** Claude only knows information from training data, lacks current/real-time information.

**Tool use flow:**
1. Send initial request to Claude + instructions for external data access
2. Claude evaluates if external data needed, requests specific information
3. Server runs code to fetch requested data from external sources
4. Send follow-up request to Claude with retrieved data
5. Claude generates final response using original prompt + external data

**Key concept:** Tools enable Claude to augment responses with live/current information by orchestrating external data retrieval.

---

### Lesson 22: Tool Functions

**Characteristics:**
- Plain Python functions called by Claude when it determines additional data is needed
- Must use descriptive function names and argument names
- Should validate inputs and raise errors with meaningful messages
- Error messages are visible to Claude, allowing it to retry with corrected parameters

**Best practices:**
1. Well-named functions and arguments
2. Input validation with immediate error raising
3. Meaningful error messages that guide correction

---

### Lesson 23: Tool Schemas

**Definition:** JSON schema specifications that describe tool functions and their parameters for language models.

**Tool schema structure:**
- `name` — tool identifier
- `description` — 3-4 sentences explaining what tool does, when to use, what data it returns
- `input_schema` — actual JSON schema describing function arguments with types and descriptions

**Schema generation trick:** Take function to Claude.ai, prompt to write schema, attach Anthropic API docs.

**Implementation:** Name schemas as `[function_name]_schema`, wrap with `ToolParam()` from `anthropic.types` to prevent type errors.

---

### Lesson 24: Handling Message Blocks

**Content structure change:** Messages now contain multiple blocks (not just text).

**Tool response format:** Assistant message with:
- **Text block** = user-facing explanation
- **Tool use block** = function name + arguments for tool execution

**Critical requirement:** Manually maintain conversation history. Append entire `response.content` (all blocks) to messages list, not just text.

---

### Lesson 25: Sending Tool Results

**Tool result block structure:**
- `tool_use_id` = matches ID from original tool use block (pairs requests with results)
- `content` = tool function output converted to string (usually JSON)
- `is_error` = boolean flag for function execution errors (default false)

**Follow-up request requirements:**
- Include complete message history
- Must include original tool schemas even if not using tools again
- Tool result block goes in **user message**, not assistant message

**Conversation flow:** User request → Claude assistant response (text + tool use blocks) → Server executes tool → User message with tool result block → Claude final response.

---

### Lesson 26: Multi-Turn Conversations with Tools

**Tool chaining:** User asks question → Claude requests first tool → result returned → Claude requests second tool → result returned → Claude provides final answer.

**Implementation:** `while` loop that continues calling Claude until no more tool requests, checking each response for `tool_use` blocks.

**Key insight:** Can't predict how many tools user queries will require — system must handle arbitrary chains automatically.

---

### Lesson 27: Implementing Multiple Turns

**Stop reason field:**
- `stop_reason = "tool_use"` means Claude wants to call a tool
- Other values exist but `tool_use` is most commonly checked

**`run_conversation` function:**
1. Call Claude with messages + available tools
2. Add assistant response to conversation history
3. Check `stop_reason` — if not "tool_use", break loop
4. If tool_use, call `run_tools` function
5. Add tool results as user message
6. Repeat until no more tool requests

**`run_tools` function:**
1. Filter `message.content` for blocks with `type="tool_use"`
2. Execute appropriate tool function via `run_tool` dispatcher
3. Create `tool_result` blocks with: `type`, `tool_use_id`, `content` (JSON-encoded), `is_error`
4. Return list of all tool result blocks

**Error handling:** try/except around tool execution — Success: `is_error=false`. Failure: `is_error=true, content=error_message`.

---

### Lesson 28: Using Multiple Tools

**Process = 3 steps:**
1. Add tool schemas to `run_conversation`'s tools list
2. Add conditional cases in `run_tool` to handle new tool names
3. Implement actual tool functions

**Tool chaining:** AI can use multiple tools sequentially in a single conversation.

**Scalability:** After initial framework setup, adding new tools = simple pattern of schema + routing + implementation.

---

### Lesson 29: Fine-Grained Tool Calling

**Tool streaming:** Standard streaming returns `content_block_delta` events. Tool streaming adds `input_json_delta` events with `partial_json` (chunk) and `snapshot` (cumulative sum).

**Default behavior:** API buffers chunks until complete top-level key-value pair is generated, validates JSON against schema, results in delays then burst.

**Fine-grained mode (`fine_grained: true`):**
- Disables API-side JSON validation
- Sends chunks immediately as generated
- Requires client-side error handling for invalid JSON

**Trade-offs:** Default = slower but validated. Fine-grained = faster streaming but potential invalid JSON.

---

### Lesson 30: The Batch Tool

**Problem:** Claude can technically send multiple tool use blocks in one message but rarely does so.

**Solution:** Create batch tool schema that takes list of invocations (each containing tool name + arguments).

**Result:** Single request-response cycle instead of multiple sequential rounds for parallel-executable tasks. Tricks Claude into parallel tool execution.

---

### Lesson 31: Tools for Structured Data

**Alternative to pre-fill/stop sequences:** Use tool system to extract structured JSON.

**Key differences:** More reliable output, more complex setup, requires JSON schema.

**Critical requirement — force tool calling:** `tool_choice = {"type": "tool", "name": "your_tool_name"}` ensures Claude always calls specified tool.

**Access structured data:** `response.content[0].input`

**When to use:** Reliability > simplicity → tools. Quick/simple → pre-fill method.

---

### Lesson 32: The Text Editor Tool

**Definition:** Built-in Claude tool for file/text operations (read, write, create, replace, undo).

**Key characteristics:**
- Only JSON schema built into Claude — implementation must be custom-coded
- Schema stub sent to Claude gets auto-expanded to full schema
- Schema type string varies by Claude model version

**Workflow:** Send minimal schema stub → Claude expands internally → Claude sends tool use requests → Custom implementation executes file operations → Results sent back.

---

### Lesson 33: The Web Search Tool

**Implementation:** No custom code needed — Claude handles search execution automatically.

**Schema requirements:**
- `type: "web_search_20250305"`
- `name: "web_search"`
- `max_uses`: number (limits total searches, default 5)
- `allowed_domains`: optional list to restrict search to specific domains

**Response structure:** Text blocks + Tool use blocks (search queries) + Web search result blocks (title, URL) + Citation blocks (specific text supporting statements).

---

## RAG and Agentic Search

### Lesson 34: Introducing RAG

**Problem:** How to extract specific information from large documents (100-1000+ pages) using Claude without hitting context limits.

**Option 1 (Direct approach):** Place entire document in prompt.
- Limitations: Hard token limits, decreased effectiveness with longer prompts, higher costs, slower

**Option 2 (RAG approach):** Two-step process:
1. Break document into small chunks
2. For user questions, find most relevant chunks and include only those in prompt

**RAG benefits:** Focuses on relevant content, scales to large/multiple documents, smaller prompts, lower costs.

**RAG downsides:** More complexity, requires preprocessing, needs search mechanism, no guarantee chunks contain complete context.

---

### Lesson 35: Text Chunking Strategies

**Three main strategies:**

| Strategy | How it works | Pros | Cons |
|----------|-------------|------|------|
| **Size-based** | Divide into equal-length strings | Easy, most common in production | Cut-off words, lacks context |
| **Structure-based** | Divide on document structure (headers, paragraphs) | Best for structured docs (markdown, HTML) | Requires guaranteed formatting |
| **Semantic-based** | NLP to group related sentences | Most advanced, best results | Complex implementation |

**Size-based overlap:** Include characters from neighboring chunks to preserve context. Creates duplication but improves chunk meaning.

**Rule:** No universal best method — depends on document structure guarantees and use case.

---

### Lesson 36: Text Embeddings

**Definition:** Numerical representation of text meaning generated by embedding models. Output = long list of numbers (range -1 to +1).

**Semantic search:** Uses embeddings to find text chunks related to user questions in RAG pipelines.

**RAG pipeline process:** Extract text chunks → user submits query → find related chunks using semantic search → add relevant chunks as context to prompt.

**Implementation:** Anthropic recommends Voyage AI for embedding generation. Requires separate account/API key. Free to start.

**Key insight:** Embeddings enable semantic similarity matching rather than keyword matching.

---

### Lesson 37: The Full RAG Flow

**7-step process:**

1. **Text chunking** — split source documents into pieces
2. **Generate embeddings** — convert chunks to numerical vectors
3. **Normalization** — scale vector magnitudes to 1.0 (handled automatically by APIs)
4. **Vector database storage** — store embeddings in specialized DB
5. **Query processing** — convert user question into embedding using same model
6. **Similarity search** — find most similar stored embeddings using cosine similarity
7. **Prompt assembly** — combine user question with retrieved chunks, send to LLM

**Key math:**
- **Cosine similarity** = cosine of angle between vectors, -1 to 1, closer to 1 = more similar
- **Cosine distance** = 1 - cosine similarity, closer to 0 = higher similarity

**Process flow:** Pre-processing (steps 1-4) → User Query → Real-time retrieval (steps 5-7) → LLM Response

---

### Lesson 38: Implementing the RAG Flow

**5-step practical walkthrough:**
1. Text chunking with `chunk_by_section` function
2. Embedding generation with `generate_embedding` function
3. Vector store population — loop through chunk-embedding pairs using `zip()`, store with `store.add_vector(embedding, {content: chunk})`
4. Query processing — generate embedding for user query
5. Similarity search — `store.search(user_embedding, 2)` returns N most relevant chunks with cosine distances

**Key:** Store original text content alongside embeddings for meaningful retrieval.

---

### Lesson 39: BM25 Lexical Search

**Definition:** Best Match 25 — lexical search algorithm complementing semantic search in RAG pipelines.

**Problem with semantic search alone:** Can miss exact term matches.

**BM25 algorithm steps:**
1. Tokenize user query into terms
2. Count frequency of each term across all chunks
3. Assign importance based on frequency (rare terms = higher importance)
4. Rank chunks by weighted term frequency

**Hybrid search:** Combines semantic search (embeddings) + lexical search (BM25) in parallel, then merges results.

---

### Lesson 40: Multi-Index RAG Pipeline

**Components:** Vector Index (semantic) + BM25 Index (lexical) + Retriever Class (merges results).

**Reciprocal Rank Fusion (RRF):** Technique for merging results from different indexes.
- Formula: `RRF_score = sum of (1/(rank + 1))` across all search methods for each document
- Documents ranked by highest combined score

**Example:** Vector returns [doc2, doc7, doc6], BM25 returns [doc6, doc2, doc7]. After RRF → [doc2, doc6, doc7].

---

### Lesson 41: Reranking Results

**Definition:** Post-processing step using LLM to reorder search results by relevance after initial retrieval.

**Process:** Run vector + BM25 search → merge results → pass to LLM to rank by relevance → get reordered results.

**Trade-offs:** Increases accuracy but increases latency due to additional LLM call.

---

### Lesson 42: Contextual Retrieval

**Problem:** When documents are split into chunks, individual chunks lose context from the original document.

**Solution:** Pre-processing step that adds contextual information to each chunk before embedding.

**Process:**
1. Take chunk + original source document
2. Send to LLM asking to generate situating context
3. Join generated context with original chunk = "contextualized chunk"
4. Use contextualized chunk as input to vector/BM25 indexes

**Large document handling:** Include starter chunks (1-3) from document beginning + chunks immediately before target chunk for local context. Skip middle chunks.

---

## Features of Claude

### Lesson 43: Extended Thinking

**Definition:** Claude feature allowing reasoning time before generating final response.

**Key mechanics:**
- Displays separate thinking process visible to users
- Increases accuracy for complex tasks but adds cost (charged for thinking tokens) and latency
- Thinking budget = minimum 1024 tokens
- `max_tokens` must exceed thinking budget

**When to use:** Enable after prompt optimization fails to achieve desired accuracy.

**Response structure:**
- **Thinking block** = reasoning text + cryptographic signature (prevents tampering)
- **Text block** = final response
- **Redacted thinking blocks** = encrypted thinking flagged by safety systems, provided for conversation continuity

**Implementation:** Set `thinking=true` and `thinking_budget` parameter. Ensure `max_tokens > thinking_budget`.

---

### Lesson 44: Image Support

**Capabilities:** Process images within user messages for analysis, comparison, counting, description.

**Limitations:** Max 100 images per request. Size/dimension restrictions apply. Images consume tokens.

**Image block structure:** Special block type holding either base64 data or URL reference. Multiple blocks allowed per message.

**Critical success factor:** Strong prompting techniques required for accurate results. Simple prompts often fail.

**Prompting techniques:** Step-by-step analysis instructions, few-shot examples, clear guidelines, structured analysis frameworks.

**Implementation:** Base64 encode image data, create message with image block (`type: image, source: base64, media_type, data`) + text block with instructions.

---

### Lesson 45: PDF Support

**Claude can read PDF files directly:**
- File type = `"document"` instead of `"image"`
- Media type = `"application/pdf"` instead of `"image/png"`
- Capabilities: read text + images + charts + tables + mixed content

---

### Lesson 46: Citations

**Definition:** Feature allowing Claude to reference source documents and show where information comes from.

**Citation types:**
- `citation_page_location` — for PDFs: document index, title, start/end page, cited text
- `citation_char_location` — for plain text: character position in text block

**Implementation:** Add `"citations": {"enabled": true}` to request. Add `"title"` field to identify source document.

**Purpose:** Transparency for users to verify Claude's information sources and check accuracy.

---

### Lesson 47: Prompt Caching

**Normal flow:** Process input → generate output → discard all processing work → next request.

**Problem:** Follow-up requests with identical input must repeat all computational work.

**Solution:** Store results of input processing in temporary cache. Subsequent identical inputs retrieve cached work.

---

### Lesson 48: Rules of Prompt Caching

**Cache duration:** 1 hour maximum.

**Cache activation:** Requires manual cache breakpoint addition to message blocks.

**Text block formats:**
- Shorthand: `content = "text string"` (cannot add cache control)
- Longhand: `content = [{"type": "text", "text": "content", "cache_control": {...}}]` (required for caching)

**Key rules:**
- Cache scope = all content up to and including breakpoint gets cached
- Any change before breakpoint invalidates entire cache
- Content processing order: **tools → system prompt → messages**
- Maximum 4 breakpoints per request
- Minimum 1024 tokens required for content to be cached
- Multiple breakpoints = multiple cache layers, partial hits possible

**Best use cases:** Repeated identical content (system prompts, tool definitions, static message prefixes).

---

### Lesson 49: Prompt Caching in Action

**Tool schema caching:** Add `cache_control` field with `type: "ephemeral"` to last tool in list. Best practice: clone tool list to avoid modifying originals.

**System prompt caching:** Wrap system prompt in text block dict with `cache_control type: "ephemeral"`.

**Cache order:** tools → system prompt → messages.

**Token usage patterns:**
- `cache_creation_input_tokens` = tokens written to cache on first use
- `cache_read_input_tokens` = tokens retrieved from cache on subsequent requests
- Partial cache reads possible when some content matches

**Cache invalidation:** Any change to cached content forces new cache creation.

---

### Lesson 50: Code Execution and the Files API

**Files API:** Upload files ahead of time, reference via file ID instead of including raw data in each request.

**Code Execution:** Server-based tool where Claude executes Python code in isolated Docker containers. No implementation needed — just include predefined tool schema.

**Key constraints:** Docker containers have no network access. Data I/O relies on Files API.

**Combined workflow:** Upload file → get file ID → include in container upload block → Claude writes/executes code → returns analysis and results.

**Claude can generate files** (plots, reports) inside container, downloadable via file IDs.

---

## Model Context Protocol

### Lesson 51: Introducing MCP

**Definition:** Communication layer providing Claude with context and tools without requiring developers to write tedious code.

**Architecture:** MCP client → MCP server. Server contains tools, resources, and prompts.

**Problem solved:** Eliminates burden of authoring/maintaining tool schemas and functions for service integrations.

**Key benefits:** Shifts integration burden from application developers to MCP server maintainers.

**Common questions:**
- Who creates servers? Anyone — often service providers make official implementations
- vs direct API calls? MCP eliminates need to author schemas/functions yourself
- vs tool use? Complementary — MCP handles WHO does the work, both still involve tools

---

### Lesson 52: MCP Clients

**Definition:** Communication interface between your server and MCP server, provides access to server's tools.

**Transport agnostic:** Client/server can communicate via multiple protocols (stdio, HTTP, WebSockets).

**Key message types:**
- `list tools request/result` — discover available tools
- `call tool request/result` — execute a tool

**Typical flow:** User → Server → MCP Client → MCP Server → executes tool (e.g., API call) → results flow back through chain → Claude → user.

---

### Lesson 53: Defining Tools with MCP

**MCP Python SDK:** Auto-generates tool JSON schemas from Python function definitions using `@mcp.tool` decorator.

**Syntax:** `@mcp.tool(name="tool_name", description="description")` + function with typed parameters using `Field()` for argument descriptions.

**Key advantage:** SDK eliminates manual JSON schema writing. Generates schemas automatically from function signatures and decorators.

---

### Lesson 54: The Server Inspector

**Definition:** In-browser debugger for testing MCP servers without connecting to applications.

**Access:** `mcp dev [server_file.py]` → opens in browser.

**Testing workflow:** Connect → navigate to tools → select tool → input parameters → run → verify output.

---

### Lesson 55: Implementing a Client

**MCP Client = wrapper class** around client session for resource cleanup and connection management.

**Key functions:**
- `list_tools()` = `await self.session.list_tools()`, return `result.tools`
- `call_tool()` = `await self.session.call_tool(tool_name, tool_input)`

**Common pattern:** Wrap client session in larger class for resource management rather than use session directly.

---

### Lesson 56: Defining Resources

**Two resource types:**
- **Direct** (static URI like `"docs://documents"`)
- **Templated** (parameterized URI like `"docs://documents/{doc_id}"`)

**Implementation:** `@mcp.resource` decorator with URI and MIME type parameters.

**Resources vs Tools:** Resources provide data proactively (fetch when referenced). Tools perform actions reactively (when Claude decides to call them).

**MIME types:** `application/json` for structured data, `text/plain` for plain text.

---

### Lesson 57: Accessing Resources

**Implementation:**
- Call `await self.session.read_resource(AnyURL(uri))`
- Extract from `result.contents[0]`
- Parse based on `mime_type`: JSON → `json.loads()`, otherwise → plain text

---

### Lesson 58: Defining Prompts

**Definition:** Pre-defined, tested prompt templates that MCP servers expose to client applications.

**Purpose:** Server authors create high-quality, evaluated prompts tailored to their server's domain instead of users writing ad-hoc prompts.

**Implementation:** `@mcpserver.prompt` decorator with name/description. Function returns list of messages (user/assistant).

**Client integration:** Prompts appear as autocomplete options (slash commands) in client applications.

---

### Lesson 59: Prompts in the Client

**Functions:**
- `list_prompts()` = `await self.session.list_prompts()`, return `result.prompts`
- `get_prompt()` = `await self.session.get_prompt(prompt_name, arguments)`, return `result.messages`

**Key concept:** Arguments flow from client call → prompt function → interpolated prompt text → LLM consumption.

---

## Anthropic Apps — Claude Code and Computer Use

### Lesson 60: Claude Code Setup

**Core capabilities:** Search/read/edit files + advanced tools (web fetching, terminal access) + MCP client support.

**Setup:** Install Node.js → `npm install` Claude Code → run `claude` command → login.

---

### Lesson 61: Claude Code in Action

**Key capabilities:** Project setup, feature design, code writing, testing, deployment, error fixing.

**`init` command:** Claude scans codebase for architecture/coding style, creates `claude.md` file (automatically included context for future requests).

**Memory types:** Project (shared), Local, User memory files.

**Effective prompting strategies:**

**Method 1 — Three-step workflow:**
1. Identify relevant files, ask Claude to analyze
2. Describe feature, ask Claude to plan solution (no code yet)
3. Ask Claude to implement the plan

**Method 2 — Test-driven development:**
1. Provide relevant context
2. Ask Claude to suggest tests
3. Select and implement chosen tests
4. Ask Claude to write code until tests pass

**Core principle:** Claude Code = effort multiplier. More detailed instructions = significantly better results. Treat as collaborative engineer.

---

### Lesson 62: Enhancements with MCP Servers

**MCP integration command:** `claude mcp add [server-name] [startup-command]`

**Common use cases:** Production monitoring (Sentry), project management (Jira), communication (Slack), custom workflow tools.

**Setup:** Create MCP server with tools → add to Claude Code → restart → access new capabilities.

---

### Lesson 63: Parallelizing Claude Code

**Problem:** Multiple Claude instances modifying same files creates conflicts.

**Solution:** Git work trees — isolated workspaces per Claude instance.

**Workflow:** Create work tree → assign task → work in isolation → commit → merge back to main.

**Custom commands:** `.claude/commands/filename.md` with `$ARGUMENTS` placeholder for dynamic values.

---

### Lesson 64: Automated Debugging

**Workflow:**
1. GitHub Action runs daily to check production environment
2. Fetches CloudWatch logs from last 24 hours
3. Claude identifies errors, deduplicates them
4. Claude analyzes each error and generates fixes
5. Creates pull request with proposed solutions

---

### Lesson 65: Computer Use

**Definition:** Claude's ability to interact with computer interfaces through visual observation and control actions.

**How it works:** Runs in isolated Docker container. Takes screenshots, clicks buttons, types text, navigates interfaces.

**Key implementation:** Computer use = tool system + developer-provided computing environment. Claude doesn't directly manipulate computers — it sends tool use requests, Docker container handles actual interactions.

**Anthropic provides reference implementation** (Docker container with pre-built mouse/keyboard execution code).

---

## Agents and Workflows

### Lesson 66: Agents and Workflows

**Decision rule:** Use workflows when you have precise task understanding and know exact steps. Use agents when task details are unclear.

**Workflow = predetermined steps.** Example: Image to 3D model converter (describe image → model → render → compare → iterate).

**Evaluator-optimizer pattern:**
- Producer = generates output
- Evaluator = assesses quality
- Loop continues until evaluator accepts

---

### Lesson 67: Parallelization Workflows

**Definition:** Breaking one complex task into multiple simultaneous subtasks, then aggregating results.

**Structure:** Input → Multiple parallel subtasks → Aggregator → Final output.

**Benefits:** Focus (each subtask handles one analysis), Modularity (improve separately), Scalability (easy to add), Quality (reduces confusion from complex single prompts).

---

### Lesson 68: Chaining Workflows

**Definition:** Breaking large tasks into a series of distinct sequential steps rather than a single complex prompt.

**Primary use case:** When Claude consistently ignores constraints in complex prompts despite repetition.

**Solution:** Step 1 — Send initial prompt, accept imperfect output. Step 2 — Follow-up asking Claude to rewrite based on violations found.

**Critical insight:** Even simple-seeming workflows become essential when dealing with constraint-heavy prompts.

---

### Lesson 69: Routing Workflows

**Definition:** Categorizes user input to determine appropriate processing pipeline.

**Flow:** User input → Claude categorizes → system routes to specialized pipeline with customized prompts/tools.

**Benefits:** Ensures output matches topic nature. Different topics get different tones and approaches.

---

### Lesson 70: Agents and Tools

**Key differences:** Workflows require predetermined steps. Agents dynamically plan using available tools.

**Tool abstraction principle:** Provide generic/abstract tools rather than hyper-specialized ones. Claude Code uses bash, web_fetch, file_write (abstract) rather than refactor_tool, install_dependencies (specialized).

**Design approach:** Give agent abstract tools that can be pieced together — enables dynamic problem-solving and unexpected use cases.

---

### Lesson 71: Environment Inspection

**Definition:** Agents evaluating their environment and action results to understand progress and handle errors.

**Examples:**
- Computer use: Claude takes screenshot after every action to see how environment changed
- Code editing: Read current file contents before modifying

**Key benefit:** Enables agents to gauge progress, detect errors, and adapt to unexpected results rather than operating blindly.

---

### Lesson 72: Workflows vs Agents

| Dimension | Workflows | Agents |
|-----------|-----------|--------|
| **Task division** | Break into smaller specific subtasks | Handle varied challenges creatively |
| **Testing** | Easier — known execution sequence | Harder — unpredictable path |
| **User experience** | Require specific inputs | Create own inputs, can request more |
| **Success rates** | Higher completion rates | Lower — delegated complexity |

**Recommendation:** Prioritize workflows for reliability. Use agents only when flexibility truly required. Users want 100% working products over fancy agents.

**Core principle:** Solve problems reliably first, innovation second.

---

## Course Section Quizzes (from Anthropic Academy)

*All quizzes taken and passed with 100% scores. Correct answers marked with **bold**.*

---

### Quiz 1: Accessing Claude with the API (8 questions)

**Q1.** You want to send a request to Claude's API. What's the minimum information you must include?
- A) Only the API key and your question
- B) Just your message text
- **C) API key, model name, messages, and max tokens**
- D) Your name, email, and message

**Q2.** You ask Claude "What is pizza?" and it answers. Then you ask "What toppings are popular?" but Claude doesn't understand what you're referring to. What's the problem?
- A) Your internet connection is slow
- B) Claude is broken
- C) You asked too quickly
- **D) Claude doesn't remember previous messages**

**Q3.** When Claude processes your text, what's the first thing it does?
- A) Generates a response immediately
- B) Checks if it's appropriate content
- **C) Breaks it into smaller chunks called tokens**
- D) Translates it to another language

**Q4.** Users complain your chat app feels slow because they wait 20 seconds staring at a loading spinner, then all the generated text appears at once. What can fix this?
- A) Asking shorter questions
- B) Using a faster internet connection
- **C) Enabling response streaming**
- D) Using a different web browser

**Q5.** You're building a web app that talks to Claude. Where should you store your API key?
- A) In your mobile app that users install
- B) In a text file on the user's computer
- **C) On your server that users can't access**
- D) In your JavaScript code that users download

**Q6.** You're building a math tutor bot. You want Claude to give hints instead of direct answers. What should you use?
- A) Setting a very low word limit
- B) Using all capital letters in your messages
- **C) A system prompt explaining the tutor role**
- D) Asking users to be more specific

**Q7.** You want Claude to give very predictable, consistent answers for a factual Q&A app. What temperature setting should you use?
- A) Temperature doesn't matter for facts
- **B) Low temperature (near 0.0)**
- C) Medium temperature (around 0.5)
- D) High temperature (near 1.0)

**Q8.** You're building an app that needs clean JSON from Claude with no extra text or formatting. How do you get just the raw JSON?
- A) Send the request multiple times and pick the best one
- B) Ask Claude very nicely to only return JSON
- **C) Combine prefilled messages and stop sequences**
- D) Use a very high temperature setting

---

### Quiz 2: Prompt Evaluation (6 questions)

**Q1.** You wrote a prompt and tested it once. It worked fine, so you deployed it to production. What's the main risk with this approach?
- **A) Users will provide unexpected inputs that break it**
- B) The prompt will become too expensive
- C) The prompt will work too slowly
- D) Other developers won't understand it

**Q2.** You need test cases for your prompt evaluation. You have two options: write them by hand or use Claude to generate them. Which model should you use for generation?
- A) The most expensive model available
- B) Multiple models combined
- **C) A faster model like Haiku**
- D) The same model you're testing

**Q3.** You're running a prompt evaluation workflow. You've used Claude to generate some responses. What's the next step?
- A) Deploy to production
- B) Rewrite the original prompt
- C) Create more test questions
- **D) Feed the responses through a grader**

**Q4.** You want to measure how well your prompts actually work in practice. Which approach should you focus on?
- A) Using more examples
- B) Prompt engineering techniques
- C) Writing longer prompts
- **D) Prompt evaluation methods**

**Q5.** You're using a model grader to evaluate responses. To get better scores than just middle-range numbers, what should you ask for alongside the score?
- A) Just the numerical score
- B) Comparison to other responses
- **C) Strengths, weaknesses, and reasoning**
- D) A longer explanation

**Q6.** Which type of grader uses another AI model to assess the quality of outputs?
- **A) Model grader**
- B) Human grader
- C) Syntax grader
- D) Code grader

---

### Quiz 3: Prompt Engineering Techniques (5 questions)

**Q1.** You want Claude to create a workout plan. Which opening line works better?
- **A) "Create a 30-minute workout plan for beginners"**
- B) "Do you know anything about exercise?"
- C) "I was wondering about workouts and fitness stuff"
- D) "What kind of workout should I do?"

**Q2.** Claude keeps missing sarcastic comments when analyzing social media posts. What's the best way to fix this?
- A) Ask it to guess when something might be sarcastic
- **B) Provide examples showing sarcastic posts labeled as negative**
- C) Tell it to "be more careful about sarcasm"
- D) Make the prompt longer with more instructions

**Q3.** What is prompt engineering?
- A) Training AI models on new datasets
- **B) Improving a prompt to get more reliable, higher-quality outputs**
- C) Programming AI models from scratch using code
- D) Building the hardware infrastructure for AI systems

**Q4.** "Providing sample input/output pairs to guide AI responses" describes which prompt engineering technique?
- A) Being clear and direct
- B) Iterative refinement
- C) XML structuring
- **D) One-shot or multi-shot prompting**

**Q5.** What is the main purpose of using XML tags in prompts?
- A) To reduce the token count of prompts
- B) To increase the processing speed of AI models
- **C) To add structure and clarity, especially when including large amounts of content**
- D) To make prompts look more professional

---

### Quiz 4: Tool Use with Claude (7 questions)

**Q1.** How can you tell if Claude wants to make another tool call in a conversation?
- A) Check if the response contains the word "tool"
- B) Check if the response is longer than usual
- **C) Look at the stop_reason field for "tool_use"**
- D) Count the number of message blocks

**Q2.** When Claude uses a tool, what type of message structure does it return?
- **A) Multi-block messages with text and tool use blocks**
- B) Simple text-only responses
- C) JSON data without any text
- D) Error messages only

**Q3.** What is the main purpose of a JSON schema when working with Claude tools?
- A) To format the final response for users
- **B) To tell Claude what arguments your function expects and how to use it**
- C) To store the results of tool function calls
- D) To encrypt data between Claude and your server

**Q4.** What problem does the batch tool solve?
- A) It makes tools run faster
- B) It translates tool results into different languages
- **C) It reduces the number of back-and-forth communications when multiple tools are needed**
- D) It automatically fixes errors in tool responses

**Q5.** What is the correct sequence of steps in the tool use workflow?
- **A) Initial Request → Tool Request → Data Retrieval → Final Response**
- B) Tool Request → Initial Request → Final Response → Data Retrieval
- C) Final Response → Initial Request → Tool Request → Data Retrieval
- D) Data Retrieval → Tool Request → Initial Request → Final Response

**Q6.** Claude can only access information from its training data by default. What allows Claude to get current, real-time information?
- A) Making educated guesses based on patterns
- B) Searching through its training data more carefully
- C) Asking the user to provide more details
- **D) Using tools to access external information**

**Q7.** What makes Claude's built-in text editor and web search tools different from custom tools?
- **A) Claude provides the schema, but you may still need to implement some functionality**
- B) They require special API keys
- C) They only work with specific file types
- D) They cost more to use

---

### Quiz 5: Features of Claude (7 questions)

**Q1.** What is the Files API used for?
- A) Scanning files for viruses and malware
- B) Compressing large files to reduce API costs
- C) Converting files between different formats automatically
- **D) Uploading files ahead of time and referencing them later instead of encoding them directly in messages**

**Q2.** You're making many requests with the same large system prompt. What feature would make your requests faster and cheaper?
- A) PDF processing
- B) Citations
- C) Extended thinking
- **D) Prompt caching**

**Q3.** What is the primary purpose of citations in Claude?
- **A) To create a clear trail from Claude's response back to specific parts of source documents**
- B) To compress large documents for faster processing
- C) To count the number of words in a document
- D) To automatically generate footnotes for academic papers

**Q4.** When Claude uses extended thinking, what two parts do you get in the response?
- **A) Reasoning process and final answer**
- B) Problem and solution
- C) Input and output
- D) Question and answer

**Q5.** You want Claude to analyze a PDF document. What's the main difference from sending an image?
- **A) Change the type to "document" and media_type to "application/pdf"**
- B) PDFs cost more to process
- C) You can only send text, not images in PDFs
- D) PDFs require special permission

**Q6.** What is a key limitation of Claude's Code Execution tool?
- A) It can only run JavaScript code
- **B) It has no network access and runs in an isolated Docker container**
- C) It requires users to provide their own execution environment
- D) It can only process text files

**Q7.** You want to cache your system prompt. What's the minimum requirement for caching to work?
- A) You must make at least 5 requests
- B) You must use extended thinking
- C) The content must be under 500 tokens
- **D) The content must be at least 1024 tokens long**

---

### Quiz 6: Model Context Protocol (6 questions)

**Q1.** You've created an MCP server and want to test your tools before connecting them to Claude. What's the best way to do this?
- A) Testing isn't needed for tools, Claude can figure out how to use them
- B) Connect to Claude immediately
- **C) Use the MCP Inspector in your browser**
- D) Test in production

**Q2.** You're building a document system where users can type @document_name to reference files. What MCP feature is best for exposing the document contents?
- A) Tools
- B) Clients
- C) Prompts
- **D) Resources**

**Q3.** Your MCP server and client need to communicate. What's the most common way they connect during development?
- A) Through a database
- B) Over the internet
- **C) Through standard input/output on the same machine**
- D) Using email

**Q4.** You're building a chatbot that needs to access GitHub data. What is the main benefit of using MCP instead of writing your own GitHub integration?
- A) MCP requires less memory
- **B) MCP handles the tool definitions and execution for you**
- C) MCP only works with GitHub
- D) MCP makes your chatbot run faster

**Q5.** You want to create a tool for your MCP server that reads document contents. Using the Python SDK, what's the easiest way to define this tool?
- A) Write a complex JSON schema manually
- B) Send an HTTP request
- **C) Use the @mcp.tool decorator on a function**
- D) Create a separate configuration file

**Q6.** You want to provide users with a high-quality, pre-tested instruction for formatting documents. What MCP feature should you use?
- A) Resources
- B) Sessions
- C) Tools
- **D) Prompts**

---

### Quiz 7: Agents and Workflows (7 questions)

**Q1.** You're building an agent with tools. Which approach will give Claude the most flexibility to handle unexpected requests?
- A) Give Claude only one powerful tool
- B) Provide very specific tools like "write_python_function" and "debug_code"
- **C) Provide abstract tools like "read_file", "write_file", and "run_command"**
- D) Provide tools that only work for planned scenarios

**Q2.** You want Claude to write a report, then check if it's good enough, and improve it if needed. What pattern are you using?
- A) Chaining workflow
- **B) Evaluator-Optimizer pattern**
- C) Parallelization workflow
- D) Routing workflow

**Q3.** Your app generates different types of social media content. Programming topics need educational scripts, while sports topics need entertainment-focused content. What pattern should you use?
- **A) Route requests to specialized processing pipelines**
- B) Use the same prompt for everything
- C) Ask users to write their own content
- D) Always use the entertainment approach

**Q4.** Claude keeps ignoring some of your rules when you give it a long prompt with many requirements. What workflow approach would help?
- A) Make the prompt even longer with more rules
- B) Run everything in parallel
- C) Use a routing workflow to categorize first
- **D) Chain the task into focused sequential steps**

**Q5.** You need Claude to recommend the best material for a part by considering metal, plastic, ceramic, and wood options. Each material has different criteria. What's the best approach?
- A) Chain the evaluations one after another
- B) Ask Claude to pick randomly
- **C) Send separate requests for each material type in parallel**
- D) Put all criteria in one big prompt

**Q6.** You need to choose between a workflow and an agent for your app. Reliability and predictable results are most important to you. Which should you pick?
- A) Always use an agent for maximum flexibility
- **B) Use a workflow since it's more reliable and testable**
- C) Combine both approaches equally
- D) Use whichever is easier to code

**Q7.** You're building an app where users upload photos of damaged car parts and always get repair cost estimates. You know exactly what steps are needed each time. What should you use?
- A) Multiple agents working together
- B) A single complex prompt
- C) An agent with many specialized tools
- **D) A workflow with predetermined steps**

---

## Scoring Guide
- All 7 section quizzes: **100% correct**
- Total questions across all quizzes: **46**
- Use these questions for self-testing before the final assessment
