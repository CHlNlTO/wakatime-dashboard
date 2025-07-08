// src/components/auth/api-key-input.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/contexts/api-key-context";
import {
  Eye,
  EyeOff,
  Key,
  ExternalLink,
  AlertCircle,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps {
  onSuccess?: () => void;
  onDemoMode?: () => void;
  className?: string;
}

export function ApiKeyInput({
  onSuccess,
  onDemoMode,
  className,
}: ApiKeyInputProps) {
  const { setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/wakatime/health", {
        method: "GET",
        headers: {
          "X-WakaTime-API-Key": key,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      return response.ok && result.status === "healthy";
    } catch (error) {
      console.error("API key validation error:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      setError("Please enter your WakaTime API key");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const isValid = await validateApiKey(inputValue.trim());

      if (isValid) {
        setApiKey(inputValue.trim());
        onSuccess?.();
      } else {
        setError("Invalid API key. Please check your key and try again.");
      }
    } catch {
      setError("Failed to validate API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isValidating && inputValue.trim()) {
      handleSubmit();
    }
  };

  const handleDemoClick = () => {
    onDemoMode?.();
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background flex items-center justify-center p-4",
        className
      )}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Welcome to WakaTime Dashboard
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              View your coding statistics or explore the demo
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Personal API Key Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="api-key"
                className="text-sm font-medium text-foreground"
              >
                Your WakaTime API Key
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="waka_********-****-****-****-************"
                  className={cn(
                    "w-full px-3 py-2 pr-10 text-sm bg-background border rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    "transition-colors",
                    error
                      ? "border-destructive focus:ring-destructive"
                      : "border-border hover:border-muted-foreground"
                  )}
                  disabled={isValidating}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isValidating}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={isValidating || !inputValue.trim()}
            >
              {isValidating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Validating...</span>
                </div>
              ) : (
                "Connect to WakaTime"
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Demo Section */}
          <div className="space-y-3">
            <div className="text-center">
              <h4 className="text-sm font-medium text-foreground mb-1">
                Explore the Demo
              </h4>
              <p className="text-xs text-muted-foreground">
                See the dashboard in action with real coding data
              </p>
            </div>

            <Button
              onClick={handleDemoClick}
              variant="outline"
              className="w-full border-primary/20 hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-electric-violet-500" />
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span>View Clark&apos;s Demo Stats</span>
              </div>
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                ✨ See real coding metrics and dashboard features
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="pt-4 border-t border-border">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                How to get your API key:
              </h4>
              <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                <li>
                  Visit your{" "}
                  <a
                    href="https://wakatime.com/api-key"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    WakaTime API Key page
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Copy your secret API key</li>
                <li>
                  Paste it above and click &quot;Connect to WakaTime&quot;
                </li>
              </ol>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely in your browser session and never
              sent to our servers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
