// src/app/debug/page.tsx
"use client";

import React from "react";
import { DebugDashboard } from "@/components/debug/debug-dashboard";
import { ErrorBoundary } from "@/components/error-boundary";

export default function DebugPage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DebugDashboard />
      </div>
    </ErrorBoundary>
  );
}
