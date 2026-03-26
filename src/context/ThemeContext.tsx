"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "theme";

const VALID_THEMES: ReadonlySet<string> = new Set<Theme>(["light", "dark", "system"]);

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}>({ theme: "system", setTheme: () => {}, mounted: false });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_THEMES.has(stored)) setTheme(stored as Theme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (theme === "system") {
      localStorage.removeItem(THEME_STORAGE_KEY);
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (themeRef.current === "system") {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}
