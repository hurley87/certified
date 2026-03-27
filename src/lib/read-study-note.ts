import { readFile } from "node:fs/promises";
import path from "node:path";

import { getStudyNoteBySlug } from "@/lib/study-notes";

export async function readStudyNoteMarkdown(slug: string): Promise<string | null> {
  const note = getStudyNoteBySlug(slug);
  if (!note) return null;

  const filePath = path.join(process.cwd(), "docs", "notes", note.fileName);

  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
