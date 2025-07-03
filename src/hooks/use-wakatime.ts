// src/hooks/use-wakatime.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiKey } from "@/contexts/api-key-context";
import {
  DashboardStats,
  ApiResponse,
  StatsParams,
  SummariesParams,
} from "@/types/wakatime";

// Generic hook for API calls
function useApi<T>(url: string, options?: RequestInit) {
  const { apiKey, isAuthenticated } = useApiKey();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(
    async (customUrl?: string) => {
      if (!isAuthenticated || !apiKey) {
        setData(null);
        setLoading(false);
        setError("No API key provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(customUrl || url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            "X-WakaTime-API-Key": apiKey,
            ...options?.headers,
          },
        });

        const result: ApiResponse<T> = await response.json();

        if (!result.success) {
          throw new Error(result.error || "API request failed");
        }

        setData(result.data || null);
        setLastUpdated(result.timestamp);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("API Error:", errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [url, options, apiKey, isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      fetchData();
    } else {
      setData(null);
      setLoading(false);
      setError(null);
    }
  }, [fetchData, isAuthenticated, apiKey]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
  };
}

// Hook for dashboard data
export function useDashboardStats(
  range: "last_7_days" | "last_30_days" = "last_7_days"
) {
  const { data, loading, error, lastUpdated, refetch } = useApi<DashboardStats>(
    `/api/wakatime/dashboard?range=${range}`
  );

  const refreshData = useCallback(() => {
    refetch(`/api/wakatime/dashboard?range=${range}&refresh=true`);
  }, [range, refetch]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    refreshData,
  };
}

// Hook for raw stats data
export function useWakaTimeStats(params: StatsParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const url = `/api/wakatime/stats${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return useApi(url);
}

// Hook for summaries data
export function useWakaTimeSummaries(params: SummariesParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const url = `/api/wakatime/summaries?${searchParams.toString()}`;

  return useApi(url);
}

// Hook for health check
export function useWakaTimeHealth() {
  const { apiKey, isAuthenticated } = useApiKey();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    if (!isAuthenticated || !apiKey) {
      setIsHealthy(false);
      setUsername(null);
      setLoading(false);
      setError("No API key provided");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/wakatime/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-WakaTime-API-Key": apiKey,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (response.ok && result.status === "healthy") {
        setIsHealthy(true);
        setUsername(result.user?.username || null);
      } else {
        setIsHealthy(false);
        setError(result.error || "Health check failed");
      }
    } catch (err) {
      setIsHealthy(false);
      const errorMessage =
        err instanceof Error ? err.message : "Health check failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiKey, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && apiKey) {
      checkHealth();
    } else {
      setIsHealthy(null);
      setUsername(null);
      setLoading(false);
      setError(null);
    }
  }, [checkHealth, isAuthenticated, apiKey]);

  return {
    isHealthy,
    username,
    loading,
    error,
    checkHealth,
  };
}

// Custom hook for auto-refresh functionality
export function useAutoRefresh(
  callback: () => void,
  interval: number = 300000
) {
  // 5 minutes default
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);

  useEffect(() => {
    if (!isAutoRefreshEnabled) return;

    const intervalId = setInterval(callback, interval);

    return () => clearInterval(intervalId);
  }, [callback, interval, isAutoRefreshEnabled]);

  return {
    isAutoRefreshEnabled,
    setIsAutoRefreshEnabled,
    toggleAutoRefresh: () => setIsAutoRefreshEnabled((prev) => !prev),
  };
}

// Hook for managing loading states across multiple API calls
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(Boolean);
  const getLoadingState = useCallback(
    (key: string) => loadingStates[key] || false,
    [loadingStates]
  );

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    getLoadingState,
  };
}

// Hook for error handling with retry functionality
export function useRetryableAction<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  maxRetries: number = 3
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeAction = useCallback(
    async (...args: T) => {
      setIsLoading(true);
      setError(null);

      try {
        await action(...args);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Action failed";
        setError(errorMessage);
        console.error("Action error:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [action]
  );

  const retry = useCallback(
    async (...args: T) => {
      if (retryCount >= maxRetries) {
        setError(`Maximum retry attempts (${maxRetries}) exceeded`);
        return;
      }

      setRetryCount((prev) => prev + 1);
      await executeAction(...args);
    },
    [executeAction, retryCount, maxRetries]
  );

  return {
    executeAction,
    retry,
    isLoading,
    error,
    retryCount,
    canRetry: retryCount < maxRetries,
  };
}
