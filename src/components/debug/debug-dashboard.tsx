// src/components/debug/debug-dashboard.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useDashboardStatsDebug,
  useWakaTimeRawAPI,
} from "@/hooks/use-wakatime-debug";
import { Bug, RefreshCw, Terminal, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function DebugDashboard() {
  const [selectedRange, setSelectedRange] = useState<
    "last_7_days" | "last_30_days"
  >("last_7_days");
  const [showRawData, setShowRawData] = useState(false);

  const { data, loading, error, refreshData, debugLogs, clearDebugLogs } =
    useDashboardStatsDebug(selectedRange);

  const {
    logs: apiLogs,
    clearLogs: clearApiLogs,
    testStatsAPI,
    testSummariesAPI,
    testHealthAPI,
  } = useWakaTimeRawAPI();

  const handleTestAPI = async (apiTest: () => Promise<unknown>) => {
    try {
      await apiTest();
    } catch (error) {
      console.error("API test failed:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="h-6 w-6 text-primary" />
          WakaTime Debug Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={selectedRange}
            onChange={(e) =>
              setSelectedRange(e.target.value as "last_7_days" | "last_30_days")
            }
            className="px-3 py-2 border border-border rounded-lg bg-background"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
          </select>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {error ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-neon-green-500" />
              )}
              <span className="text-sm">{error ? "Error" : "Connected"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold dev-mono">
              {data?.totalTime.humanReadable || "0 mins"}
            </div>
            <div className="text-xs text-muted-foreground">
              {data?.totalTime.seconds || 0} seconds
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold dev-mono">
              {data?.bestDay.text || "0 mins"}
            </div>
            <div className="text-xs text-muted-foreground">
              {data?.bestDay.date || "No date"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div>Languages: {data?.languages.length || 0}</div>
              <div>Projects: {data?.topProjects.length || 0}</div>
              <div>Timeline: {data?.weeklyTimeline.length || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>API Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleTestAPI(testHealthAPI)}
            >
              Test Health API
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTestAPI(testStatsAPI)}
            >
              Test Stats API
            </Button>
            <Button
              variant="outline"
              onClick={() => handleTestAPI(testSummariesAPI)}
            >
              Test Summaries API
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? "Hide" : "Show"} Raw Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-destructive bg-destructive/10 p-3 rounded overflow-auto">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Raw Data Display */}
      {showRawData && data && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Debug Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Dashboard Debug Logs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearDebugLogs}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-auto">
              {debugLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground">No logs yet</div>
              ) : (
                debugLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono break-all">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              API Test Logs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearApiLogs}>
              Clear
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-auto">
              {apiLogs.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No API tests run
                </div>
              ) : (
                apiLogs.map((log, index) => (
                  <div key={index} className="text-xs font-mono break-all">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Data Breakdown */}
      {data?.weeklyTimeline && data.weeklyTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timeline Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.weeklyTimeline.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary/30 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{entry.dayName}</span>
                    <span className="text-sm text-muted-foreground">
                      {entry.date}
                    </span>
                    {entry.isToday && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium dev-mono">
                      {entry.humanReadable}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.totalSeconds}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
