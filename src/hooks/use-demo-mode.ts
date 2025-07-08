// src/hooks/use-demo-mode.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardStats } from "@/types/wakatime";
import { DemoResponse, DemoModeHook } from "@/types/demo";

export function useDemoMode(
  range: "last_7_days" | "last_30_days" = "last_7_days"
): DemoModeHook {
  const [state, setState] = useState<{
    isDemoMode: boolean;
    demoData: DashboardStats | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
  }>({
    isDemoMode: false,
    demoData: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchDemoData = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await fetch(`/api/wakatime/demo?range=${range}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result: DemoResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch demo data");
      }

      setState((prev) => ({
        ...prev,
        demoData: result.data || null,
        lastUpdated: result.timestamp,
        loading: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error("Demo data fetch error:", errorMessage);
    }
  }, [range]);

  const enableDemoMode = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isDemoMode: true }));
    await fetchDemoData();
  }, [fetchDemoData]);

  const disableDemoMode = useCallback((): void => {
    setState({
      isDemoMode: false,
      demoData: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  const refreshDemoData = useCallback((): void => {
    if (state.isDemoMode) {
      fetchDemoData();
    }
  }, [state.isDemoMode, fetchDemoData]);

  // Auto-fetch demo data when demo mode is enabled and range changes
  useEffect(() => {
    if (state.isDemoMode && !state.demoData && !state.loading) {
      fetchDemoData();
    }
  }, [state.isDemoMode, state.demoData, state.loading, fetchDemoData]);

  return {
    isDemoMode: state.isDemoMode,
    demoData: state.demoData,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    enableDemoMode,
    disableDemoMode,
    refreshDemoData,
  };
}
