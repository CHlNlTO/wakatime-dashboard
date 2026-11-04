"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ContributionCalendar,
  GithubContributionsResponse,
} from "@/types/github";

export function useGithubContributions(username: string | null | undefined) {
  const [data, setData] = useState<ContributionCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContributions = useCallback(async (login: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/github/contributions?username=${encodeURIComponent(login)}`,
        { cache: "no-store" }
      );
      const result: GithubContributionsResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to load contributions");
      }

      setData(result.data);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load contributions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!username) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    fetchContributions(username);
  }, [username, fetchContributions]);

  return {
    data,
    loading,
    error,
    refetch: username ? () => fetchContributions(username) : async () => {},
  };
}
