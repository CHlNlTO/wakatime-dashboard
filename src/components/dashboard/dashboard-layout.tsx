// src/components/dashboard/dashboard-layout.tsx
"use client";

import React from "react";
import { TimeStatCard } from "./time-stat-card";
import { LanguageChartCard } from "./language-chart-card";
import { WeeklyTimelineCard } from "./weekly-timeline-card";
import { ProjectsListCard } from "./projects-list-card";
import { EditorsListCard } from "./editors-list-card";
import { ComingSoonCard } from "./coming-soon-card";
import { DashboardStats } from "@/types/wakatime";
import { cn } from "@/lib/utils";
import { Clock, Flame } from "lucide-react";

interface DashboardLayoutProps {
  data: DashboardStats;
  className?: string;
  isLoading?: boolean;
}

export function DashboardLayout({
  data,
  className,
  isLoading = false,
}: DashboardLayoutProps) {
  if (isLoading) {
    return <DashboardSkeleton className={className} />;
  }

  // Calculate trend data (placeholder - would need historical data to calculate real trends)
  const getTrend = () => {
    // This would normally come from comparing with previous week's data
    const randomTrend = Math.random() * 30 - 15; // Random between -15 and +15
    return {
      value: randomTrend,
      percentage: Math.abs(randomTrend),
      isPositive: randomTrend > 0,
    };
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Row - Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Spent Card - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <TimeStatCard
            title="💻 Time Spent Coding This Week"
            totalTime={data.totalTime}
            allTimeStats={data.allTimeStats}
            trend={getTrend()}
            icon={<Clock className="h-5 w-5" />}
            variant="default"
          />
        </div>

        {/* Best Day Card */}
        <div>
          <TimeStatCard
            title="🔥 Best Day"
            totalTime={{
              seconds: data.bestDay.totalSeconds,
              humanReadable: data.bestDay.text || "0 mins",
              dailyAverage: data.bestDay.totalSeconds,
              dailyAverageText: data.bestDay.text || "0 mins",
            }}
            className="h-full"
            icon={<Flame className="h-5 w-5" />}
            variant="best-day"
            bestDayDate={data.bestDay.date}
          />
        </div>
      </div>

      {/* Second Row - Charts and Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Languages Chart */}
        <LanguageChartCard languages={data.languages} />

        {/* Weekly Timeline */}
        <WeeklyTimelineCard weeklyData={data.weeklyTimeline} />
      </div>

      {/* Third Row - Lists and Coming Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <ProjectsListCard projects={data.topProjects} />

        {/* Editors List */}
        <EditorsListCard editors={data.topEditors} />

        {/* Coming Soon Features */}
        <ComingSoonCard />
      </div>
    </div>
  );
}

// Loading skeleton component
function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 animate-pulse", className)}>
      {/* Top Row Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="metric-card h-[180px]">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        </div>
        <div>
          <div className="metric-card h-[180px]">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Skeletons */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="metric-card h-[400px]">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-48 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
        <div className="metric-card h-[400px]">
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Third Row Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="metric-card h-[300px]">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2 bg-muted rounded w-1/2" />
                    </div>
                    <div className="w-8 h-2 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
