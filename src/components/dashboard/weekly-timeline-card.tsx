// src/components/dashboard/weekly-timeline-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Calendar, Flame, Clock } from "lucide-react";
import { DailyTimeEntry } from "@/types/wakatime";
import { cn, formatDuration, formatDurationShort } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface WeeklyTimelineCardProps {
  weeklyData: DailyTimeEntry[];
  className?: string;
  showStreak?: boolean;
}

interface ChartDataItem extends DailyTimeEntry {
  isWeekend: boolean;
  opacity: number;
}

export function WeeklyTimelineCard({
  weeklyData,
  className,
  showStreak = true,
}: WeeklyTimelineCardProps) {
  const { theme } = useTheme();

  // Transform data for the chart
  const chartData: ChartDataItem[] = React.useMemo(() => {
    return weeklyData.map((day) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      return {
        ...day,
        isWeekend,
        opacity: day.totalSeconds > 0 ? 1 : 0.3,
      };
    });
  }, [weeklyData]);

  // Calculate coding streak
  const codingStreak = React.useMemo(() => {
    let streak = 0;
    const sortedStats = [...weeklyData].reverse(); // Start from most recent

    for (const day of sortedStats) {
      if (day.totalSeconds > 0) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [weeklyData]);

  // Calculate total and average for the week
  const weekStats = React.useMemo(() => {
    const totalSeconds = weeklyData.reduce(
      (sum, day) => sum + day.totalSeconds,
      0
    );
    const activeDays = weeklyData.filter((day) => day.totalSeconds > 0).length;
    const averageSeconds = activeDays > 0 ? totalSeconds / activeDays : 0;

    return {
      total: totalSeconds,
      totalText: formatDuration(totalSeconds),
      average: averageSeconds,
      averageText: formatDuration(averageSeconds),
      activeDays,
    };
  }, [weeklyData]);

  // Get colors based on theme
  const getBarColor = (entry: ChartDataItem): string => {
    if (entry.isToday) {
      return theme === "dark" ? "#00f5ff" : "#0080ff"; // Bright cyan for dark, blue for light
    }
    if (entry.isWeekend) {
      return theme === "dark" ? "#6b7280" : "#9ca3af"; // Gray for weekends
    }
    return theme === "dark" ? "#8b5cf6" : "#7c3aed"; // Purple primary color
  };

  const CustomTooltip = React.useCallback(
    ({
      active,
      payload,
    }: {
      active?: boolean;
      payload?: Array<{ payload: ChartDataItem }>;
    }) => {
      if (active && payload && payload.length) {
        const data = payload[0]!.payload as ChartDataItem;
        const date = new Date(data.date);

        return (
          <div className="glass-effect rounded-lg p-3 border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {data.isToday && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Today
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm dev-mono text-foreground">
                  {data.humanReadable}
                </span>
              </div>
              {data.languages.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Top: {data.languages[0]?.name}
                </div>
              )}
            </div>
          </div>
        );
      }
      return null;
    },
    []
  );

  return (
    <Card className={cn("relative overflow-hidden group", className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-5 w-5" />
            Weekly Activity Timeline
          </CardTitle>

          {showStreak && codingStreak > 0 && (
            <div className="flex items-center gap-1 bg-neon-green-500/10 text-neon-green-500 px-2 py-1 rounded-full">
              <Flame className="h-3 w-3" />
              <span className="text-xs font-medium dev-mono">
                {codingStreak} day{codingStreak !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Chart */}
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <XAxis
                dataKey="dayName"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fill: theme === "dark" ? "#9ca3af" : "#6b7280",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference line for average */}
              {weekStats.average > 0 && (
                <ReferenceLine
                  y={weekStats.average}
                  stroke={theme === "dark" ? "#8b5cf6" : "#7c3aed"}
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />
              )}

              <Bar
                dataKey="totalSeconds"
                radius={[2, 2, 0, 0]}
                fill={theme === "dark" ? "#8b5cf6" : "#7c3aed"}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry)}
                    fillOpacity={entry.opacity}
                    className="hover:brightness-110 transition-all duration-200"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Week Summary */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Total Time</div>
            <div className="text-sm font-medium dev-mono text-foreground">
              {weekStats.totalText}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Avg/Day</div>
            <div className="text-sm font-medium dev-mono text-foreground">
              {weekStats.averageText}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Active Days</div>
            <div className="text-sm font-medium dev-mono text-foreground">
              {weekStats.activeDays}/7
            </div>
          </div>
        </div>

        {/* Day indicators */}
        <div className="flex justify-between text-xs text-muted-foreground">
          {chartData.map((day) => (
            <div key={day.date} className="text-center">
              <div
                className={cn(
                  "w-2 h-2 rounded-full mx-auto mb-1",
                  day.totalSeconds > 0
                    ? day.isToday
                      ? "bg-cyan-500 dark:bg-cyan-400"
                      : "bg-primary"
                    : "bg-muted-foreground/30",
                  day.isToday &&
                    "ring-2 ring-cyan-500 dark:ring-cyan-400 ring-offset-1 ring-offset-background"
                )}
              />
              <span
                className={cn(
                  "dev-mono",
                  day.isToday && "text-cyan-600 dark:text-cyan-400 font-medium"
                )}
              >
                {formatDurationShort(day.totalSeconds)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
