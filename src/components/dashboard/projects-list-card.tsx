// src/components/dashboard/projects-list-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, GitBranch, ExternalLink, MoreVertical } from "lucide-react";
import { ProjectStats } from "@/types/wakatime";
import { cn, formatPercentage, truncateText } from "@/lib/utils";

interface ProjectsListCardProps {
  projects: ProjectStats[];
  className?: string;
  maxItems?: number;
  showViewAll?: boolean;
}

export function ProjectsListCard({
  projects,
  className,
  maxItems = 5,
  showViewAll = true,
}: ProjectsListCardProps) {
  const displayProjects = projects.slice(0, maxItems);
  const hasMoreProjects = projects.length > maxItems;

  const getProjectIcon = (projectName: string): React.ReactNode => {
    // Special project icons based on common project names
    const iconMap: Record<string, React.ReactNode> = {
      website: <ExternalLink className="h-3 w-3" />,
      api: <GitBranch className="h-3 w-3" />,
      frontend: <ExternalLink className="h-3 w-3" />,
      backend: <GitBranch className="h-3 w-3" />,
      mobile: <ExternalLink className="h-3 w-3" />,
    };

    const lowercaseName = projectName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowercaseName.includes(key)) {
        return icon;
      }
    }

    return <Folder className="h-3 w-3" />;
  };

  const getProjectColor = (index: number): string => {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--cyber-blue-500))",
      "hsl(var(--electric-violet-500))",
      "hsl(var(--neon-green-500))",
      "hsl(var(--muted-foreground))",
    ];
    return colors[index % colors.length]!;
  };

  const handleViewAll = () => {
    console.log("View all projects clicked");
  };

  const handleProjectMenu = (projectName: string) => {
    console.log("Project menu clicked for:", projectName);
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Folder className="h-5 w-5" />
            Top Projects
          </CardTitle>

          {showViewAll && hasMoreProjects && (
            <button
              onClick={handleViewAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors dev-mono"
            >
              View All ({projects.length})
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {displayProjects.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No projects tracked this week</p>
          </div>
        ) : (
          <>
            {displayProjects.map((project, index) => (
              <div
                key={project.name}
                className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Project icon and rank */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center justify-center w-6 h-6 text-xs font-bold dev-mono text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div
                      className="text-muted-foreground"
                      style={{ color: getProjectColor(index) }}
                    >
                      {getProjectIcon(project.name)}
                    </div>
                  </div>

                  {/* Project details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">
                        {truncateText(project.name, 30)}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="dev-mono">{project.humanReadable}</span>
                    </div>
                  </div>
                </div>

                {/* Stats and progress */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium dev-mono text-foreground">
                      {formatPercentage(project.percentage)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      of total
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(project.percentage, 100)}%`,
                        backgroundColor: getProjectColor(index),
                      }}
                    />
                  </div>

                  {/* Menu button */}
                  <button
                    onClick={() => handleProjectMenu(project.name)}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                  >
                    <MoreVertical className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}

            {/* Show more indicator */}
            {hasMoreProjects && (
              <div className="flex items-center justify-center pt-2 border-t border-border/50">
                <button
                  onClick={handleViewAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <span>+{projects.length - maxItems} more projects</span>
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-neon-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
