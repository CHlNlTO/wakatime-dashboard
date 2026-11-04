// src/app/dashboard/dashboard-client.tsx
"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ApiKeyInput } from "@/components/auth/api-key-input";
import { DemoBanner } from "@/components/demo/demo-banner";
import { useApiKey } from "@/contexts/api-key-context";
import { useDemoMode } from "@/hooks/use-demo-mode";
import { useCardLayout } from "@/hooks/use-card-layout";
import {
  useDashboardStats,
  useWakaTimeHealth,
  useAutoRefresh,
} from "@/hooks/use-wakatime";
import { AlertCircle, LogOut, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { Panel } from "@/components/ui/panel";
import { SettingsDialog } from "@/components/settings/settings-dialog";

interface DashboardClientProps {
  range: "last_7_days" | "last_30_days";
}

export default function DashboardClient({ range }: DashboardClientProps) {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const cardLayout = useCardLayout();
  const { isAuthenticated, clearApiKey } = useApiKey();

  // Demo mode state
  const {
    isDemoMode,
    demoData,
    githubUsername: demoGithubUsername,
    loading: isDemoLoading,
    error: demoError,
    enableDemoMode,
    disableDemoMode,
    refreshDemoData,
  } = useDemoMode(range);

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
    githubUsername: personalGithubUsername,
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
  const currentGithubUsername = isDemoMode
    ? demoGithubUsername
    : personalGithubUsername;

  // Loading state
  const isLoading = currentLoading || isHealthLoading || isManualRefreshing;

  const rangeLabel = range === "last_7_days" ? "Last 7 days" : "Last 30 days";

  const header = (
    <DashboardHeader
      onResetLayout={cardLayout.isCustom ? cardLayout.reset : undefined}
      settingsSlot={
        <SettingsDialog
          isDemoMode={isDemoMode}
          health={{
            isHealthy,
            username,
            githubUsername: personalGithubUsername,
            loading: isHealthLoading,
            error: healthError,
          }}
        />
      }
      username={currentUsername || undefined}
      lastUpdated={lastUpdated || undefined}
      isRefreshing={isLoading}
      onRefresh={handleRefresh}
      onLogout={handleLogout}
      isDemoMode={isDemoMode}
      hasError={Boolean(currentError)}
      rangeLabel={rangeLabel}
      autoRefresh={{ enabled: isAutoRefreshEnabled, onToggle: toggleAutoRefresh }}
    />
  );

  // Error state - Connection error (only for personal mode)
  if (!isDemoMode && healthError && !isHealthy) {
    return (
      <PageShell>
        {header}
        <ErrorPanel
          title="Connection failed"
          icon={<WifiOff />}
          message="Unable to reach the WakaTime API. Check your API key and network connection."
          detail={healthError}
        >
          <Button onClick={checkHealth} disabled={isHealthLoading} size="sm">
            <RefreshCw className={isHealthLoading ? "size-3.5 animate-spin" : "size-3.5"} />
            {isHealthLoading ? "Retrying…" : "Retry connection"}
          </Button>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="size-3.5" />
            Use a different key
          </Button>
        </ErrorPanel>
      </PageShell>
    );
  }

  // Error state - Data error
  if (currentError && !currentData) {
    return (
      <PageShell>
        {header}
        <ErrorPanel
          title="Data loading failed"
          icon={<AlertCircle />}
          message={`We couldn't load the ${isDemoMode ? "demo" : "WakaTime"} data. This is usually temporary.`}
          detail={currentError}
        >
          <Button
            onClick={isDemoMode ? refreshDemoData : refreshData}
            disabled={currentLoading}
            size="sm"
          >
            <RefreshCw className={currentLoading ? "size-3.5 animate-spin" : "size-3.5"} />
            {currentLoading ? "Retrying…" : "Retry"}
          </Button>
        </ErrorPanel>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {header}

      {isDemoMode && (
        <DemoBanner demoUser="Clark" onSwitchToPersonal={disableDemoMode} />
      )}

      {currentError && currentData ? (
        <div className="flex items-center gap-2 px-1 text-sm text-warning">
          <AlertCircle className="size-4" />
          <span>Showing cached data. The last refresh failed.</span>
        </div>
      ) : null}

      <DashboardLayout
        data={currentData ?? EMPTY_STATS}
        rangeLabel={rangeLabel}
        isLoading={!currentData}
        githubUsername={currentGithubUsername}
        onRefreshGithubProfile={
          isDemoMode ? refreshDemoData : () => void checkHealth()
        }
        isRefreshingGithubProfile={isDemoMode ? isDemoLoading : isHealthLoading}
        order={cardLayout.order}
        onMoveCard={cardLayout.move}
      />
    </PageShell>
  );
}

const EMPTY_STATS = {
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
  bestDay: { date: "", totalSeconds: 0, text: "0 mins" },
  range: { start: "", end: "", timezone: "UTC" },
  lastUpdated: "",
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="bg-dot-grid pointer-events-none fixed inset-x-0 top-0 h-[520px]" />
      <main className="relative mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function ErrorPanel({
  title,
  icon,
  message,
  detail,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  message: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <Panel title={title} className="mx-auto max-w-2xl">
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="grid size-11 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive [&_svg]:size-5">
          {icon}
        </div>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
        <pre className="w-full overflow-x-auto rounded-xl border border-border bg-card px-3 py-2 text-left font-mono text-xs text-destructive">
          {detail}
        </pre>
        <div className="flex flex-wrap justify-center gap-2">{children}</div>
      </div>
    </Panel>
  );
}
