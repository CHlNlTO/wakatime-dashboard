// src/app/dashboard/dashboard-client.tsx
"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ApiKeyInput } from "@/components/auth/api-key-input";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useApiKey } from "@/contexts/api-key-context";
import { useDemoMode } from "@/hooks/use-demo-mode";
import {
  useDashboardStats,
  useWakaTimeHealth,
  useAutoRefresh,
} from "@/hooks/use-wakatime";
import { useTheme } from "@/components/theme-provider";
import { AlertCircle, Wifi, WifiOff, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardClientProps {
  range: "last_7_days" | "last_30_days";
}

export default function DashboardClient({ range }: DashboardClientProps) {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { isAuthenticated, clearApiKey } = useApiKey();

  // Demo mode state
  const {
    isDemoMode,
    demoData,
    loading: isDemoLoading,
    error: demoError,
    enableDemoMode,
    disableDemoMode,
    refreshDemoData,
  } = useDemoMode(range);

  // Theme management
  const { theme, toggleTheme } = useTheme();

  // Data fetching (only when authenticated and not in demo mode)
  const {
    data: dashboardData,
    loading: isDashboardLoading,
    error: dashboardError,
    refreshData,
    lastUpdated,
  } = useDashboardStats(range);

  // Health check (only when authenticated and not in demo mode)
  const {
    isHealthy,
    username,
    loading: isHealthLoading,
    error: healthError,
    checkHealth,
  } = useWakaTimeHealth();

  // Auto-refresh functionality
  const { isAutoRefreshEnabled, toggleAutoRefresh } = useAutoRefresh(() => {
    if (isDemoMode) {
      if (!isDemoLoading && !isManualRefreshing) {
        refreshDemoData();
      }
    } else {
      if (!isDashboardLoading && !isManualRefreshing && isAuthenticated) {
        refreshData();
      }
    }
  }, 300000); // 5 minutes

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      if (isDemoMode) {
        await refreshDemoData();
      } else {
        await Promise.all([refreshData(), checkHealth()]);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsManualRefreshing(false);
    }
  };

  // Handle logout / exit demo
  const handleLogout = () => {
    if (isDemoMode) {
      disableDemoMode();
    } else {
      clearApiKey();
    }
  };

  // Handle demo mode activation
  const handleDemoMode = async () => {
    await enableDemoMode();
  };

  // Show API key input if not authenticated and not in demo mode
  if (!isAuthenticated && !isDemoMode) {
    return (
      <ApiKeyInput
        onSuccess={() => {
          // Already handled by context
        }}
        onDemoMode={handleDemoMode}
      />
    );
  }

  // Determine current data and state
  const currentData = isDemoMode ? demoData : dashboardData;
  const currentLoading = isDemoMode ? isDemoLoading : isDashboardLoading;
  const currentError = isDemoMode ? demoError : dashboardError;
  const currentUsername = isDemoMode ? "Clark" : username;

  // Loading state
  const isLoading = currentLoading || isHealthLoading || isManualRefreshing;

  // Error state - Connection error (only for personal mode)
  if (!isDemoMode && healthError && !isHealthy) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            username={currentUsername || undefined}
            lastUpdated={lastUpdated || undefined}
            isRefreshing={isLoading}
            onRefresh={handleRefresh}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            isDark={theme === "dark"}
          />
          <ConnectionErrorCard
            error={healthError}
            onRetry={checkHealth}
            onLogout={handleLogout}
            isRetrying={isHealthLoading}
          />
        </div>
      </div>
    );
  }

  // Error state - Data error
  if (currentError && !currentData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            username={currentUsername || undefined}
            lastUpdated={lastUpdated || undefined}
            isRefreshing={isLoading}
            onRefresh={handleRefresh}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            isDark={theme === "dark"}
          />
          <DataErrorCard
            error={currentError}
            onRetry={isDemoMode ? refreshDemoData : refreshData}
            isRetrying={currentLoading}
            isDemoMode={isDemoMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <DashboardHeader
            username={currentUsername || undefined}
            lastUpdated={lastUpdated || undefined}
            isRefreshing={isLoading}
            onRefresh={handleRefresh}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            isDark={theme === "dark"}
          />

          {/* Demo Banner */}
          {isDemoMode && (
            <DemoBanner demoUser="Clark" onSwitchToPersonal={disableDemoMode} />
          )}

          {/* Auto-refresh Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAutoRefresh}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isAutoRefreshEnabled
                    ? "bg-neon-green-500/10 text-neon-green-500 border border-neon-green-500/20"
                    : "bg-secondary/50 text-muted-foreground border border-border/50"
                }`}
              >
                {isAutoRefreshEnabled ? (
                  <Wifi className="h-3 w-3" />
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
                <span className="dev-mono">
                  Auto-refresh {isAutoRefreshEnabled ? "ON" : "OFF"}
                </span>
              </button>

              <div className="text-sm text-muted-foreground">
                Showing data for:{" "}
                <span className="text-foreground font-medium">
                  {range === "last_7_days" ? "Last 7 days" : "Last 30 days"}
                </span>
                {isDemoMode && (
                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    Demo Mode
                  </span>
                )}
              </div>
            </div>

            {currentError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Some data may be outdated</span>
              </div>
            )}
          </div>

          {/* Dashboard Content */}
          {currentData ? (
            <DashboardLayout data={currentData} isLoading={isLoading} />
          ) : (
            <DashboardLayout
              data={{
                totalTime: {
                  seconds: 0,
                  humanReadable: "0 mins",
                  dailyAverage: 0,
                  dailyAverageText: "0 mins",
                },
                allTimeStats: undefined,
                languages: [],
                weeklyTimeline: [],
                topProjects: [],
                topEditors: [],
                bestDay: {
                  date: "",
                  totalSeconds: 0,
                  text: "0 mins",
                },
                range: {
                  start: "",
                  end: "",
                  timezone: "UTC",
                },
                lastUpdated: "",
              }}
              isLoading={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Connection Error Component
function ConnectionErrorCard({
  error,
  onRetry,
  onLogout,
  isRetrying,
}: {
  error: string;
  onRetry: () => void;
  onLogout: () => void;
  isRetrying: boolean;
}) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
          <WifiOff className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">
          Connection Failed
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Unable to connect to WakaTime API. Please check your API key and
          network connection.
        </p>
        <div className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2 mb-4 dev-mono">
          {error}
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={onRetry} disabled={isRetrying} variant="default">
            {isRetrying ? "Retrying..." : "Retry Connection"}
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Use Different API Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Data Error Component
function DataErrorCard({
  error,
  onRetry,
  isRetrying,
  isDemoMode,
}: {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
  isDemoMode?: boolean;
}) {
  return (
    <Card className="border-orange-500/20 bg-orange-500/5">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-orange-500" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">
          Data Loading Failed
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          We couldn&apos;t load the {isDemoMode ? "demo" : "WakaTime"} data.
          This might be a temporary issue.
        </p>
        <div className="text-xs text-orange-500 bg-orange-500/10 rounded px-3 py-2 mb-4 dev-mono">
          {error}
        </div>
        <Button onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? "Retrying..." : "Retry Loading"}
        </Button>
      </CardContent>
    </Card>
  );
}
