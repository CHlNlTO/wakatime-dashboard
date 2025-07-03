// src/components/dashboard/time-stat-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface TimeStatCardProps {
  title: string;
  totalTime: {
    seconds: number;
    humanReadable: string;
    dailyAverage: number;
    dailyAverageText: string;
  };
  allTimeStats?: {
    totalSeconds: number;
    humanReadable: string;
    dailyAverage: number;
  };
  trend?: {
    value: number;
    percentage: number;
    isPositive: boolean;
  };
  className?: string;
  icon?: React.ReactNode;
  variant?: "default" | "best-day";
  bestDayDate?: string;
}

export function TimeStatCard({
  title,
  totalTime,
  allTimeStats,
  trend,
  className,
  icon = <Clock className="h-5 w-5" />,
  variant = "default",
  bestDayDate,
}: TimeStatCardProps) {
  const getTrendIcon = (): React.ReactNode => {
    if (!trend) return null;

    if (trend.isPositive) {
      return <TrendingUp className="h-4 w-4 text-neon-green-500" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatBestDayDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const isWeeklyCard = variant === "default" && title.includes("💻");
  const isBestDayCard = variant === "best-day";

  return (
    <Card className={cn("relative overflow-hidden group", className)}>
      {/* Gradient overlay for glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {/* Main time display */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold dev-mono text-foreground">
              {totalTime.humanReadable || "0 mins"}
            </span>
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon()}
                <span
                  className={cn(
                    "dev-mono",
                    trend.isPositive
                      ? "text-neon-green-500"
                      : trend.value < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {/* {getTrendText()} */}
                </span>
              </div>
            )}
          </div>

          {/* Best day specific information */}
          {isBestDayCard && bestDayDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatBestDayDate(bestDayDate)}</span>
            </div>
          )}

          {/* Daily average for weekly cards */}
          {isWeeklyCard && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Daily average:</span>
              <span className="dev-mono font-medium text-foreground">
                {totalTime.dailyAverageText || "0 mins"}
              </span>
            </div>
          )}

          {/* Additional metrics */}
          <div className="pt-2 border-t border-border/50">
            {/* Best day card metrics */}
            {isBestDayCard && (
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="block">Best day</span>
                  <span className="dev-mono text-foreground font-medium">
                    {formatDuration(totalTime.seconds)}
                  </span>
                </div>
                <div>
                  <span className="block">Date</span>
                  <span className="dev-mono text-foreground font-medium">
                    {formatBestDayDate(bestDayDate || "")}
                  </span>
                </div>
              </div>
            )}

            {/* Weekly card all-time stats */}
            {isWeeklyCard && allTimeStats && (
              <div className="text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block mb-1">Since account created</span>
                    <span className="dev-mono text-foreground font-medium">
                      {allTimeStats.humanReadable}
                    </span>
                  </div>
                  <div>
                    <span className="block mb-1">Average</span>
                    <span className="dev-mono text-foreground font-medium">
                      {formatDuration(allTimeStats.dailyAverage)}/day
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Other cards fallback */}
            {!isBestDayCard && !isWeeklyCard && (
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="block">This period</span>
                  <span className="dev-mono text-foreground font-medium">
                    {formatDuration(totalTime.seconds)}
                  </span>
                </div>
                <div>
                  <span className="block">Daily avg</span>
                  <span className="dev-mono text-foreground font-medium">
                    {formatDuration(totalTime.dailyAverage)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Subtle glow effect on hover */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
