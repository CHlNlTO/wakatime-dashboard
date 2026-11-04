"use client";

import React from "react";
import { ExternalLink, Github, RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/motion/button/base";
import { Tooltip } from "@/components/motion/tooltip";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { useGithubContributions } from "@/hooks/use-github-contributions";
import {
  ContributionDay,
  ContributionLevel,
} from "@/types/github";
import { cn } from "@/lib/utils";

const WAKATIME_PROFILE_SETTINGS = "https://wakatime.com/settings/profile";

const LEVEL_CLASS: Record<ContributionLevel, string> = {
  NONE: "bg-muted",
  FIRST_QUARTILE: "bg-success/25",
  SECOND_QUARTILE: "bg-success/45",
  THIRD_QUARTILE: "bg-success/70",
  FOURTH_QUARTILE: "bg-success",
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ContributionGraphCardProps {
  githubUsername: string | null | undefined;
  className?: string;
  delay?: number;
  onRefreshProfile?: () => void;
  isRefreshingProfile?: boolean;
}

export function ContributionGraphCard({
  githubUsername,
  className,
  delay,
  onRefreshProfile,
  isRefreshingProfile = false,
}: ContributionGraphCardProps) {
  const username = githubUsername?.trim() || null;
  const { data, loading, error, refetch } = useGithubContributions(username);

  const monthLabels = React.useMemo(() => {
    if (!data?.weeks.length) return [];

    const labels: Array<{ label: string; weekIndex: number }> = [];
    let lastMonth = -1;

    data.weeks.forEach((week, weekIndex) => {
      const firstDay = week.days.find((day) => day.date);
      if (!firstDay) return;
      const month = new Date(`${firstDay.date}T12:00:00Z`).getUTCMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTH_LABELS[month]!, weekIndex });
        lastMonth = month;
      }
    });

    return labels;
  }, [data]);

  return (
    <Panel
      title="GitHub contributions"
      delay={delay}
      className={className}
      json={
        data
          ? {
              username: data.username,
              totalContributions: data.totalContributions,
              weeks: data.weeks.length,
            }
          : undefined
      }
      actions={
        username ? (
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            @{username}
            <ExternalLink className="size-3" />
          </a>
        ) : null
      }
    >
      {!username && isRefreshingProfile ? (
        <GraphSkeleton />
      ) : !username ? (
        <ConnectGithubState
          onRefreshProfile={onRefreshProfile}
          isRefreshingProfile={isRefreshingProfile}
        />
      ) : loading && !data ? (
        <GraphSkeleton />
      ) : error && !data ? (
        <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-center">
          <PanelEmpty icon={<Github />}>
            {error}
          </PanelEmpty>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground tabular-nums">
                {data.totalContributions.toLocaleString()}
              </span>{" "}
              contributions in the last year
            </p>
            {error ? (
              <span className="text-xs text-warning">Showing cached graph</span>
            ) : null}
          </div>

          <ContributionGrid weekCount={data.weeks.length} monthLabels={monthLabels}>
            {data.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
                {week.days.map((day) => (
                  <DayCell key={day.date} day={day} />
                ))}
              </div>
            ))}
          </ContributionGrid>

          <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
            <span>Less</span>
            {(
              [
                "NONE",
                "FIRST_QUARTILE",
                "SECOND_QUARTILE",
                "THIRD_QUARTILE",
                "FOURTH_QUARTILE",
              ] as ContributionLevel[]
            ).map((level) => (
              <span
                key={level}
                className={cn("size-2.5 rounded-[3px]", LEVEL_CLASS[level])}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

/** Smallest cell before the graph scrolls sideways instead of shrinking. */
const MIN_CELL = 10;
const CELL_GAP = 3;
const DAY_LABEL_WIDTH = 24;

/**
 * Fluid graph: weeks are equal grid columns, so cells grow to fill the card
 * on wide screens (staying square) and the month labels are placed by
 * percentage so they track the columns. Below MIN_CELL it scrolls instead.
 */
function ContributionGrid({
  weekCount,
  monthLabels,
  children,
}: {
  weekCount: number;
  monthLabels: Array<{ label: string; weekIndex: number }>;
  children: React.ReactNode;
}) {
  const minWidth = DAY_LABEL_WIDTH + 6 + weekCount * (MIN_CELL + CELL_GAP);

  return (
    <div className="scrollbar-hide overflow-x-auto">
      <div
        className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-1.5"
        style={{ minWidth }}
      >
        <div />
        <div className="relative h-4 text-[10px] text-muted-foreground">
          {monthLabels.map(({ label, weekIndex }) => (
            <span
              key={`${label}-${weekIndex}`}
              className="absolute top-0"
              style={{ left: `${(weekIndex / weekCount) * 100}%` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Same 7-row grid as the weeks, so labels stay aligned at any size */}
        <div
          className="grid grid-rows-7 gap-[3px] text-[10px] leading-none text-muted-foreground"
          style={{ width: DAY_LABEL_WIDTH }}
        >
          {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
            <span key={i} className="flex items-center">
              {day}
            </span>
          ))}
        </div>

        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function DayCell({ day }: { day: ContributionDay }) {
  const label = formatDayLabel(day);
  // Place by weekday (Sun = row 1) so a partial first or last week lines up
  // with the Mon/Wed/Fri labels instead of stacking from the top.
  const row = new Date(`${day.date}T12:00:00Z`).getUTCDay() + 1;

  return (
    <Tooltip content={label} side="top">
      <span
        className={cn(
          "block aspect-square w-full rounded-[3px] transition-[outline-color] duration-150",
          "outline -outline-offset-1 outline-transparent hover:outline-foreground/40",
          LEVEL_CLASS[day.level]
        )}
        style={{ gridRowStart: row }}
        aria-label={label}
      />
    </Tooltip>
  );
}

function formatDayLabel(day: ContributionDay): string {
  const date = new Date(`${day.date}T12:00:00Z`);
  const formatted = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (day.count === 0) return `No contributions on ${formatted}`;
  return `${day.count} contribution${day.count === 1 ? "" : "s"} on ${formatted}`;
}

function ConnectGithubState({
  onRefreshProfile,
  isRefreshingProfile,
}: {
  onRefreshProfile?: () => void;
  isRefreshingProfile?: boolean;
}) {
  return (
    <div className="flex h-full min-h-44 flex-col items-center justify-center gap-4 text-center">
      <div className="grid size-11 place-items-center rounded-xl border border-dashed border-border-strong text-muted-foreground">
        <Github className="size-5" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          Connect GitHub on WakaTime
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your WakaTime profile doesn&apos;t have a GitHub username yet. Link
          GitHub on WakaTime to show your contribution graph here — no second
          login in this app.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ButtonLink
          href={WAKATIME_PROFILE_SETTINGS}
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
        >
          Connect GitHub on WakaTime
          <ExternalLink className="size-3.5" />
        </ButtonLink>
        {onRefreshProfile ? (
          <Button
            onClick={onRefreshProfile}
            disabled={isRefreshingProfile}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                isRefreshingProfile && "animate-spin"
              )}
            />
            {isRefreshingProfile ? "Checking…" : "I connected it — refresh"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function GraphSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading contributions">
      <div className="skeleton h-4 w-48 rounded-md" />
      <ContributionGrid weekCount={53} monthLabels={[]}>
        {[...Array(53)].map((_, week) => (
          <div key={week} className="grid grid-rows-7 gap-[3px]">
            {[...Array(7)].map((_, day) => (
              <div key={day} className="skeleton aspect-square w-full rounded-[3px]" />
            ))}
          </div>
        ))}
      </ContributionGrid>
    </div>
  );
}
