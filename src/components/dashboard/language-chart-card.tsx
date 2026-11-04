// src/components/dashboard/language-chart-card.tsx
"use client";

import React from "react";
import { Code2 } from "lucide-react";
import {
  DonutChart,
  DonutChartCenter,
  DonutChartLegend,
  DonutChartPlot,
  type DonutSegment,
} from "@/components/charts/donut-chart";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { LanguageStats } from "@/types/wakatime";
import { formatDurationShort, getLanguageDisplayName } from "@/lib/utils";

/**
 * WakaTime colors some languages pure white (Text) or near-black, which vanish
 * on one theme or the other. Those fall back to the foreground color.
 */
function readableColor(color: string | undefined): string {
  const hex = color?.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (!hex) return color || "var(--muted-foreground)";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.85 || luminance < 0.08 ? "var(--foreground)" : color!;
}

interface LanguageChartCardProps {
  languages: LanguageStats[];
  rangeLabel?: string;
  className?: string;
  delay?: number;
  maxSegments?: number;
}

export function LanguageChartCard({
  languages,
  rangeLabel,
  className,
  delay,
  maxSegments = 5,
}: LanguageChartCardProps) {
  const segments: DonutSegment[] = React.useMemo(() => {
    const top = languages.slice(0, maxSegments).map((lang) => ({
      id: lang.name,
      name: getLanguageDisplayName(lang.name),
      color: readableColor(lang.color),
      value: lang.totalSeconds,
    }));

    const rest = languages.slice(maxSegments);
    if (rest.length > 0) {
      top.push({
        id: "__others",
        name: `Others (${rest.length})`,
        color: "var(--muted-foreground)",
        value: rest.reduce((sum, lang) => sum + lang.totalSeconds, 0),
      });
    }
    return top;
  }, [languages, maxSegments]);

  return (
    <Panel
      title={<>Languages{rangeLabel ? <span className="text-muted-foreground"> · {rangeLabel}</span> : null}</>}
      delay={delay}
      className={className}
      json={languages.map((lang) => ({
        name: lang.name,
        total_seconds: Math.round(lang.totalSeconds),
        percent: Number(lang.percentage.toFixed(2)),
      }))}
    >
      {segments.length === 0 ? (
        <PanelEmpty icon={<Code2 />}>No languages tracked in this range</PanelEmpty>
      ) : (
        <DonutChart
          segments={segments}
          thickness={18}
          gap={4}
          label="Time per language"
          formatValue={(v) => formatDurationShort(Math.round(v))}
        >
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,13rem)_1fr]">
            <div className="mx-auto w-full max-w-[13rem]">
              <DonutChartPlot>
                <DonutChartCenter totalLabel="total" />
              </DonutChartPlot>
            </div>
            <DonutChartLegend
              renderValue={(segment) => (
                <>
                  <span className="font-mono text-[13px] font-medium">
                    {(segment.share * 100).toFixed(1)}%
                  </span>
                  <span className="ml-2 font-mono text-[13px] text-muted-foreground">
                    {formatDurationShort(Math.round(segment.value))}
                  </span>
                </>
              )}
            />
          </div>
        </DonutChart>
      )}
    </Panel>
  );
}
