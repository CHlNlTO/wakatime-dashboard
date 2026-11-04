// src/app/dashboard/error.tsx
"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { JsonView, Panel } from "@/components/ui/panel";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const linkButton =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60";

export default function DashboardError({ error, reset }: ErrorPageProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  const getErrorMessage = (error: Error): string => {
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      return "Invalid API key. Please check your WakaTime API configuration.";
    }
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return "Access denied. Your API key may not have the required permissions.";
    }
    if (error.message.includes("429") || error.message.includes("rate limit")) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    if (error.message.includes("500") || error.message.includes("Internal Server Error")) {
      return "WakaTime service is currently unavailable. Please try again later.";
    }
    if (error.message.includes("Network") || error.message.includes("fetch")) {
      return "Network connection error. Please check your internet connection.";
    }
    return "An unexpected error occurred while loading your dashboard.";
  };

  const getSuggestions = (error: Error): string[] => {
    if (error.message.includes("401") || error.message.includes("403")) {
      return [
        "Verify your WakaTime API key",
        "Ensure your API key has the required scopes",
        "Check if your API key has expired",
      ];
    }
    if (error.message.includes("429")) {
      return [
        "Wait a few minutes before refreshing",
        "Consider upgrading your WakaTime plan if needed",
      ];
    }
    if (error.message.includes("500")) {
      return [
        "Check the WakaTime status page for service updates",
        "Try again in a few minutes",
      ];
    }
    return [
      "Check your internet connection",
      "Try refreshing the page",
      "Clear your browser cache and cookies",
    ];
  };

  const errorMessage = getErrorMessage(error);
  const suggestions = getSuggestions(error);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div aria-hidden className="bg-dot-grid pointer-events-none fixed inset-x-0 top-0 h-[520px]" />

      <div className="relative w-full max-w-2xl space-y-4">
        <Panel title="Dashboard error" bodyClassName="space-y-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{errorMessage}</p>
              <p className="text-sm text-muted-foreground">
                This is usually an easy fix. Try the steps below.
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 rounded-xl border border-border bg-card p-3.5 text-sm text-muted-foreground">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex gap-2.5">
                <span className="font-mono text-xs leading-5 text-muted-foreground/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={reset}>
              <RefreshCw className="size-3.5" />
              Try again
            </Button>
            <Link href="/" className={linkButton}>
              <Home className="size-3.5" />
              Go home
            </Link>
          </div>

          {isDevelopment && (
            <details className="border-t border-border pt-4">
              <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">
                error_details (development)
              </summary>
              <div className="mt-3 rounded-xl border border-border bg-card p-3">
                <JsonView
                  data={{
                    message: error.message,
                    digest: error.digest ?? null,
                    stack: error.stack ?? null,
                  }}
                  className="max-h-64 text-xs whitespace-pre-wrap"
                />
              </div>
            </details>
          )}
        </Panel>

        <p className="text-center text-sm text-muted-foreground">
          Still stuck? See the{" "}
          <a
            href="https://wakatime.com/developers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            WakaTime API docs
          </a>{" "}
          or{" "}
          <a
            href="https://github.com/wakatime"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            report an issue
          </a>
          .
        </p>
      </div>
    </div>
  );
}
