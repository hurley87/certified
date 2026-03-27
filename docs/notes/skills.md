# Claude Code Skills

---

## Supplemental: Simon Willison's Take on Skills (Oct 2025)

**Source:** simonwillison.net/2025/Oct/16/claude-skills/

Simon Willison argues that skills may be more significant than MCP. Key points:

**Why skills are powerful:**
- Conceptually simple: a markdown file teaching the model how to do something, with optional scripts
- Extremely token-efficient: only a few dozen tokens per skill at startup (name + description), full content loaded only when needed
- Easy to iterate on — just edit a markdown file
- Work across different coding agents (Codex CLI, Gemini CLI, etc.) since they're just markdown + scripts

**Skills vs MCP — why Willison prefers skills:**
- MCP servers consume massive token budgets (GitHub's MCP alone uses tens of thousands of tokens)
- Skills have minimal token overhead by comparison
- Almost anything achievable via MCP can be handled by a CLI tool instead — and skills can describe how to use CLI tools
- Skills are simpler to create and share (a markdown file vs a full protocol with hosts, clients, servers, transports)

**Skills depend on a coding environment:**
- They require filesystem access, tool navigation, and command execution
- This is the biggest difference from MCP — skills need a sandboxed execution environment
- The safety/sandboxing question remains important

**Skills as "general agent" enablers:**
- Claude Code isn't just a coding tool — it's a general computer automation agent
- Skills make this explicit: you can build domain-specific agents (e.g., data journalism) with just a folder of markdown files and scripts
- Willison envisions a "Cambrian explosion" of skills

**Key quote worth remembering:** Skills outsource the hard parts to the LLM harness and the execution environment, which aligns with what we've learned about LLMs' ability to run tools.

---

## Skills

### Lesson 1: What Are Skills?

**Definition:** Skills are folders of instructions (with a `SKILL.md` file) that Claude Code can discover and use to handle tasks more accurately.

**How matching works:**
- Claude loads **only skill names and descriptions** at startup (not full content)
- When you send a request, Claude compares it against descriptions using **semantic matching**
- You get a **confirmation prompt** before the full skill loads into context
- Skills load **on demand** — unlike CLAUDE.md (always loaded) or slash commands (explicitly typed)

**Where skills live:**
- **Personal:** `~/.claude/skills/` (follow you across all projects)
- **Project:** `.claude/skills/` (committed to repo, shared with team via git)

**Key insight:** If you're explaining the same thing to Claude repeatedly, that's a skill waiting to be written.

---

### Lesson 2: Creating Your First Skill

**Two steps to create a skill:**
1. Create a named directory: `mkdir -p ~/.claude/skills/pr-description`
2. Create `SKILL.md` inside it with frontmatter + instructions:

```markdown
---
name: pr-description
description: Writes pull request descriptions. Use when creating a PR, writing a PR summary, or drafting release notes.
---

[Your instructions here]
```

**Frontmatter fields:**
- `name` (required) — identifies the skill. Lowercase, numbers, hyphens only. Max 64 chars.
- `description` (required) — tells Claude when to use it. Max 1,024 chars. **This is the most important field.**

**Testing:** Restart Claude Code after creating a skill (skills load at startup). Verify with `/skills`.

**Priority hierarchy (for name conflicts):**
1. **Enterprise** — managed settings, highest priority
2. **Personal** — `~/.claude/skills/`
3. **Project** — `.claude/skills/`
4. **Plugins** — lowest priority

**Updating/removing:** Edit `SKILL.md` to update. Delete the directory to remove. **Always restart Claude Code after changes.**

---

### Lesson 3: Configuration and Multi-File Skills

**All frontmatter fields:**
| Field | Required | Purpose |
|-------|----------|---------|
| `name` | Yes | Identifies skill. Lowercase/numbers/hyphens, max 64 chars |
| `description` | Yes | Tells Claude when to use it. Max 1,024 chars |
| `allowed-tools` | No | Restricts which tools Claude can use when skill is active |
| `model` | No | Specifies which Claude model to use |

**Writing effective descriptions:**
- Answer TWO questions: "What does the skill do?" and "When should Claude use it?"
- If the skill isn't triggering, add more keywords matching how you actually phrase requests
- Be explicit — vague descriptions lead to unreliable matching

**`allowed-tools` for restricting access:**
- Example: `allowed-tools: [Read, Grep, Glob, Bash]` for read-only operations
- If omitted, the skill doesn't restrict anything (full tool access)

**Progressive disclosure (multi-file skills):**
- Keep `SKILL.md` under **500 lines**
- Organize skill directory with subdirectories:
  - `scripts/` — executable code
  - `references/` — additional documentation
  - `assets/` — images, templates, data files
- Link to supporting files in SKILL.md with clear instructions on when to load them

**Scripts efficiency:**
- Two modes: **run** (executes without loading contents into context) vs **read** (loads contents)
- Running scripts only consumes tokens for output, not source code — keeps context efficient
- Useful for: environment validation, data transformations, tested code operations

---

### Lesson 4: Skills vs. Other Claude Code Features

**Comparison matrix:**

| Feature | Loading | Trigger | Best for |
|---------|---------|---------|----------|
| **CLAUDE.md** | Every conversation | Always-on | Project-wide standards, universal constraints |
| **Skills** | On demand | Semantic match to request | Task-specific expertise, occasional knowledge |
| **Slash commands** | Manual | User types `/command` | Explicit invocation of specific workflows |
| **Subagents** | Delegated | Task delegation | Isolated execution contexts, separate tool access |
| **Hooks** | Event-driven | File saves, tool calls | Automated side effects, validation on events |
| **MCP servers** | Connection time | External integrations | Tools and data from external systems |

**Skills vs CLAUDE.md:**
- CLAUDE.md = "always know this" (strict mode, never modify schema)
- Skills = "know this when relevant" (PR review checklist, debugging procedures)

**Skills vs Subagents:**
- Skills add knowledge **to your current conversation**
- Subagents run in a **separate context** and return results
- Skills = enhance reasoning; Subagents = delegate work

**Skills vs Hooks:**
- Hooks = **event-driven** (fire on file save, tool call)
- Skills = **request-driven** (activate based on what you're asking)

**Typical combined setup:** CLAUDE.md (always-on standards) + Skills (on-demand expertise) + Hooks (automated operations) + Subagents (isolated delegation) + MCP servers (external tools)

---

### Lesson 5: Sharing Skills

**Three distribution methods:**

1. **Project skills (`.claude/skills/`):**
   - Shared automatically through Git
   - Anyone who clones the repo gets them
   - Best for: team coding standards, project-specific workflows

2. **Plugins (marketplaces):**
   - Distribute skills across repositories
   - Best for: skills that aren't project-specific, community value
   - Enterprise can control sources: `strictKnownMarketplaces` in managed settings

3. **Enterprise managed settings:**
   - Deploy skills organization-wide with **highest priority**
   - Best for: mandatory standards, security requirements, compliance

**Skills and subagents — critical detail:**
- **Built-in agents** (Explorer, Plan, Verify) **CANNOT access skills at all**
- **Custom subagents** in `.claude/agents/` CAN use skills, but only when **explicitly listed** in frontmatter:
  ```
  ---
  name: frontend-security-reviewer
  description: "Reviews frontend code..."
  skills: [skill-name-1, skill-name-2]
  ---
  ```
- Skills are loaded when the subagent **starts**, not on demand like in main conversation

---

### Lesson 6: Troubleshooting Skills

**Quick troubleshooting checklist:**

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Not triggering | Description doesn't match how you phrase requests | Add trigger keywords, test with variations |
| Not loading | Wrong file structure | Must be `skills/<name>/SKILL.md` (not at skills root). File must be exactly `SKILL.md` |
| Wrong skill used | Descriptions too similar | Make descriptions more distinct |
| Being shadowed | Higher-priority skill has same name | Check hierarchy (Enterprise > Personal > Project > Plugin), rename yours |
| Plugin skills missing | Cache issue | Clear cache, restart, reinstall |
| Runtime failure | Missing deps, permissions, paths | `chmod +x` scripts, install deps, use forward slashes everywhere |

**Key tools:**
- **Skills validator tool** — run this first, catches structural problems
- **`claude --debug`** — shows loading errors, look for messages mentioning your skill name

**Structural rules:**
- `SKILL.md` must be inside a **named directory**, not at the skills root
- File name must be exactly `SKILL.md` — all caps "SKILL", lowercase "md"
- Frontmatter YAML must be valid
