// src/components/dashboard/meter-list.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn, formatPercentage } from "@/lib/utils";

export interface MeterItem {
  id: string;
  name: string;
  detail: string;
  percentage: number;
  icon?: React.ReactNode;
}

/**
 * Ranked rows with a share bar. Bars are scaled against the leader so the
 * top row always fills the track and the rest read relative to it.
 */
export function MeterList({
  items,
  color = "var(--primary)",
  className,
}: {
  items: MeterItem[];
  color?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const max = Math.max(...items.map((item) => item.percentage), 1);

  return (
    <ol className={cn("-mx-2 space-y-0.5", className)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className="group rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
        >
          <div className="flex items-center gap-3">
            <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item.icon ? (
              <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors group-hover:text-foreground [&_svg]:size-3.5">
                {item.icon}
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-sm font-medium text-foreground" title={item.name}>
                  {item.name}
                </span>
                <span className="shrink-0 font-mono text-[13px] font-medium tabular-nums">
                  {formatPercentage(item.percentage)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ backgroundColor: color, opacity: index === 0 ? 1 : 0.7 }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: item.percentage / max }}
                    transition={
                      reduce ? { duration: 0 } : { ...SPRING_LAYOUT, delay: 0.25 + index * 0.06 }
                    }
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
                  {item.detail}
                </span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
