export type StudyNoteEntry = {
  /** URL segment for `/notes/[slug]` */
  readonly slug: string;
  readonly fileName: string;
  readonly title: string;
  readonly description: string;
};

export const STUDY_NOTES: readonly StudyNoteEntry[] = [
  {
    slug: "action",
    fileName: "action.md",
    title: "Claude Code in Action",
    description:
      "Claude Code setup, context, hooks, MCP, GitHub integration, and the SDK.",
  },
  {
    slug: "api",
    fileName: "api.md",
    title: "Building with the Claude API",
    description:
      "API usage, streaming, tools, RAG, MCP, Claude apps, agents, and workflows.",
  },
  {
    slug: "mcp",
    fileName: "mcp.md",
    title: "Introduction to Model Context Protocol",
    description:
      "MCP clients and servers, tools, resources, prompts, and the inspector.",
  },
  {
    slug: "skills",
    fileName: "skills.md",
    title: "Claude Code Skills",
    description:
      "Skills vs other features, SKILL.md frontmatter, sharing, and troubleshooting.",
  },
] as const;

export const STUDY_NOTE_FILENAMES = new Set(
  STUDY_NOTES.map((note) => note.fileName),
);

export function getStudyNoteBySlug(slug: string): StudyNoteEntry | undefined {
  return STUDY_NOTES.find((note) => note.slug === slug);
}
