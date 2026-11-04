// src/components/auth/api-key-input.tsx
"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ExternalLink, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/motion/button/base";
import { Input } from "@/components/motion/input";
import { Loader } from "@/components/motion/loader";
import { Panel } from "@/components/ui/panel";
import { BrandMark } from "@/components/brand-mark";
import { useApiKey } from "@/contexts/api-key-context";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

interface ApiKeyInputProps {
  onSuccess?: () => void;
  onDemoMode?: () => void;
  className?: string;
}

export function ApiKeyInput({ onSuccess, onDemoMode, className }: ApiKeyInputProps) {
  const { setApiKey } = useApiKey();
  const reduce = useReducedMotion();
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

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isValidating) return;

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
        setError("Invalid API key. Check the key and try again.");
      }
    } catch {
      setError("Failed to validate API key. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center bg-background px-4 py-10",
        className
      )}
    >
      <div aria-hidden className="bg-dot-grid pointer-events-none fixed inset-x-0 top-0 h-[520px]" />

      <div className="relative w-full max-w-md space-y-6">
        <motion.div
          className="space-y-2 text-center"
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          <div className="flex items-center justify-center gap-3">
            <BrandMark size={40} />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Developer Dashboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your WakaTime coding stats, decoded.
          </p>
        </motion.div>

        <Panel title="Connect WakaTime" delay={0.06} bodyClassName="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <Input
              id="api-key"
              label="API key"
              type={showKey ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={inputValue}
              onChange={(value) => {
                setInputValue(value);
                if (error) setError(null);
              }}
              placeholder="waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              error={error ?? undefined}
              disabled={isValidating}
              leftIcon={<KeyRound />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  disabled={isValidating}
                >
                  {showKey ? <EyeOff /> : <Eye />}
                </button>
              }
              classNames={{
                field: "rounded-xl bg-card",
                input: "font-mono text-sm",
              }}
            />

            <Button
              type="submit"
              className="w-full rounded-xl"
              disabled={isValidating || !inputValue.trim()}
            >
              {isValidating ? (
                <>
                  <Loader variant="spinner" size={14} label="Validating" />
                  Validating…
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="secondary"
            onClick={onDemoMode}
            className="group w-full rounded-xl"
          >
            <span className="inline-flex h-5 items-center rounded border border-warning/35 bg-warning/10 px-1.5 font-mono text-[10px] font-semibold tracking-wider text-warning uppercase">
              Demo
            </span>
            Explore Clark&apos;s live stats
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>

          <ol className="space-y-2 rounded-xl border border-border bg-card p-3.5 text-sm text-muted-foreground">
            {[
              <>
                Open your{" "}
                <a
                  href="https://wakatime.com/oauth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  WakaTime OAuth page
                  <ExternalLink className="size-3" />
                </a>
              </>,
              "Copy your secret API key",
              <>Paste it above and press Connect</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="font-mono text-xs leading-5 text-muted-foreground/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <p className="text-center text-xs text-muted-foreground">
            Your key stays in this browser and is only sent to WakaTime
            through this app&apos;s API proxy.
          </p>
        </Panel>
      </div>
    </div>
  );
}
