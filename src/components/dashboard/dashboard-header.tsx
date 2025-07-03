// src/components/dashboard/dashboard-header.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  RefreshCw,
  Sun,
  Moon,
  Settings,
  Activity,
  Calendar,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  username?: string;
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onToggleTheme?: () => void;
  onLogout?: () => void;
  isDark?: boolean;
  className?: string;
}

export function DashboardHeader({
  username,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onToggleTheme,
  onLogout,
  isDark = true,
  className,
}: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Developer Dashboard
            </h1>
          </div>
          {username && (
            <p className="text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">{username}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            <span className="text-sm dev-mono">
              {isRefreshing ? "Syncing..." : "Refresh"}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect API Key
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 rounded-lg bg-secondary/30 border border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="truncate">{currentDate}</span>
          </div>

          {lastUpdated && (
            <>
              <div className="hidden sm:block w-px h-4 bg-border" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-neon-green-500 animate-pulse" />
                <span className="truncate">
                  Last updated {formatRelativeTime(lastUpdated)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs dev-mono">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">API:</span>
            <span className="text-neon-green-500">●</span>
            <span className="text-foreground">Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Data:</span>
            <span className="text-primary">Live</span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {isRefreshing && (
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-electric-violet-500 animate-pulse" />
        </div>
      )}
    </div>
  );
}
