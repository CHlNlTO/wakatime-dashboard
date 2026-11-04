// src/app/dashboard/loading.tsx
import React from "react";
import { Loader } from "@/components/motion/loader";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="grid size-12 place-items-center rounded-2xl border border-border bg-card text-primary">
          <Loader variant="dot-matrix" size={20} label="Loading dashboard" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-medium text-foreground">Loading dashboard</h2>
          <p className="font-mono text-xs text-muted-foreground">
            GET /api/wakatime/dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
