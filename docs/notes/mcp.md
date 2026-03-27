# Introduction to Model Context Protocol

---

## Introduction

### Lesson 1: Introducing MCP

**Definition:** MCP = Model Context Protocol, a communication layer providing Claude with context and tools without requiring developers to write tedious code.

**Core Architecture:** MCP client connects to MCP server. MCP server contains three primitives: tools, resources, and prompts.

**Problem solved:** Traditional approach requires developers to manually author tool schemas and functions for each service integration (like GitHub API tools). This creates significant maintenance burden for complex services with many features.

**MCP solution:** Shifts tool definition and execution from developer's server to dedicated MCP server. MCP server = interface to outside service, wrapping functionality into pre-built tools.

**Key benefits:** Eliminates need for developers to write/maintain tool schemas and function implementations. Someone else authors the tools and packages them in the MCP server.

**Common questions:**
- Who authors MCP servers? Anyone, but often service providers create official implementations
- Difference from direct API calls? Saves developer time by providing pre-built tool schemas/functions
- Relationship to tool use? MCP and tool use are complementary, not identical. MCP focuses on *who* does the work of creating tools

**Core value:** Reduces developer burden by outsourcing tool creation to MCP server implementations rather than requiring custom tool development for each service integration.

---

### Lesson 2: MCP Clients

**Definition:** MCP Client = communication interface between your server and MCP server, provides access to server's tools.

**Transport agnostic:** Client/server can communicate via multiple protocols (stdin/stdout, HTTP, WebSockets). Common setup = client and server on same machine using standard input/output.

**Key message types:**
- `ListToolsRequest` / `ListToolsResult` — client asks server for available tools
- `CallToolRequest` / `CallToolResult` — client asks server to run a tool with arguments

**Typical flow:**
1. User queries your server
2. Server requests tool list from MCP client
3. MCP client sends ListToolsRequest to MCP server
4. MCP server responds with ListToolsResult
5. Server sends query + tools to Claude
6. Claude requests tool execution
7. Server asks MCP client to run tool
8. MCP client sends CallToolRequest to MCP server
9. MCP server executes tool (e.g., GitHub API call)
10. Results flow back: MCP server → MCP client → server → Claude → user

**Purpose:** Enables servers to delegate tool execution to specialized MCP servers while maintaining Claude integration.

---

## Hands-on with MCP Servers

### Lesson 3: Project Setup

Tutorial MCP projects often include **both** a client and a server so you can trace the full flow end-to-end. A typical learning setup pairs an MCP client (lists and calls tools) with a server that exposes a small tool surface (for example read/update document) and a simple in-memory data layer. Production systems usually implement only one side and integrate with a real backend.

---

### Lesson 4: Defining Tools with MCP

**MCP Python SDK:** Simplifies tool creation vs manual JSON schemas.

**Tool definition syntax:** `@mcp.tool` decorator + function with typed parameters + `Field()` descriptions.

**Two tools implemented:**
1. `read_doc_contents` — takes doc_id string, returns document content from in-memory docs dictionary
2. `edit_document` — takes doc_id, old_string, new_string parameters, performs find/replace on document content

**Error handling:** Check if doc_id exists in docs dictionary, raise `ValueError` if not found.

**Key advantage:** SDK eliminates manual JSON schema writing — generates schemas automatically from Python function signatures and decorators.

**Required imports:** `Field` from pydantic for parameter descriptions, mcp package for server and tool decorators.

**Implementation pattern:** Decorator defines tool metadata → function parameters define tool arguments with types and descriptions → function body contains tool logic.

---

### Lesson 5: The Server Inspector

**Definition:** In-browser debugger for testing MCP servers without connecting to applications.

**Access:** Run `mcp dev [server_file.py]` in terminal → opens server on port → navigate to provided localhost URL in browser.

**Interface:** Left sidebar with Connect button → top navigation shows Resources/Prompts/Tools sections → Tools section lists available tools → click tool to open right panel for manual testing.

**Testing workflow:** Connect → navigate to tools → select tool → input parameters → click Run Tool → verify output.

**Key features:** Live development testing, tool invocation simulation, parameter input fields, success/failure feedback.

**Primary benefit:** Essential for debugging MCP server implementations during development phase — test before connecting to production.

---

## Connecting with MCP Clients

### Lesson 6: Implementing a Client

**MCP Client = wrapper class** around client session for connecting to MCP server with resource cleanup management.

**Client Session:** Actual connection to MCP server from MCP Python SDK, requires cleanup on close.

**Key functions:**
- `list_tools()` = `await self.session.list_tools()`, return `result.tools`
- `call_tool()` = `await self.session.call_tool(tool_name, tool_input)`

**Common pattern:** Wrap client session in larger class for resource management rather than use session directly.

**Testing:** Run client file directly with testing harness to verify server connection and tool retrieval.

**Integration:** Other code in project calls client functions to interact with MCP server, enabling Claude to inspect/edit documents through defined tools.

---

### Lesson 7: Defining Resources

**Definition:** MCP server feature that exposes data to clients for read operations.

**Two resource types:**
- **Direct/Static** — static URI (e.g., `docs://documents`)
- **Templated** — parameterized URI with wildcards (e.g., `documents/{doc_id}`)

**Resource flow:**
1. Client sends read resource request with URI
2. MCP server matches URI to resource function
3. Server executes function, returns result
4. Client receives data via read resource result message

**Implementation:** Use `@mcp.resource` decorator with URI and MIME type parameters.

**MIME types:** Hints to client about returned data format (`application/json` for structured data, `text/plain` for plain text).

**Templated resources:** URI parameters automatically parsed by SDK and passed as keyword arguments to handler function.

**Resources vs Tools:** Resources provide data proactively (fetch when referenced). Tools perform actions reactively (when Claude decides to call them).

**Data return:** SDK automatically serializes returned data to strings; client responsible for deserialization.

---

### Lesson 8: Accessing Resources

**Resource reading function:** Client-side function to request and parse resources from MCP server.

**Implementation steps:**
- Import json module + `AnyURL` from pydantic
- Call `await self.session.read_resource(AnyURL(uri))`
- Extract first element from `result.contents[0]`
- Check `resource.mime_type` for parsing strategy

**Content parsing logic:**
- If `mime_type == "application/json"` → return `json.loads(resource.text)`
- Otherwise → return `resource.text` (plain text)

**Key point:** Resources expose server information directly to clients through structured request/response pattern. Document contents automatically included in Claude prompts without requiring tool calls.

---

### Lesson 9: Defining Prompts

**Definition:** Pre-defined, tested prompt templates that MCP servers expose to client applications for specialized tasks.

**Purpose:** Server authors create high-quality, evaluated prompts tailored to their domain, rather than leaving prompt quality to end users.

**Implementation:** Use `@prompt` decorator with name and description. Function receives arguments (e.g., document_id) and returns list of messages (user/assistant format).

**Example structure:**
```python
@prompt(name="format", description="rewrites document in markdown")
def format_document(doc_id: str) -> list[messages]:
    return [base.user_message(prompt_text)]
```

**Workflow:** User types /format → selects document → server returns specialized prompt → client sends to Claude → Claude uses tools to read/reformat/save document.

**Key benefit:** Encapsulates domain expertise in prompt engineering within specialized MCP servers. Clients get slash commands for pre-built workflows.

---

### Lesson 10: Prompts in the Client

**Functions:**
- `list_prompts()` = `await self.session.list_prompts()`, return `result.prompts`
- `get_prompt()` = `await self.session.get_prompt(prompt_name, arguments)`, return `result.messages`

**Prompt workflow:** Client requests prompt by name → passes arguments as keyword parameters → MCP server interpolates arguments into prompt template → returns formatted messages for AI model.

**Arguments flow:** Client arguments → prompt function keyword arguments → interpolated into prompt text (e.g., document_id parameter gets inserted into prompt template).

**Return format:** Messages array that forms conversation input for AI model.

**CLI usage:** `/format` command → select document → prompt with document ID sent to Claude → Claude uses tools to fetch document → returns formatted result.

**Key concept:** Prompts are server-defined templates that clients invoke with parameters, enabling reusable AI instructions with dynamic content insertion.

---

## Review and wrap-up

### Lesson 11: MCP Review

**MCP Server Primitives = 3 types:** tools, resources, prompts.

**Control pattern determines purpose:**

| Primitive | Controlled by | Purpose | Example |
|-----------|--------------|---------|---------|
| **Tools** | Model (Claude decides) | Add capabilities to Claude | JavaScript execution for calculations |
| **Resources** | Application code | Get data into apps for UI or prompt augmentation | Autocomplete options, document listings from Google Drive |
| **Prompts** | User actions | Predefined workflows triggered by buttons/commands | Chat starter buttons, slash commands |

**Decision framework:**
- Need Claude capabilities → implement **tools**
- Need app data → use **resources**
- Need user workflows → create **prompts**

**Real-world examples:**
- Claude's chat starter buttons = prompts
- Google Drive document selection = resources
- Code execution = tools
