// src/components/demo/demo-banner.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

interface DemoBannerProps {
  demoUser?: string;
  onSwitchToPersonal?: () => void;
  className?: string;
}

/**
 * Minimal on purpose: one neutral row. The emphasis comes from a single
 * accent — the amber DEMO tag and the dashed border — not from a gradient.
 */
export function DemoBanner({
  demoUser = "Clark",
  onSwitchToPersonal,
  className,
}: DemoBannerProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.05 }}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-dashed border-warning/40 bg-card px-3 py-2.5",
        "sm:flex-row sm:items-center sm:gap-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border border-warning/35 bg-warning/10 px-2 font-mono text-[11px] font-semibold tracking-wider text-warning uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-70 motion-reduce:hidden" />
            <span className="relative inline-flex size-1.5 rounded-full bg-warning" />
          </span>
          Demo
        </span>
        <p className="min-w-0 text-sm text-muted-foreground">
          You&apos;re viewing{" "}
          <span className="font-medium text-foreground">{demoUser}&apos;s</span>{" "}
          live coding stats.{" "}
          <span className="hidden md:inline">
            Connect your WakaTime key to see your own.
          </span>
        </p>
      </div>

      {onSwitchToPersonal ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitchToPersonal}
          className="group w-full shrink-0 sm:ml-auto sm:w-auto"
        >
          Use your API key
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Button>
      ) : null}
    </motion.div>
  );
}
