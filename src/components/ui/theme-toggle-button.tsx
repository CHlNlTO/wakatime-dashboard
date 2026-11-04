// src/components/ui/theme-toggle-button.tsx
"use client";

import React, { useRef } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { ActionSwapIcon } from "@/components/motion/action-swap";
// Reused only for its mount-time VT_CSS stylesheet injection and isDark/mounted
// state — beUI's own `toggle()` anchors the circle reveal at one of six fixed
// viewport corners (via `start`), not at the button itself. This version reads
// the button's actual position instead, so the reveal always opens from where
// the user clicked, wherever that button sits on the page.
import { useThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";

export function ThemeToggleButton({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { setTheme } = useNextTheme();
  const { isDark, mounted } = useThemeToggle();
  const reduce = useReducedMotion() ?? false;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const next = isDark ? "light" : "dark";
    const supportsViewTransition =
      typeof document !== "undefined" && "startViewTransition" in document;

    if (reduce || !supportsViewTransition || !buttonRef.current) {
      setTheme(next);
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const originX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const originY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    const root = document.documentElement;
    root.style.setProperty("--beui-vt-origin", `${originX}% ${originY}%`);
    root.dataset.beuiVt = "circle";

    const vt = (
      document as Document & {
        startViewTransition(cb: () => void): { finished: Promise<void> };
      }
    ).startViewTransition(() => setTheme(next));

    vt.finished.finally(() => {
      delete root.dataset.beuiVt;
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
      className={cn("flex items-center justify-center", className)}
    >
      {mounted ? (
        <ActionSwapIcon
          value={isDark ? "dark" : "light"}
          animation="blur"
          className={iconClassName}
        >
          {isDark ? (
            <Sun className={iconClassName} />
          ) : (
            <Moon className={iconClassName} />
          )}
        </ActionSwapIcon>
      ) : (
        <span className={iconClassName} aria-hidden="true" />
      )}
    </button>
  );
}
