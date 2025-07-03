// src/hooks/use-wakatime-debug.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardStats, ApiResponse } from "@/types/wakatime";

// Enhanced hook with detailed logging for debugging
export function useDashboardStatsDebug(
  range: "last_7_days" | "last_30_days" = "last_7_days"
) {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("🐛", logMessage);
    setDebugLogs((prev) => [...prev.slice(-20), logMessage]); // Keep last 20 logs
  }, []);

  const fetchData = useCallback(
    async (customUrl?: string) => {
      try {
        setLoading(true);
        setError(null);
        addDebugLog(`Starting fetch for range: ${range}`);

        const url = customUrl || `/api/wakatime/dashboard?range=${range}`;
        addDebugLog(`Fetching from URL: ${url}`);

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        addDebugLog(
          `Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ApiResponse<DashboardStats> = await response.json();
        addDebugLog(`Response success: ${result.success}`);

        if (!result.success) {
          throw new Error(result.error || "API request failed");
        }

        if (result.data) {
          addDebugLog(
            `Data received - Total time: ${result.data.totalTime.seconds}s`
          );
          addDebugLog(`Languages count: ${result.data.languages.length}`);
          addDebugLog(`Projects count: ${result.data.topProjects.length}`);
          addDebugLog(`Editors count: ${result.data.topEditors.length}`);
          addDebugLog(`Timeline entries: ${result.data.weeklyTimeline.length}`);
          addDebugLog(
            `Best day: ${result.data.bestDay.date} (${result.data.bestDay.totalSeconds}s)`
          );

          // Log individual timeline entries
          result.data.weeklyTimeline.forEach((entry, index) => {
            addDebugLog(
              `Timeline[${index}]: ${entry.date} - ${entry.totalSeconds}s (${entry.humanReadable})`
            );
          });

          // Log best day details
          if (
            result.data.bestDay.totalSeconds === 0 &&
            result.data.totalTime.seconds > 0
          ) {
            addDebugLog("⚠️ Warning: Best day is 0 but total time > 0");
          }

          // Log projects if empty
          if (
            result.data.topProjects.length === 0 &&
            result.data.totalTime.seconds > 0
          ) {
            addDebugLog("⚠️ Warning: No projects found but total time > 0");
          }
        }

        setData(result.data || null);
        setLastUpdated(result.timestamp);
        addDebugLog("✅ Data fetch completed successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        addDebugLog(`❌ Error: ${errorMessage}`);
        console.error("API Error:", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [range, addDebugLog]
  );

  const refreshData = useCallback(() => {
    addDebugLog("🔄 Manual refresh triggered");
    fetchData(`/api/wakatime/dashboard?range=${range}&refresh=true`);
  }, [range, fetchData, addDebugLog]);

  useEffect(() => {
    addDebugLog("🚀 Hook initialized");
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
    refreshData,
    debugLogs,
    clearDebugLogs: () => setDebugLogs([]),
  };
}

// Test raw API endpoints
export function useWakaTimeRawAPI() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("🔍", logMessage);
    setLogs((prev) => [...prev.slice(-50), logMessage]);
  }, []);

  const testStatsAPI = useCallback(async () => {
    addLog("Testing /api/wakatime/stats endpoint");
    try {
      const response = await fetch("/api/wakatime/stats?range=last_7_days");
      const data = await response.json();
      addLog(`Stats API Response: ${JSON.stringify(data, null, 2)}`);
      return data;
    } catch (error) {
      addLog(`Stats API Error: ${error}`);
      throw error;
    }
  }, [addLog]);

  const testSummariesAPI = useCallback(async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    addLog(`Testing /api/wakatime/summaries endpoint (${start} to ${end})`);
    try {
      const response = await fetch(
        `/api/wakatime/summaries?start=${start}&end=${end}`
      );
      const data = await response.json();
      addLog(`Summaries API Response: ${JSON.stringify(data, null, 2)}`);
      return data;
    } catch (error) {
      addLog(`Summaries API Error: ${error}`);
      throw error;
    }
  }, [addLog]);

  const testHealthAPI = useCallback(async () => {
    addLog("Testing /api/wakatime/health endpoint");
    try {
      const response = await fetch("/api/wakatime/health");
      const data = await response.json();
      addLog(`Health API Response: ${JSON.stringify(data, null, 2)}`);
      return data;
    } catch (error) {
      addLog(`Health API Error: ${error}`);
      throw error;
    }
  }, [addLog]);

  return {
    logs,
    clearLogs: () => setLogs([]),
    testStatsAPI,
    testSummariesAPI,
    testHealthAPI,
  };
}
