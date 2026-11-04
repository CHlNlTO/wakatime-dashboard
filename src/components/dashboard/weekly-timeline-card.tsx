// src/components/dashboard/weekly-timeline-card.tsx
"use client";

import React from "react";
import { CalendarDays, Flame } from "lucide-react";
import { BarChart, BarChartPlot, BarChartTooltip } from "@/components/charts/bar-chart";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Claim, ClaimGrid, Panel, PanelEmpty } from "@/components/ui/panel";
import { DailyTimeEntry } from "@/types/wakatime";
import { formatDurationShort } from "@/lib/utils";

interface WeeklyTimelineCardProps {
  weeklyData: DailyTimeEntry[];
  className?: string;
  showStreak?: boolean;
  delay?: number;
}

/** Bar categories must be unique; day names repeat past a week. */
function categoryLabel(day: DailyTimeEntry, count: number): string {
  if (count <= 7) return day.dayName;
  const date = new Date(day.date);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function WeeklyTimelineCard({
  weeklyData,
  className,
  showStreak = true,
  delay,
}: WeeklyTimelineCardProps) {
  const categories = React.useMemo(
    () => weeklyData.map((day) => categoryLabel(day, weeklyData.length)),
    [weeklyData]
  );

  const series = React.useMemo(
    () => [
      {
        id: "coding",
        name: "Coding time",
        color: "var(--primary)",
        values: weeklyData.map((day) => day.totalSeconds / 3600),
      },
    ],
    [weeklyData]
  );

  const codingStreak = React.useMemo(() => {
    let streak = 0;
    for (const day of [...weeklyData].reverse()) {
      if (day.totalSeconds > 0) streak++;
      else break;
    }
    return streak;
  }, [weeklyData]);

  const stats = React.useMemo(() => {
    const total = weeklyData.reduce((sum, day) => sum + day.totalSeconds, 0);
    const activeDays = weeklyData.filter((day) => day.totalSeconds > 0).length;
    return {
      total,
      activeDays,
      average: activeDays > 0 ? total / activeDays : 0,
    };
  }, [weeklyData]);

  const today = weeklyData.find((day) => day.isToday);

  return (
    <Panel
      title="Activity"
      delay={delay}
      className={className}
      actions={
        showStreak && codingStreak > 0 ? (
          <AnimatedBadge
            status="success"
            size="sm"
            icon={<Flame className="size-3" />}
            className="mr-1"
          >
            {codingStreak}d streak
          </AnimatedBadge>
        ) : null
      }
      json={weeklyData.map((day) => ({
        date: day.date,
        day: day.dayName,
        total_seconds: Math.round(day.totalSeconds),
        top_language: day.languages[0]?.name ?? null,
        is_today: day.isToday,
      }))}
      bodyClassName="flex flex-col gap-4"
    >
      {weeklyData.length === 0 ? (
        <PanelEmpty icon={<CalendarDays />}>No activity in this range</PanelEmpty>
      ) : (
        <>
          <BarChart
            series={series}
            categories={categories}
            label="Coding time per day"
            formatValue={(v) => formatDurationShort(Math.round(v * 3600))}
            formatTick={(v) => `${v}h`}
          >
            <BarChartPlot height={190} />
            <BarChartTooltip />
          </BarChart>

          <ClaimGrid>
            <Claim name="total">{formatDurationShort(Math.round(stats.total))}</Claim>
            <Claim name="avg_active_day" hint="Average over days with any activity">
              {formatDurationShort(Math.round(stats.average))}
            </Claim>
            <Claim name="active_days">
              {stats.activeDays}
              <span className="text-muted-foreground">/{weeklyData.length}</span>
              {today ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  today {formatDurationShort(Math.round(today.totalSeconds))}
                </span>
              ) : null}
            </Claim>
          </ClaimGrid>
        </>
      )}
    </Panel>
  );
}
