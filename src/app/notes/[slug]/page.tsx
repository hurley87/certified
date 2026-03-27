import Link from "next/link";
import { notFound } from "next/navigation";

import { StudyNoteMarkdown } from "@/components/study-note-markdown";
import { getStudyNoteBySlug, STUDY_NOTES } from "@/lib/study-notes";
import { readStudyNoteMarkdown } from "@/lib/read-study-note";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return STUDY_NOTES.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const note = getStudyNoteBySlug(slug);
  if (!note) return { title: "Not found" };
  return {
    title: note.title,
    description: note.description,
  };
}

export default async function StudyNotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getStudyNoteBySlug(slug);
  if (!note) notFound();

  const markdown = await readStudyNoteMarkdown(slug);
  if (!markdown) notFound();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-3xl px-4 py-12 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/"
            className="font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; Home
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700" aria-hidden>
            |
          </span>
          <Link
            href="/notes"
            className="font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            All notes
          </Link>
        </div>

        <StudyNoteMarkdown markdown={markdown} />
      </main>
    </div>
  );
}
