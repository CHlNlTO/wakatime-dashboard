// src/app/dashboard/loading.tsx
import React from "react";
import { Activity } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated Logo */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
          <Activity className="h-8 w-8 text-primary animate-pulse" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Fetching your coding stats from WakaTime...
          </p>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 w-64 mx-auto">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-electric-violet-500 animate-pulse" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground dev-mono">
            <span>Connecting to API...</span>
            <span>●●●</span>
          </div>
        </div>
      </div>
    </div>
  );
}
