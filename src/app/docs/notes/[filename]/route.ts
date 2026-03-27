import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { STUDY_NOTE_FILENAMES } from "@/lib/study-notes";

type RouteContext = {
  params: Promise<{ filename: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;

  if (!STUDY_NOTE_FILENAMES.has(filename)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "docs", "notes", filename);

  try {
    const content = await readFile(filePath, "utf8");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
