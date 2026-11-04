// src/components/theme-provider.tsx
"use client";

import React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import { TooltipProvider } from "@/components/motion/tooltip";

type Theme = "dark" | "light";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * next-themes drives the `.dark` class (beUI's ThemeToggle reads it directly).
 * The storage key is kept from the previous hand-rolled provider so returning
 * visitors keep their saved theme.
 */
export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "wakatime-dashboard-theme",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey={storageKey}
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemesProvider>
  );
}

/** Same shape as the old hook, so existing callers keep working. */
export const useTheme = () => {
  const { resolvedTheme, setTheme } = useNextTheme();
  const theme: Theme = resolvedTheme === "light" ? "light" : "dark";

  return {
    theme,
    setTheme: (next: Theme) => setTheme(next),
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  };
};
