# Claude Code in Action

---

## What is Claude Code?

### Lesson 1: What is a Coding Assistant?

**Definition:** Coding Assistant = tool that uses language models to write code and complete development tasks.

**Core process:**
1. Receives task (e.g., fix bug from error message)
2. Language model gathers context (reads files, understands codebase)
3. Formulates plan to solve issue
4. Takes action (updates files, runs tests)

**Key limitation:** Language models only process text input/output — cannot directly read files, run commands, or interact with external systems.

**Tool use system:** Method enabling language models to perform actions. Assistant appends instructions to user request specifying formatted responses for actions (e.g., "read file: filename"). Harness parses these, executes actual operations, feeds results back.

**Claude Code architecture:** Built on agentic loop — continuous cycle of Claude reasoning, requesting tool actions, receiving results, and deciding next steps until task is complete.

---

### Lesson 2: Claude Code in Action

**Performance demo:** Claude Code optimized a popular JS package (429M weekly downloads) achieving 3.9x throughput improvement using benchmarks, profiling tools, and iterative fixes.

**Data analysis:** Performed churn analysis on video streaming CSV data using Jupyter notebooks. Executed code cells iteratively, viewed results, customized successive analyses.

**Tool extensibility:** Accepts new tool sets via MCP servers. Example: Playwright MCP server for browser automation — Claude opened browser, took screenshots, updated UI styling iteratively.

**GitHub integration:** Runs in GitHub Actions triggered by PRs/issues. Gets GitHub-specific tools (comments, commits, PR creation).

**Security example:** Infrastructure review of Terraform-defined AWS setup. Developer added user email to Lambda function output. Claude Code automatically detected PII exposure risk in shared S3 bucket and flagged it.

---

## Getting Hands On

### Lesson 3: Claude Code Setup

**Installation:** Requires Node.js. Install via npm, run `claude` command in terminal to login.

**Full setup guide:** docs.anthropic.com

**MCP client functionality:** Can consume tools from MCP servers to extend capabilities beyond basic file operations.

---

### Lesson 4: Project Setup

**`/init` command:** Claude scans codebase for architecture, coding style, and conventions. Creates `CLAUDE.md` file automatically included as context for future requests.

**CLAUDE.md levels:**
- **Project level** — shared with team, committed to repo
- **Local level** — personal, not committed (`.claude/CLAUDE.local.md`)
- **Machine level** — global for all projects (`~/.claude/CLAUDE.md`)

**Best practice:** Include critical project context (API patterns, database schemas) in CLAUDE.md so they're always available.

**Goal:** Provide just enough relevant information for Claude to complete tasks effectively.

---

### Lesson 5: Adding Context

**Context sources:**
- CLAUDE.md files (always loaded)
- Direct file references in conversation
- Codebase exploration by Claude

**Key principle:** More context = better results, but keep it focused and relevant.

---

### Lesson 6: Making Changes

**Screenshot integration:** Control-V (not Command-V on macOS) pastes screenshots to help Claude understand specific UI elements to modify.

**Performance boosting modes:**

| Mode | Trigger | Handles | Use for |
|------|---------|---------|---------|
| **Plan Mode** | Shift + Tab twice | Breadth — wide codebase understanding | Multi-step tasks requiring many files |
| **Thinking Mode** | Phrases like "Ultra think" | Depth — extended reasoning | Tricky logic, debugging specific issues |

- Can be combined for complex tasks
- Both consume additional tokens (cost consideration)

**Git integration:** Claude Code can stage/commit changes and write commit messages. Useful for maintaining clean git history during iterative development.

---

### Lesson 7: Controlling Context

**`/clear` command:** Resets conversation context. Essential when switching to completely unrelated tasks.

**Key benefits:** Maintains focus, reduces distracting context, preserves relevant knowledge, prevents repeated errors.

**Most effective for:** Long conversations and task transitions.

---

### Lesson 8: Custom Commands

**Definition:** User-defined automation commands accessed via forward slash (`/commandname`).

**Location:** `.claude/commands/` folder in project directory.

**File naming:** Filename becomes command name (`audit.md` creates `/audit` command).

**Arguments:** Use `$ARGUMENTS` placeholder in command text to accept runtime parameters.

**Activation:** Restart Claude Code after creating command files.

**Use cases:** Automating repetitive tasks like dependency auditing, test generation, vulnerability fixes.

---

### Lesson 9: MCP Servers with Claude Code

**Adding MCP servers:** `claude mcp add [server-name] [startup-command]`

**Example:** Document processing server exposing tools for PDF/Word document conversion to markdown.

**Dynamic capability expansion:** MCP servers add new functions to Claude Code in real-time without core modifications.

**Common use cases:** Production monitoring (Sentry), project management (Jira), communication (Slack), browser automation (Playwright).

**Setup:** Create MCP server → add to Claude Code with name and startup command → restart → access new capabilities.

---

### Lesson 10: GitHub Integration

**Setup:** Run `/install GitHub app` command → install Claude Code app on GitHub → add API key → auto-generated PR adds two GitHub Actions.

**Default actions:**
1. **Mention support** — @Claude in issues/PRs to assign tasks
2. **PR review** — automatic code review on new pull requests

**Customization:** Actions customizable via config files in `.github/workflows/` directory.

**Permission requirements:** Must explicitly list ALL permissions for Claude Code in actions. MCP server tools require individual permission listing (no shortcuts).

**Example use case:** Integrated Playwright MCP server for browser testing. Development server setup before Claude runs. Claude visits app in browser, takes screenshots, validates UI.

---

## Hooks and the SDK

### Lesson 11: Introducing Hooks

**Definition:** Mechanisms to intercept and control Claude's workflow through blocking or feedback mechanisms.

**Purpose:** Run custom logic before or after Claude executes tools — enables guardrails, validation, and automated quality checks.

---

### Lesson 12: Defining Hooks

**Hook types:**
- **PreToolUse hook** — executes before tool call, CAN block execution
- **PostToolUse hook** — executes after tool call, CANNOT block execution

**Implementation process:**
1. Choose hook type (pre vs post)
2. Identify target tool names to monitor
3. Write command to receive tool call data via stdin as JSON
4. Parse JSON containing `tool_name` and `input` parameters
5. Exit with appropriate code

**Exit codes:**
- **Exit 0** = allow tool call to proceed
- **Exit 2** = block tool call (PreToolUse only)
- Standard error output = feedback message sent to Claude when blocking

**Tool call data structure:** JSON object with `tool_name` (e.g., "read", "grep") and `input` parameters (e.g., `file_path`).

---

### Lesson 13: Implementing a Hook

**Example:** Prevent Claude from reading `.env` file contents.

**Configuration:**
- Location: `.claude/settings.local.json`
- Hook type: PreToolUse
- Matcher: `"read|grep"` (pipe separates tool names)
- Command: `"node ./hooks/read_hook.js"`

**Implementation:**
- Hook receives JSON via stdin: session ID, tool name, tool input, file path
- Logic: if file path includes ".env" → exit code 2 + log error to stderr
- `console.error()` sends feedback to Claude via stderr

**Key requirements:**
- Must restart Claude after hook changes
- Exit code 2 = blocked operation
- Hook works for both read and grep tools

---

### Lesson 14: Gotchas Around Hooks

**Important considerations:**
- Hooks must be restarted after changes
- Hook applies to ALL specified tools
- Fallback path checking via `tool_input.path` for compatibility
- stderr output goes to Claude as feedback
- stdout output is ignored

---

### Lesson 15: Useful Hooks

**Hook 1: TypeScript Type Checker**
- **Purpose:** Catch type errors immediately after file edits
- **Implementation:** Run `tsc --no-emit` after TypeScript file changes via PostToolUse hook
- **Process:** Detects type errors → feeds errors back to Claude → Claude fixes call sites automatically
- **Adaptable:** Works for any typed language with type checker, or use tests for untyped languages

**Hook 2: Duplicate Code Prevention**
- **Problem:** Claude creates duplicate functions instead of reusing existing ones, especially in complex tasks
- **Solution:** Hook monitors directory changes → launches separate Claude instance → reviews for duplicates → provides feedback
- **Trade-off:** Additional time/cost vs cleaner codebase
- **Recommendation:** Only apply to critical directories to minimize overhead

Both hooks use PostToolUse pattern to provide feedback after edits.

---

### Lesson 16: Another Useful Hook

**Query Deduplication Hook:**
- Problem: Claude creates duplicate SQL queries/functions instead of reusing existing ones
- Cause: Complex/wrapped tasks make Claude lose focus on existing code
- Solution: PostToolUse hook monitors query directory → secondary Claude instance analyzes for duplicates → reports back to primary Claude
- Process: File edit in `queries/` → secondary Claude reviews → reports duplicates → primary Claude removes duplicate and reuses existing
- Trade-off: Additional time/cost vs cleaner codebase with less duplication

---

### Lesson 17: The Claude Code SDK

**Definition:** Programmatic interface to use Claude Code via CLI, TypeScript, or Python libraries. Same tools as terminal version.

**Primary use case:** Integration into larger pipelines/workflows to add intelligence to processes.

**Key characteristics:**
- **Default permissions** = read-only (files, directories, grep operations)
- **Write permissions** = must be manually enabled via `options.allowTools` (e.g., specify "edit" tool)
- **Raw conversation output** = shows message-by-message exchange between local Claude Code and language model

**Best applications:** Helper commands, scripts, and hooks within existing projects rather than standalone usage.
