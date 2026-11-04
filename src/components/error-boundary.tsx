// src/components/error-boundary.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  errorInfo?: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring service (if available)
    if (typeof window !== "undefined" && "gtag" in window) {
      // Example: Google Analytics error tracking
      (
        window as typeof window & {
          gtag: (
            command: string,
            event: string,
            parameters: { description: string; fatal: boolean }
          ) => void;
        }
      ).gtag("event", "exception", {
        description: error.toString(),
        fatal: false,
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  resetError,
  errorInfo,
}: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Plain markup on purpose: this renders when the app tree (theme, motion
  // components) may itself be what failed.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl rounded-[20px] border border-border bg-card p-1.5">
        <div className="flex min-h-11 items-center pt-0.5 pb-2 pl-3">
          <span className="text-[15px] font-medium text-foreground/90">
            Something went wrong
          </span>
        </div>
        <div className="space-y-4 rounded-[14px] border border-border bg-panel p-5">
          <div className="flex items-start gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-4" />
            </div>
            <p className="text-sm text-muted-foreground">
              Something unexpected happened. The error has been logged.
            </p>
          </div>

          {isDevelopment && error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
              <pre className="overflow-auto font-mono text-xs whitespace-pre-wrap text-destructive">
                {error.toString()}
              </pre>
              {errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-mono text-xs text-destructive">
                    component_stack
                  </summary>
                  <pre className="mt-2 font-mono text-xs whitespace-pre-wrap text-destructive/80">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={resetError}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Home className="size-3.5" />
              Go home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary };
export type { ErrorFallbackProps };
