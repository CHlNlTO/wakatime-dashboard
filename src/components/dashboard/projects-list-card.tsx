// src/components/dashboard/projects-list-card.tsx
"use client";

import React from "react";
import { Folder, FolderGit2 } from "lucide-react";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { MeterList } from "./meter-list";
import { ProjectStats } from "@/types/wakatime";
import { formatDurationShort } from "@/lib/utils";

interface ProjectsListCardProps {
  projects: ProjectStats[];
  className?: string;
  maxItems?: number;
  delay?: number;
}

export function ProjectsListCard({
  projects,
  className,
  maxItems = 5,
  delay,
}: ProjectsListCardProps) {
  const hidden = Math.max(projects.length - maxItems, 0);

  return (
    <Panel
      title="Top projects"
      delay={delay}
      className={className}
      json={projects.map((p) => ({
        name: p.name,
        total_seconds: Math.round(p.totalSeconds),
        percent: Number(p.percentage.toFixed(2)),
      }))}
      bodyClassName="flex flex-col"
    >
      {projects.length === 0 ? (
        <PanelEmpty icon={<Folder />}>No projects tracked in this range</PanelEmpty>
      ) : (
        <>
          <MeterList
            items={projects.slice(0, maxItems).map((p) => ({
              id: p.name,
              name: p.name,
              detail: formatDurationShort(Math.round(p.totalSeconds)),
              percentage: p.percentage,
              icon: <FolderGit2 />,
            }))}
          />
          {hidden > 0 ? (
            <p className="mt-auto pt-3 font-mono text-xs text-muted-foreground">
              + {hidden} more project{hidden === 1 ? "" : "s"} · see JSON view
            </p>
          ) : null}
        </>
      )}
    </Panel>
  );
}
