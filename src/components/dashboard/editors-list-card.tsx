// src/components/dashboard/editors-list-card.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Code, Settings } from "lucide-react";
import { EditorStats } from "@/types/wakatime";
import { cn, formatPercentage, getEditorDisplayName } from "@/lib/utils";

interface EditorsListCardProps {
  editors: EditorStats[];
  className?: string;
  maxItems?: number;
}

export function EditorsListCard({
  editors,
  className,
  maxItems = 5,
}: EditorsListCardProps) {
  const displayEditors = editors.slice(0, maxItems);

  const getEditorColorClass = (index: number): string => {
    const colorClasses = [
      "text-primary",
      "text-cyber-blue-500",
      "text-electric-violet-500",
      "text-neon-green-500",
      "text-muted-foreground",
    ];
    return colorClasses[index % colorClasses.length]!;
  };

  const getEditorIcon = (editorName: string): React.ReactNode => {
    const name = editorName.toLowerCase();

    if (name.includes("code") || name.includes("vscode")) {
      return <Code className="h-4 w-4" />;
    }
    if (name.includes("vim") || name.includes("neovim")) {
      return <Monitor className="h-4 w-4" />;
    }
    if (
      name.includes("intellij") ||
      name.includes("webstorm") ||
      name.includes("pycharm")
    ) {
      return <Settings className="h-4 w-4" />;
    }

    return <Monitor className="h-4 w-4" />;
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-electric-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Monitor className="h-5 w-5" />
          Editors Used
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-3">
        {displayEditors.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No editors tracked this week</p>
          </div>
        ) : (
          <>
            {displayEditors.map((editor, index) => (
              <div
                key={editor.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Editor icon and emoji */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-lg"
                      role="img"
                      aria-label={editor.name}
                    >
                      {editor.icon || "💻"}
                    </span>
                    <div
                      className={cn(
                        "transition-colors",
                        getEditorColorClass(index)
                      )}
                    >
                      {getEditorIcon(editor.name)}
                    </div>
                  </div>

                  {/* Editor details */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground truncate">
                      {getEditorDisplayName(editor.name)}
                    </h4>
                    <div className="text-xs text-muted-foreground dev-mono">
                      {editor.humanReadable}
                    </div>
                  </div>
                </div>

                {/* Usage percentage */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium dev-mono text-foreground">
                      {formatPercentage(editor.percentage)}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getEditorColorClass(index).replace("text-", "bg-")
                      )}
                      style={{ width: `${Math.min(editor.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-electric-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
