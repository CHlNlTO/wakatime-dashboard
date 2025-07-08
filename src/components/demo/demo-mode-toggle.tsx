// src/components/demo/demo-mode-toggle.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { User, Key, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export function DemoModeToggle({
  isDemoMode,
  onToggle,
  disabled = false,
  className,
}: DemoModeToggleProps) {
  return (
    <Button
      onClick={onToggle}
      disabled={disabled}
      variant="outline"
      size="sm"
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isDemoMode
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "border-border hover:border-primary/30",
        className
      )}
    >
      {isDemoMode ? (
        <>
          <ArrowLeft className="h-3 w-3" />
          <Key className="h-3 w-3" />
          <span className="text-sm">Use Your API Key</span>
        </>
      ) : (
        <>
          <User className="h-3 w-3" />
          <span className="text-sm">View Demo</span>
        </>
      )}
    </Button>
  );
}
