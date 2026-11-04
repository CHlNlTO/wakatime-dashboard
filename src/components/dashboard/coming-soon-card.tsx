// src/components/dashboard/coming-soon-card.tsx
"use client";

import React from "react";
import { Activity, Sun, Target } from "lucide-react";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

interface ComingSoonFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  eta?: string;
}

interface ComingSoonCardProps {
  className?: string;
  features?: ComingSoonFeature[];
  delay?: number;
}

const defaultFeatures: ComingSoonFeature[] = [
  {
    icon: <Sun />,
    title: "Most productive hours",
    description: "Find your peak coding hours and plan around them",
    eta: "soon",
  },
  {
    icon: <Activity />,
    title: "Productivity trends",
    description: "Week-over-week patterns and where time goes",
    eta: "next",
  },
  {
    icon: <Target />,
    title: "Goal tracking",
    description: "Daily and weekly coding goals with progress",
    eta: "later",
  },
];

export function ComingSoonCard({
  className,
  features = defaultFeatures,
  delay,
}: ComingSoonCardProps) {
  return (
    <Panel title="Roadmap" delay={delay} className={className}>
      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-border">
        {features.map((feature) => (
          <li key={feature.title} className="relative flex gap-3">
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-lg border border-dashed border-border-strong bg-panel text-muted-foreground",
                "[&_svg]:size-3.5"
              )}
            >
              {feature.icon}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-medium text-foreground">
                  {feature.title}
                </h4>
                {feature.eta ? (
                  <AnimatedBadge status="neutral" size="sm" showIcon={false} className="font-mono">
                    {feature.eta}
                  </AnimatedBadge>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
