// src/components/dashboard/language-chart-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Code2, MoreHorizontal } from "lucide-react";
import { LanguageStats } from "@/types/wakatime";
import {
  cn,
  formatPercentage,
  formatDuration,
  getLanguageDisplayName,
} from "@/lib/utils";

interface LanguageChartCardProps {
  languages: LanguageStats[];
  className?: string;
  showLegend?: boolean;
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  humanReadable: string;
}

export function LanguageChartCard({
  languages,
  className,
}: LanguageChartCardProps) {
  // Transform data for the chart, showing top 5 languages and grouping others
  const chartData: ChartDataItem[] = React.useMemo(() => {
    const topLanguages = languages.slice(0, 5);
    const otherLanguages = languages.slice(5);

    const data = topLanguages.map((lang) => ({
      name: getLanguageDisplayName(lang.name),
      value: lang.totalSeconds,
      percentage: lang.percentage,
      color: lang.color,
      humanReadable: formatDuration(lang.totalSeconds),
    }));

    // Add "Others" category if there are more than 5 languages
    if (otherLanguages.length > 0) {
      const othersTotalSeconds = otherLanguages.reduce(
        (sum, lang) => sum + lang.totalSeconds,
        0
      );
      const othersPercentage = otherLanguages.reduce(
        (sum, lang) => sum + lang.percentage,
        0
      );

      data.push({
        name: "Others",
        value: othersTotalSeconds,
        percentage: othersPercentage,
        color: "#6b7280",
        humanReadable: formatDuration(othersTotalSeconds),
      });
    }

    return data;
  }, [languages]);

  const CustomTooltip = React.useCallback(
    ({
      active,
      payload,
    }: {
      active?: boolean;
      payload?: Array<{ payload: ChartDataItem }>;
    }) => {
      if (active && payload && payload.length) {
        const data = payload[0]!.payload;
        return (
          <div className="glass-effect rounded-lg p-3 border border-border/50 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: data.color }}
              />
              <span className="font-medium text-foreground">{data.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="dev-mono">{data.humanReadable}</div>
              <div>{formatPercentage(data.percentage)}</div>
            </div>
          </div>
        );
      }
      return null;
    },
    []
  );

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Code2 className="h-5 w-5" />
          Top Languages This Week
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="transparent"
                      className="hover:brightness-110 transition-all duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Language List */}
          <div className="space-y-3">
            {chartData.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground truncate">
                      {lang.name}
                    </div>
                    <div className="text-xs text-muted-foreground dev-mono">
                      {lang.humanReadable}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium dev-mono text-foreground">
                    {formatPercentage(lang.percentage)}
                  </div>
                </div>
              </div>
            ))}

            {languages.length > 5 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                <MoreHorizontal className="h-3 w-3" />
                <span>+{languages.length - 5} more languages</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-electric-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
