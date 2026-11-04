// src/components/dashboard/dashboard-header.tsx
"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { CalendarDays, LogOut, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Switch } from "@/components/motion/switch";
import { IconButton } from "@/components/ui/panel";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { BrandMark } from "@/components/brand-mark";
import { EASE_OUT } from "@/lib/ease";
import { cn, formatRelativeTime } from "@/lib/utils";

interface DashboardHeaderProps {
  username?: string;
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onLogout?: () => void;
  isDemoMode?: boolean;
  hasError?: boolean;
  rangeLabel?: string;
  autoRefresh?: {
    enabled: boolean;
    onToggle: () => void;
  };
  /** Shown only when the card layout differs from the default. */
  onResetLayout?: () => void;
  /** Settings control (the settings modal renders its own trigger button). */
  settingsSlot?: React.ReactNode;
  className?: string;
}

const iconButtonClass =
  "grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";

export function DashboardHeader({
  username,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onLogout,
  isDemoMode = false,
  hasError = false,
  rangeLabel,
  autoRefresh,
  onResetLayout,
  settingsSlot,
  className,
}: DashboardHeaderProps) {
  const reduce = useReducedMotion();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const status = isRefreshing ? "loading" : hasError ? "warning" : "success";
  const statusLabel = isRefreshing ? "Syncing" : hasError ? "Stale" : "Live";

  return (
    <motion.header
      className={cn("space-y-3", className)}
      initial={reduce ? false : { opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
          <BrandMark size={42} interactive className="row-span-2" />
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Developer Dashboard
          </h1>
          <p className="col-start-2 truncate text-sm text-muted-foreground">
            {isDemoMode && username ? (
              <>
                Viewing{" "}
                <span className="font-medium text-foreground">{username}</span>
              </>
            ) : (
              "WakaTime analytics"
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card py-1 pr-1 pl-1 sm:pl-2">
          <AnimatedBadge
            status={status}
            size="sm"
            className="mr-1.5 hidden font-mono sm:inline-flex"
          >
            {statusLabel}
          </AnimatedBadge>

          {onRefresh ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh data"
              className="px-2.5 sm:px-3"
            >
              <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          ) : null}

          <ThemeToggleButton className={iconButtonClass} iconClassName="size-4" />

          {settingsSlot}

          {onLogout ? (
            <IconButton
              label={isDemoMode ? "Exit demo" : "Disconnect API key"}
              onClick={onLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
            </IconButton>
          ) : null}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm">
        {rangeLabel ? (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-panel px-2.5 font-mono text-xs">
            <span className="text-muted-foreground">range</span>
            <span className="text-syntax-string">&quot;{rangeLabel}&quot;</span>
          </span>
        ) : null}

        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {today}
        </span>

        {lastUpdated ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-success" />
            </span>
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        ) : null}

        <span className="ml-auto" aria-hidden />

        {onResetLayout ? (
          <button
            type="button"
            onClick={onResetLayout}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <RotateCcw className="size-3.5" />
            reset_layout
          </button>
        ) : null}

        {autoRefresh ? (
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-muted-foreground">
            <span className="font-mono text-xs">auto_refresh</span>
            <Switch
              checked={autoRefresh.enabled}
              onCheckedChange={autoRefresh.onToggle}
              ariaLabel="Auto-refresh every 5 minutes"
              className="[&_button]:h-5 [&_button]:w-9 [&_button]:px-0.5 [&_button>div]:size-4"
            />
          </label>
        ) : null}
      </div>
    </motion.header>
  );
}
