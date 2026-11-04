// src/components/dashboard/editors-list-card.tsx
"use client";

import React from "react";
import { Code, Monitor, SquareTerminal } from "lucide-react";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { MeterList } from "./meter-list";
import { EditorStats } from "@/types/wakatime";
import { formatDurationShort, getEditorDisplayName } from "@/lib/utils";

interface EditorsListCardProps {
  editors: EditorStats[];
  className?: string;
  maxItems?: number;
  delay?: number;
}

function editorIcon(name: string): React.ReactNode {
  const n = name.toLowerCase();
  if (n.includes("vim") || n.includes("emacs") || n.includes("terminal")) {
    return <SquareTerminal />;
  }
  if (n.includes("code") || n.includes("cursor") || n.includes("zed")) {
    return <Code />;
  }
  return <Monitor />;
}

export function EditorsListCard({
  editors,
  className,
  maxItems = 5,
  delay,
}: EditorsListCardProps) {
  return (
    <Panel
      title="Editors"
      delay={delay}
      className={className}
      json={editors.map((e) => ({
        name: e.name,
        total_seconds: Math.round(e.totalSeconds),
        percent: Number(e.percentage.toFixed(2)),
      }))}
    >
      {editors.length === 0 ? (
        <PanelEmpty icon={<Monitor />}>No editors tracked in this range</PanelEmpty>
      ) : (
        <MeterList
          color="var(--violet)"
          items={editors.slice(0, maxItems).map((e) => ({
            id: e.name,
            name: getEditorDisplayName(e.name),
            detail: formatDurationShort(Math.round(e.totalSeconds)),
            percentage: e.percentage,
            icon: editorIcon(e.name),
          }))}
        />
      )}
    </Panel>
  );
}
