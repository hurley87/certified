import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="mt-10 scroll-mt-20 text-2xl font-bold tracking-tight text-zinc-900 first:mt-0 dark:text-zinc-50 sm:text-3xl"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-9 scroll-mt-20 border-b border-zinc-200 pb-2 text-xl font-semibold text-zinc-900 dark:border-zinc-800 dark:text-zinc-100 sm:text-2xl"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-7 scroll-mt-20 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-6 text-base font-semibold text-zinc-900 dark:text-zinc-100" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mt-4 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed [&>p]:mt-0" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-zinc-800 dark:text-zinc-200" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="mt-4 border-l-4 border-zinc-300 pl-4 text-zinc-600 italic dark:border-zinc-600 dark:text-zinc-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => <hr className="my-10 border-zinc-200 dark:border-zinc-800" {...props} />,
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-2 transition-colors hover:decoration-zinc-600 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:decoration-zinc-300"
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={href?.startsWith("http") ? "_blank" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full min-w-lg border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800" {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300" {...props}>
      {children}
    </td>
  ),
};

type StudyNoteMarkdownProps = {
  markdown: string;
};

export function StudyNoteMarkdown({ markdown }: StudyNoteMarkdownProps) {
  return (
    <article
      className={[
        "study-note-md max-w-none",
        "[&_code]:break-words [&_code]:font-mono [&_code]:text-[0.875em]",
        "[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-zinc-900",
        "dark:[&_code]:bg-zinc-800 dark:[&_code]:text-zinc-100",
        "[&_pre_code]:block [&_pre_code]:w-full [&_pre_code]:rounded-none [&_pre_code]:bg-transparent",
        "[&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:leading-relaxed",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </article>
  );
}
