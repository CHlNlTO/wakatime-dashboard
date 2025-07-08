// src/components/demo/demo-banner.tsx
"use client";

import React from "react";
import { Eye, User, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoBannerProps {
  demoUser?: string;
  onSwitchToPersonal?: () => void;
  className?: string;
}

export function DemoBanner({
  demoUser = "Clark",
  onSwitchToPersonal,
  className,
}: DemoBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-cyber-blue-500/30 bg-gradient-to-r from-primary/10 via-electric-violet-500/10 to-neon-green-500/10 p-4",
        className
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-electric-violet-500/5 to-neon-green-500/5 animate-pulse" />

      {/* Desktop Layout - Original horizontal layout */}
      <div className="relative hidden sm:flex sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Demo indicator icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 border border-primary/30">
            <Eye className="h-5 w-5 text-primary" />
          </div>

          {/* Demo info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric-violet-500" />
              <span className="text-sm font-semibold text-foreground">
                Demo Mode
              </span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                Live Data
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>
                You&apos;re viewing{" "}
                <span className="font-medium text-foreground">
                  {demoUser}&apos;s
                </span>{" "}
                real coding activity
              </span>
            </div>
          </div>
        </div>

        {/* Switch to personal button */}
        {onSwitchToPersonal && (
          <button
            onClick={onSwitchToPersonal}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/30 transition-all duration-200"
          >
            <span>Use Your API Key</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Mobile Layout - New vertical layout */}
      <div className="relative sm:hidden space-y-4">
        {/* Top section - Icon, Title, and Live Data chip */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Demo indicator icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0">
              <Eye className="h-5 w-5 text-primary" />
            </div>

            {/* Demo title */}
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric-violet-500" />
              <span className="text-sm font-semibold text-foreground">
                Demo Mode
              </span>
            </div>
          </div>

          {/* Live Data chip - top right on mobile */}
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex-shrink-0">
            Live Data
          </span>
        </div>

        {/* User info section */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-3 w-3 flex-shrink-0" />
          <span>
            You&apos;re viewing{" "}
            <span className="font-medium text-foreground">
              {demoUser}&apos;s
            </span>{" "}
            real coding activity
          </span>
        </div>

        {/* Switch to personal button - full width on mobile */}
        {onSwitchToPersonal && (
          <button
            onClick={onSwitchToPersonal}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/30 transition-all duration-200"
          >
            <span>Use Your API Key</span>
            <ArrowRight className="h-3 w-3 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Bottom text */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          💡 This dashboard shows real coding statistics to demonstrate the
          app&apos;s features.{" "}
          <span className="text-primary">
            Connect your WakaTime account to see your own stats!
          </span>
        </p>
      </div>
    </div>
  );
}
