import Link from "next/link";

import { STUDY_NOTES } from "@/lib/study-notes";

export default function NotesIndexPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-3xl px-4 py-12 sm:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; Back to Home
          </Link>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Study Notes
          </h1>
        </div>

        <ul className="space-y-3">
          {STUDY_NOTES.map((note) => (
            <li key={note.fileName}>
              <Link
                href={`/notes/${note.slug}`}
                className="block rounded-lg border border-zinc-200 bg-white px-4 py-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {note.title}
                </span>
                <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-400">
                  {note.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
