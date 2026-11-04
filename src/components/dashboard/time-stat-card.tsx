// src/components/dashboard/time-stat-card.tsx
"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { Sparkline } from "@/components/charts/sparkline";
import { Claim, ClaimGrid, Panel } from "@/components/ui/panel";
import { DailyTimeEntry, DashboardStats } from "@/types/wakatime";
import { formatDuration, formatDurationShort } from "@/lib/utils";

/** "12h 34m" as two animated numbers. */
function DurationReadout({
  seconds,
  size = "lg",
}: {
  seconds: number;
  size?: "lg" | "md";
}) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const num =
    size === "lg"
      ? "text-5xl sm:text-6xl"
      : "text-4xl sm:text-[2.75rem]";
  const unit = size === "lg" ? "text-xl sm:text-2xl" : "text-lg";

  return (
    <div className="flex items-baseline gap-1 font-semibold tracking-tight tabular-nums">
      <AnimatedNumber value={hours} className={num} />
      <span className={`${unit} mr-2 font-medium text-muted-foreground`}>h</span>
      <AnimatedNumber value={minutes} className={num} />
      <span className={`${unit} font-medium text-muted-foreground`}>m</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

interface OverviewCardProps {
  totalTime: DashboardStats["totalTime"];
  allTimeStats?: DashboardStats["allTimeStats"];
  timeline: DailyTimeEntry[];
  rangeLabel: string;
  delay?: number;
  className?: string;
}

export function OverviewCard({
  totalTime,
  allTimeStats,
  timeline,
  rangeLabel,
  delay,
  className,
}: OverviewCardProps) {
  const activeDays = timeline.filter((d) => d.totalSeconds > 0).length;

  return (
    <Panel
      title={<>Time coded · <span className="text-muted-foreground">{rangeLabel}</span></>}
      delay={delay}
      className={className}
      json={{
        range: rangeLabel,
        total_seconds: Math.round(totalTime.seconds),
        total: totalTime.humanReadable,
        daily_average: totalTime.dailyAverageText,
        active_days: activeDays,
        all_time: allTimeStats?.humanReadable ?? null,
        all_time_daily_average: allTimeStats
          ? formatDuration(allTimeStats.dailyAverage)
          : null,
      }}
      bodyClassName="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <DurationReadout seconds={totalTime.seconds} />
          <p className="text-sm text-muted-foreground">
            across {activeDays} active day{activeDays === 1 ? "" : "s"}
          </p>
        </div>

        {timeline.length > 1 ? (
          <div className="w-full sm:max-w-[260px]">
            <Sparkline
              data={timeline.map((d) => d.totalSeconds / 3600)}
              labels={timeline.map((d) => d.dayName)}
              label="Daily coding time"
              variant="area"
              color="var(--primary)"
              height={64}
              strokeWidth={2}
              interactive
              formatValue={(v) => formatDurationShort(Math.round(v * 3600))}
            />
          </div>
        ) : null}
      </div>

      <ClaimGrid>
        <Claim name="daily_avg" hint="Average per day in this range">
          {totalTime.dailyAverageText || "0 mins"}
        </Claim>
        <Claim name="all_time" hint="Since the WakaTime account was created">
          {allTimeStats?.humanReadable ?? "—"}
        </Claim>
        <Claim name="all_time_avg" hint="All-time daily average">
          {allTimeStats ? `${formatDurationShort(allTimeStats.dailyAverage)}/day` : "—"}
        </Claim>
      </ClaimGrid>
    </Panel>
  );
}

/* -------------------------------------------------------------------------- */

interface BestDayCardProps {
  bestDay: DashboardStats["bestDay"];
  totalSeconds: number;
  delay?: number;
}

function formatBestDayDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function BestDayCard({ bestDay, totalSeconds, delay }: BestDayCardProps) {
  const share = totalSeconds > 0 ? (bestDay.totalSeconds / totalSeconds) * 100 : 0;

  return (
    <Panel
      title="Best day"
      delay={delay}
      json={{
        date: bestDay.date || null,
        total_seconds: Math.round(bestDay.totalSeconds),
        text: bestDay.text,
        share_of_range: Number(share.toFixed(1)),
      }}
      bodyClassName="flex flex-col justify-between gap-5"
    >
      <div className="space-y-1.5">
        <DurationReadout seconds={bestDay.totalSeconds} size="md" />
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {formatBestDayDate(bestDay.date)}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-muted-foreground">share_of_range</span>
          <span className="text-foreground tabular-nums">{share.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full origin-left rounded-full bg-warning transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min(share, 100)}%` }}
          />
        </div>
      </div>
    </Panel>
  );
}
