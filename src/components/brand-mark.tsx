// src/components/brand-mark.tsx
"use client";

/*
 * App icon, matching public/icon.svg (the favicon): a rounded tile holding a
 * 3×3 grid of contribution cells that fill up column by column like rising
 * activity bars. The top-right cell is "today". Colored green, like GitHub's
 * own contribution graph — this is the only place in the app that departs
 * from the brand blue, since the mark is literally a mini contribution grid.
 *
 * `interactive` turns it into a small easter egg (used in the dashboard top
 * bar): hover a cell to outline it, click to step it up one contribution
 * level. Fill every cell to the top level — brightest green in dark mode,
 * darkest in light mode — and it celebrates with confetti, then settles back
 * to its resting pattern.
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

const CELL = 12;
const STEP = 15;
const ORIGIN = 11;

/** Same five-step ramp as the Contributions card: none, then four greens. */
const MAX_LEVEL = 4;
const LEVEL_OPACITY = [0, 0.25, 0.45, 0.7, 1];

/** Resting pattern, [column][row] top to bottom, as contribution levels. */
const DEFAULT_LEVELS = [
  [0, 0, 2],
  [0, 3, 2],
  [MAX_LEVEL, 3, 2],
];

type Phase = "play" | "win" | "reset";

const flatDefault = () => DEFAULT_LEVELS.flat();

export function BrandMark({
  size = 32,
  interactive = false,
  className,
}: {
  size?: number;
  /** Clickable cells + confetti easter egg. */
  interactive?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Cell index = column * 3 + row.
  const [levels, setLevels] = useState<number[]>(flatDefault);
  const [phase, setPhase] = useState<Phase>("play");

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const celebrate = async () => {
    setPhase("win");

    if (!reduce && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      };
      const dark = document.documentElement.classList.contains("dark");
      // GitHub's contribution greens, per theme.
      const colors = dark
        ? ["#0e4429", "#006d32", "#26a641", "#39d353"]
        : ["#9be9a8", "#40c463", "#30a14e", "#216e39"];
      try {
        const { default: confetti } = await import("canvas-confetti");
        const shared = { origin, colors, shapes: ["square" as const], scalar: 0.9, disableForReducedMotion: true };
        confetti({ ...shared, particleCount: 70, spread: 75, startVelocity: 32, angle: 300, ticks: 220 });
        confetti({ ...shared, particleCount: 50, spread: 110, startVelocity: 24, angle: 270, ticks: 200 });
      } catch (error) {
        console.warn("Confetti failed to load:", error);
      }
    }

    // Hold the full grid for a beat, then fade back to the resting pattern.
    later(reduce ? 600 : 1300, () => {
      setLevels(flatDefault());
      setPhase("reset");
      later(reduce ? 200 : 700, () => setPhase("play"));
    });
  };

  const bump = (index: number) => {
    if (phase !== "play" || levels[index]! >= MAX_LEVEL) return;
    const next = levels.map((level, i) => (i === index ? level + 1 : level));
    setLevels(next);
    if (next.every((level) => level === MAX_LEVEL)) void celebrate();
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", interactive && "select-none", className)}
    >
      <rect x="1" y="1" width="62" height="62" rx="16" fill="var(--panel)" />
      <rect
        x="1.75"
        y="1.75"
        width="60.5"
        height="60.5"
        rx="15.25"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
      />

      {DEFAULT_LEVELS.map((column, c) =>
        column.map((_, r) => {
          const index = c * 3 + r;
          const level = levels[index]!;
          const x = ORIGIN + c * STEP;
          const y = ORIGIN + r * STEP;

          if (!interactive) {
            return (
              <g key={index}>
                <rect x={x} y={y} width={CELL} height={CELL} rx="3" fill="var(--foreground)" fillOpacity={0.08} />
                {level ? (
                  <rect
                    x={x}
                    y={y}
                    width={CELL}
                    height={CELL}
                    rx="3"
                    fill="var(--success)"
                    fillOpacity={LEVEL_OPACITY[level]}
                  />
                ) : null}
              </g>
            );
          }

          // Diagonal wave order for the win pulse and the reset fade.
          const wave = c + (2 - r);

          return (
            <motion.g
              key={index}
              className={cn("group/cell", phase === "play" && "cursor-pointer")}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              onClick={() => bump(index)}
              whileTap={phase === "play" && !reduce ? { scale: 0.78 } : undefined}
              animate={
                phase === "win" && !reduce
                  ? { scale: [1, 1.22, 1], transition: { duration: 0.45, ease: EASE_OUT, delay: wave * 0.05 } }
                  : { scale: 1, transition: SPRING_PRESS }
              }
            >
              {/* Hit area spans the gap too, so small cells are easy to click. */}
              <rect x={x - 1.5} y={y - 1.5} width={STEP} height={STEP} fill="transparent" />
              {/* Empty cell */}
              <rect x={x} y={y} width={CELL} height={CELL} rx="3" fill="var(--foreground)" fillOpacity={0.08} />
              {/* Green level, layered on top so it can fade in from empty */}
              <motion.rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx="3"
                fill="var(--success)"
                initial={false}
                animate={{ fillOpacity: LEVEL_OPACITY[level] }}
                transition={
                  phase === "reset" && !reduce
                    ? { duration: 0.35, ease: EASE_OUT, delay: (4 - wave) * 0.06 }
                    : { duration: reduce ? 0 : 0.18, ease: EASE_OUT }
                }
              />
              {/* GitHub-style hover outline */}
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx="3"
                fill="none"
                stroke="var(--foreground)"
                strokeOpacity={0.55}
                strokeWidth={1.3}
                className="opacity-0 transition-opacity duration-150 group-hover/cell:opacity-100"
              />
            </motion.g>
          );
        })
      )}
    </svg>
  );
}
