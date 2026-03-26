"use client";

import { useTheme } from "@/context/ThemeContext";

const SunIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

const THEME_ICONS = { light: SunIcon, dark: MoonIcon, system: MonitorIcon } as const;
const THEME_ORDER: ("light" | "dark" | "system")[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme();

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
  }

  const Icon = mounted ? THEME_ICONS[theme] : SunIcon;

  return (
    <button
      onClick={mounted ? cycleTheme : undefined}
      className="fixed top-4 right-4 z-50 rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
      aria-label={mounted ? `Theme: ${theme}. Click to change.` : "Toggle theme"}
      title={mounted ? `Theme: ${theme}` : undefined}
    >
      <Icon />
    </button>
  );
}
