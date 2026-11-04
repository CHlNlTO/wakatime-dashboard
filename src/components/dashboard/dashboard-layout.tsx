// src/components/dashboard/dashboard-layout.tsx
"use client";

import React from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { BestDayCard, OverviewCard } from "./time-stat-card";
import { LanguageChartCard } from "./language-chart-card";
import { WeeklyTimelineCard } from "./weekly-timeline-card";
import { ProjectsListCard } from "./projects-list-card";
import { EditorsListCard } from "./editors-list-card";
import { ComingSoonCard } from "./coming-soon-card";
import { ContributionGraphCard } from "./contribution-graph-card";
import { SortableTile } from "@/components/ui/sortable-tile";
import { type CardId, DEFAULT_ORDER } from "@/hooks/use-card-layout";
import { DashboardStats } from "@/types/wakatime";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  data: DashboardStats;
  rangeLabel?: string;
  className?: string;
  isLoading?: boolean;
  githubUsername?: string | null;
  onRefreshGithubProfile?: () => void;
  isRefreshingGithubProfile?: boolean;
  /** Tile order; defaults to DEFAULT_ORDER. */
  order?: readonly CardId[];
  /** Called when a tile is dropped on another tile's slot. */
  onMoveCard?: (activeId: CardId, overId: CardId) => void;
}

/** Entrance stagger between cards, in seconds. */
const STEP = 0.06;

/*
 * One 6-column grid (2 on tablets, 1 on phones). Each card keeps its own
 * width wherever it is moved; only the order changes.
 */
const TILE_SPAN: Record<CardId, string> = {
  overview: "md:col-span-2 lg:col-span-4",
  "best-day": "md:col-span-2 lg:col-span-2",
  contributions: "md:col-span-2 lg:col-span-6",
  languages: "md:col-span-2 lg:col-span-6 xl:col-span-3",
  activity: "md:col-span-2 lg:col-span-6 xl:col-span-3",
  projects: "lg:col-span-2",
  editors: "lg:col-span-2",
  roadmap: "md:col-span-2 lg:col-span-2",
};

const TILE_TITLE: Record<CardId, string> = {
  overview: "Time coded",
  "best-day": "Best day",
  contributions: "Contributions",
  languages: "Languages",
  activity: "Activity",
  projects: "Top projects",
  editors: "Editors",
  roadmap: "Roadmap",
};

const GRID = "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6";

export function DashboardLayout({
  data,
  rangeLabel = "Last 7 days",
  className,
  isLoading = false,
  githubUsername = null,
  onRefreshGithubProfile,
  isRefreshingGithubProfile = false,
  order = DEFAULT_ORDER,
  onMoveCard,
}: DashboardLayoutProps) {
  const sensors = useSensors(
    // A short travel before a drag starts, so clicks in the header still work.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Long-press on touch, so a swipe over a header still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (isLoading) {
    return <DashboardSkeleton order={order} className={className} />;
  }

  const renderCard = (id: CardId, delay: number): React.ReactNode => {
    switch (id) {
      case "overview":
        return (
          <OverviewCard
            totalTime={data.totalTime}
            allTimeStats={data.allTimeStats}
            timeline={data.weeklyTimeline}
            rangeLabel={rangeLabel}
            delay={delay}
          />
        );
      case "best-day":
        return (
          <BestDayCard
            bestDay={data.bestDay}
            totalSeconds={data.totalTime.seconds}
            delay={delay}
          />
        );
      case "contributions":
        return (
          <ContributionGraphCard
            githubUsername={githubUsername}
            delay={delay}
            onRefreshProfile={onRefreshGithubProfile}
            isRefreshingProfile={isRefreshingGithubProfile}
          />
        );
      case "languages":
        return <LanguageChartCard languages={data.languages} delay={delay} />;
      case "activity":
        return <WeeklyTimelineCard weeklyData={data.weeklyTimeline} delay={delay} />;
      case "projects":
        return <ProjectsListCard projects={data.topProjects} delay={delay} />;
      case "editors":
        return <EditorsListCard editors={data.topEditors} delay={delay} />;
      case "roadmap":
        return <ComingSoonCard delay={delay} />;
    }
  };

  // No stray text selection across cards while a tile is being dragged.
  const setDragging = (on: boolean) =>
    document.documentElement.classList.toggle("select-none", on);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(false);
    if (over && active.id !== over.id) {
      onMoveCard?.(active.id as CardId, over.id as CardId);
    }
  };

  const title = (id: string | number) => TILE_TITLE[id as CardId] ?? "Card";
  const position = (id: string | number) => order.indexOf(id as CardId) + 1;

  return (
    <DndContext
      id="dashboard-cards"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragging(false)}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${title(active.id)}. Use the arrow keys to move it, Space to drop, Escape to cancel.`,
          onDragOver: ({ active, over }) =>
            over
              ? `${title(active.id)} is over position ${position(over.id)} of ${order.length}.`
              : `${title(active.id)} is no longer over a position.`,
          onDragEnd: ({ active, over }) =>
            over
              ? `Dropped ${title(active.id)} at position ${position(over.id)} of ${order.length}.`
              : `Dropped ${title(active.id)}.`,
          onDragCancel: ({ active }) =>
            `Cancelled. ${title(active.id)} returned to its place.`,
        },
      }}
    >
      <SortableContext items={order as CardId[]} strategy={rectSortingStrategy}>
        <div className={cn(GRID, className)}>
          {order.map((id, index) => (
            <SortableTile key={id} id={id} className={TILE_SPAN[id]}>
              {renderCard(id, index * STEP)}
            </SortableTile>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton: same nested-card silhouette and tile order, shimmering           */
/* -------------------------------------------------------------------------- */

function SkeletonPanel({
  className,
  bodyHeight,
  children,
}: {
  className?: string;
  bodyHeight: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-[20px] border border-border bg-card p-1.5", className)}>
      <div className="flex h-11 items-center pb-2 pl-3">
        <div className="skeleton h-3.5 w-28 rounded-md" />
      </div>
      <div
        className={cn("rounded-[14px] border border-border bg-panel p-5", bodyHeight)}
      >
        {children}
      </div>
    </div>
  );
}

function Bar({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

function ListSkeleton() {
  return (
    <div className="space-y-5">
      {[...Array(4)].map((_, j) => (
        <div key={j} className="flex items-center gap-3">
          <div className="skeleton size-7 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bar className="h-3.5 w-3/4" />
            <Bar className="h-1 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

const SKELETON: Record<CardId, { height: string; body: React.ReactNode }> = {
  overview: {
    height: "h-[236px]",
    body: (
      <>
        <div className="space-y-3">
          <Bar className="h-14 w-56" />
          <Bar className="h-3.5 w-44" />
        </div>
        <Bar className="mt-8 h-16 w-full rounded-xl" />
      </>
    ),
  },
  "best-day": {
    height: "h-[236px]",
    body: (
      <>
        <div className="space-y-3">
          <Bar className="h-12 w-40" />
          <Bar className="h-3.5 w-24" />
        </div>
        <Bar className="mt-16 h-1.5 w-full" />
      </>
    ),
  },
  contributions: {
    height: "h-[240px]",
    body: (
      <>
        <Bar className="h-4 w-48" />
        <div
          className="mt-5 grid gap-[3px]"
          style={{ gridTemplateColumns: "repeat(53, minmax(0, 1fr))" }}
        >
          {[...Array(53 * 4)].map((_, i) => (
            <div key={i} className="skeleton aspect-square w-full rounded-[3px]" />
          ))}
        </div>
      </>
    ),
  },
  languages: {
    height: "h-[340px]",
    body: (
      <div className="flex h-full items-center gap-8">
        <div className="skeleton aspect-square w-44 rounded-full" />
        <div className="flex-1 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Bar key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    ),
  },
  activity: {
    height: "h-[340px]",
    body: (
      <>
        <div className="flex h-[190px] items-end gap-3">
          {[40, 70, 55, 90, 30, 65, 80].map((h, i) => (
            <div key={i} className="skeleton flex-1 rounded-t-md" style={{ height: `${h}%` }} />
          ))}
        </div>
        <Bar className="mt-5 h-16 w-full rounded-xl" />
      </>
    ),
  },
  projects: { height: "h-[300px]", body: <ListSkeleton /> },
  editors: { height: "h-[300px]", body: <ListSkeleton /> },
  roadmap: { height: "h-[300px]", body: <ListSkeleton /> },
};

function DashboardSkeleton({
  order,
  className,
}: {
  order: readonly CardId[];
  className?: string;
}) {
  return (
    <div className={cn(GRID, className)} aria-busy="true" aria-label="Loading dashboard">
      {order.map((id) => (
        <SkeletonPanel key={id} className={TILE_SPAN[id]} bodyHeight={SKELETON[id].height}>
          {SKELETON[id].body}
        </SkeletonPanel>
      ))}
    </div>
  );
}
