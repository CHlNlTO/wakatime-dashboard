// src/app/dashboard/error.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  const getErrorMessage = (error: Error): string => {
    // Common WakaTime API errors
    if (
      error.message.includes("401") ||
      error.message.includes("Unauthorized")
    ) {
      return "Invalid API key. Please check your WakaTime API configuration.";
    }
    if (error.message.includes("403") || error.message.includes("Forbidden")) {
      return "Access denied. Your API key may not have the required permissions.";
    }
    if (error.message.includes("429") || error.message.includes("rate limit")) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    if (
      error.message.includes("500") ||
      error.message.includes("Internal Server Error")
    ) {
      return "WakaTime service is currently unavailable. Please try again later.";
    }
    if (error.message.includes("Network") || error.message.includes("fetch")) {
      return "Network connection error. Please check your internet connection.";
    }

    return "An unexpected error occurred while loading your dashboard.";
  };

  const getSuggestions = (error: Error): string[] => {
    const suggestions: string[] = [];

    if (error.message.includes("401") || error.message.includes("403")) {
      suggestions.push("Verify your WakaTime API key in environment variables");
      suggestions.push("Ensure your API key has the required scopes");
      suggestions.push("Check if your API key has expired");
    } else if (error.message.includes("429")) {
      suggestions.push("Wait a few minutes before refreshing");
      suggestions.push("Consider upgrading your WakaTime plan if needed");
    } else if (error.message.includes("500")) {
      suggestions.push("Check WakaTime status page for service updates");
      suggestions.push("Try again in a few minutes");
    } else {
      suggestions.push("Check your internet connection");
      suggestions.push("Try refreshing the page");
      suggestions.push("Clear your browser cache and cookies");
    }

    return suggestions;
  };

  const errorMessage = getErrorMessage(error);
  const suggestions = getSuggestions(error);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Error Card */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-foreground font-medium">{errorMessage}</p>
              <p className="text-sm text-muted-foreground">
                Don&apos;t worry, this is usually an easy fix. Try the
                suggestions below.
              </p>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">What you can try:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>

              <button
                onClick={() => (window.location.href = "/settings")}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>

            {/* Error Details (Development) */}
            {isDevelopment && (
              <details className="pt-4 border-t border-border">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Error Details (Development Mode)
                </summary>
                <div className="mt-2 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-destructive">
                        Error:
                      </span>
                      <pre className="text-xs text-destructive font-mono whitespace-pre-wrap mt-1">
                        {error.message}
                      </pre>
                    </div>
                    {error.digest && (
                      <div>
                        <span className="text-xs font-semibold text-destructive">
                          Digest:
                        </span>
                        <pre className="text-xs text-destructive/80 font-mono mt-1">
                          {error.digest}
                        </pre>
                      </div>
                    )}
                    {error.stack && (
                      <div>
                        <span className="text-xs font-semibold text-destructive">
                          Stack:
                        </span>
                        <pre className="text-xs text-destructive/80 font-mono whitespace-pre-wrap mt-1 max-h-32 overflow-auto">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <h4 className="font-medium text-foreground">
                Still having trouble?
              </h4>
              <p className="text-sm text-muted-foreground">
                Check the{" "}
                <a
                  href="https://wakatime.com/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WakaTime API documentation
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
