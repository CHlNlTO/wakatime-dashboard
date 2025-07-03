// src/components/error-boundary.tsx
"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">
            <p>
              We&apos;re sorry, but something unexpected happened. This error
              has been logged and we&apos;ll look into it.
            </p>
          </div>

          {isDevelopment && error && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">
                Error Details (Development Mode):
              </h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <pre className="text-sm text-destructive font-mono whitespace-pre-wrap overflow-auto">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-destructive">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-destructive/80 font-mono whitespace-pre-wrap mt-2">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={resetError}
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
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>
              If this problem persists, please contact support with the error
              details above.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ErrorBoundary };
export type { ErrorFallbackProps };
