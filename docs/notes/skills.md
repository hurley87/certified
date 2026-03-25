# Claude Code Skills - Study Notes & Quiz

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

## Introduction to Agent Skills Course (Anthropic Academy)

---

## Skills Study Notes

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

---

## Skills-Specific Multiple Choice Quiz (15 questions)

### Q1. Where should you place a skill that only you use across all your projects?

A) `.claude/skills/` in each project repository
B) `~/.claude/skills/` in your home directory
C) `~/.claude/commands/` in your home directory
D) `~/.claude/CLAUDE.md` with the skill instructions inline

**Correct Answer: B**
Personal skills go in `~/.claude/skills/` and follow you across all projects. Option A creates project skills visible to the team. Option C is for slash commands, not skills. Option D puts instructions into CLAUDE.md which loads every conversation rather than on demand.

---

### Q2. What are the two REQUIRED frontmatter fields in a SKILL.md file?

A) `name` and `allowed-tools`
B) `name` and `description`
C) `description` and `model`
D) `name` and `context`

**Correct Answer: B**
`name` and `description` are the only required fields. `allowed-tools`, `model`, `context`, and `argument-hint` are all optional.

---

### Q3. When Claude Code starts, what does it load from each skill?

A) The entire SKILL.md file contents
B) Only the `name` and `description` from the frontmatter
C) The SKILL.md file plus all referenced files in the skill directory
D) A hash of the SKILL.md for change detection

**Correct Answer: B**
Claude only loads skill names and descriptions at startup — not the full content. The full SKILL.md is loaded into context only after a match is found and the user confirms.

---

### Q4. Your skill `code-review` works fine on your machine, but a new team member says it doesn't load for them. They cloned the repo. Where is the skill most likely located?

A) `~/.claude/skills/code-review/SKILL.md` on your machine
B) `.claude/skills/code-review/SKILL.md` in the repository
C) `.claude/commands/code-review.md` in the repository
D) The root `CLAUDE.md` file

**Correct Answer: A**
If the skill is in your personal `~/.claude/skills/` directory, it follows you but isn't shared via version control. The team member wouldn't have it. Option B would be shared through git. Options C and D are different features entirely.

---

### Q5. You want a skill that reviews PRs but should NOT be able to modify any files. Which frontmatter configuration achieves this?

A) `allowed-tools: [Read, Grep, Glob, Bash]`
B) `allowed-tools: [Read, Write, Edit, Bash]`
C) `context: readonly`
D) Skills are read-only by default

**Correct Answer: A**
`allowed-tools` restricts which tools Claude can use when the skill is active. Omitting Write and Edit prevents file modifications. Option B includes Write and Edit. Option C is not a valid frontmatter option. Option D is incorrect — skills have full tool access by default.

---

### Q6. Your SKILL.md file is 800 lines long with detailed reference tables. What's the recommended approach?

A) Keep it as-is; Claude handles long files well
B) Split into SKILL.md (under 500 lines) with supporting files in `references/` subdirectories, linked from SKILL.md
C) Create multiple skills, one for each section
D) Move the tables into CLAUDE.md so they're always available

**Correct Answer: B**
The recommended approach is progressive disclosure: keep SKILL.md under 500 lines and link to supporting files (references, scripts, assets) that Claude loads on demand. Option A ignores the 500-line guideline. Option C fragments related knowledge. Option D loads everything into every conversation unnecessarily.

---

### Q7. A skill contains a validation script that checks environment setup. What's the most token-efficient way to use it?

A) Have Claude read the script contents, then execute it
B) Reference the script with a `run` instruction so it executes without loading its source into context
C) Inline the script logic directly in SKILL.md
D) Convert the script to a series of prompt instructions

**Correct Answer: B**
Scripts can run without loading their contents into context — only the output consumes tokens, keeping context efficient. Option A loads the source code unnecessarily. Options C and D use tokens for the logic itself.

---

### Q8. Your skill description says "Helps with code." Claude rarely matches it to your requests. What's wrong?

A) The skill name is too generic
B) The description is too vague — it doesn't specify what the skill does or when Claude should use it
C) You need to add `model` to the frontmatter
D) The skill directory name doesn't match the skill name

**Correct Answer: B**
A good description must answer two questions: "What does the skill do?" and "When should Claude use it?" The description "Helps with code" is too vague for semantic matching. Option A doesn't affect matching — the description does. Options C and D are unrelated.

---

### Q9. What is the skill priority order when two skills have the same name?

A) Project > Personal > Enterprise > Plugins
B) Personal > Project > Enterprise > Plugins
C) Enterprise > Personal > Project > Plugins
D) Enterprise > Project > Personal > Plugins

**Correct Answer: C**
The priority hierarchy is Enterprise (highest) > Personal > Project > Plugins (lowest). This lets organizations enforce standards through enterprise skills while allowing individual customization.

---

### Q10. You created a skill at `~/.claude/skills/SKILL.md` (directly in the skills root, not in a subdirectory). What happens?

A) Claude loads it normally
B) Claude ignores it — SKILL.md must be inside a named subdirectory
C) Claude throws an error on startup
D) Claude loads it but with a warning

**Correct Answer: B**
SKILL.md must be inside a named directory (e.g., `~/.claude/skills/my-skill/SKILL.md`), not directly at the skills root. Skills placed at the root are silently ignored.

---

### Q11. Which of these is NOT a valid way skills differ from CLAUDE.md?

A) Skills load on demand; CLAUDE.md loads into every conversation
B) Skills use semantic matching; CLAUDE.md is always present
C) Skills can restrict tool access with `allowed-tools`; CLAUDE.md cannot
D) Skills are shared via git; CLAUDE.md is personal only

**Correct Answer: D**
This is incorrect — both can be shared via git. Project CLAUDE.md (`.claude/CLAUDE.md` or root `CLAUDE.md`) is version-controlled. Project skills in `.claude/skills/` are also version-controlled. Personal versions of both exist too (`~/.claude/CLAUDE.md` and `~/.claude/skills/`).

---

### Q12. You define a custom subagent in `.claude/agents/reviewer.md`. It needs to use your `security-audit` skill. How do you configure this?

A) Add `skills: [security-audit]` to the agent's frontmatter
B) The subagent automatically inherits all available skills
C) Reference the skill in the agent's system prompt instructions
D) Add the skill path to the agent's `allowedTools`

**Correct Answer: A**
Custom subagents must explicitly list skills in their frontmatter `skills` field. Built-in agents can't access skills at all, and custom agents don't automatically inherit them. Option C is a workaround but not the proper mechanism. Option D confuses tools with skills.

---

### Q13. You installed a plugin but its skills don't appear. What should you try first?

A) Restart Claude Code, clear the cache, and reinstall the plugin
B) Check if an enterprise skill has the same name
C) Run the skills validator on the plugin directory
D) Add the plugin skills manually to your personal skills folder

**Correct Answer: A**
For plugin skills not appearing, the first step is to clear the cache, restart Claude Code, and reinstall. If skills still don't appear after that, the plugin structure might be wrong (then use the validator).

---

### Q14. What does `context: fork` do in skill frontmatter?

A) Creates a copy of the skill for each conversation
B) Runs the skill in an isolated sub-agent context, preventing its output from polluting the main conversation
C) Forks the git repository before applying skill changes
D) Splits the skill into parallel execution threads

**Correct Answer: B**
`context: fork` runs the skill in isolation so its potentially verbose output doesn't pollute the main conversation context. This is useful for skills that produce large analysis output or exploratory results.

---

### Q15. You're debugging a skill that should trigger on "review my PR" but doesn't. You've verified the file structure is correct. What's the most likely fix?

A) Rename the skill directory to match the exact phrase "review-my-pr"
B) Add trigger phrases like "review PR," "PR review," "check my pull request" to the skill's description
C) Change the skill's `name` field to "review-my-pr"
D) Move the skill from personal to project scope

**Correct Answer: B**
Claude uses semantic matching against the description, not the name or directory. If the skill doesn't trigger, the description needs keywords that overlap with how you phrase requests. Adding trigger phrases directly to the description is the fix. Options A and C change naming but not matching. Option D changes scope but not triggering.

---

## Scoring Guide (Skills Quiz)
- **13-15 correct:** Solid skills knowledge, ready for exam Domain 3 skills questions
- **10-12 correct:** Review the lessons you missed, focus on configuration details
- **Below 10:** Re-read the course notes above, then retake
