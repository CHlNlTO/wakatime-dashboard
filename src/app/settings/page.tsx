// src/app/settings/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { useWakaTimeHealth } from "@/hooks/use-wakatime";
import {
  Settings,
  Key,
  Palette,
  Bell,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SettingsPage() {
  // Safely handle theme with fallback
  let theme: string;
  let toggleTheme: () => void;

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch {
    // Fallback if not within ThemeProvider
    theme = "dark";
    toggleTheme = () => {};
    console.warn("Theme provider not available, using fallback");
  }

  // Safely handle health check with fallback
  let isHealthy: boolean | null;
  let username: string | null;
  let healthLoading: boolean;
  let healthError: string | null;

  try {
    const healthContext = useWakaTimeHealth();
    isHealthy = healthContext.isHealthy;
    username = healthContext.username;
    healthLoading = healthContext.loading;
    healthError = healthContext.error;
  } catch {
    // Fallback if not within ApiKeyProvider
    isHealthy = null;
    username = null;
    healthLoading = false;
    healthError = "API key context not available";
    console.warn("API key provider not available, using fallback");
  }

  const [notifications, setNotifications] = useState({
    dailyReport: true,
    weeklyReport: true,
    goalReminders: false,
    streakAlerts: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your WakaTime dashboard preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    {healthLoading ? (
                      <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse" />
                    ) : isHealthy ? (
                      <CheckCircle className="h-5 w-5 text-neon-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {healthLoading
                          ? "Checking connection..."
                          : isHealthy
                          ? "Connected to WakaTime"
                          : "Connection failed"}
                      </p>
                      {username && (
                        <p className="text-sm text-muted-foreground">
                          Authenticated as:{" "}
                          <span className="dev-mono">{username}</span>
                        </p>
                      )}
                      {healthError && (
                        <p className="text-sm text-destructive">
                          {healthError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* API Key Setup Instructions */}
                <div className="space-y-3">
                  <h4 className="font-medium text-foreground">API Key Setup</h4>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      To use this dashboard, you need to configure your WakaTime
                      API key:
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>
                        Get your API key from{" "}
                        <a
                          href="https://wakatime.com/api-key"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          WakaTime Settings
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>Enter it in the dashboard when prompted</li>
                      <li>
                        Your API key is stored securely in your browser session
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                      theme === "dark" ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Currently using:{" "}
                  <span className="font-medium text-foreground capitalize">
                    {theme}
                  </span>{" "}
                  mode
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {key === "dailyReport" && "Daily Reports"}
                        {key === "weeklyReport" && "Weekly Reports"}
                        {key === "goalReminders" && "Goal Reminders"}
                        {key === "streakAlerts" && "Streak Alerts"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {key === "dailyReport" &&
                          "Get daily coding summary emails"}
                        {key === "weeklyReport" &&
                          "Receive weekly productivity insights"}
                        {key === "goalReminders" &&
                          "Reminders when approaching goals"}
                        {key === "streakAlerts" &&
                          "Notifications about coding streaks"}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleNotificationChange(
                          key as keyof typeof notifications
                        )
                      }
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        enabled ? "bg-primary" : "bg-secondary"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-background transition-transform",
                          enabled ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Status</span>
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      isHealthy ? "text-neon-green-500" : "text-destructive"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isHealthy ? "bg-neon-green-500" : "bg-destructive"
                      )}
                    />
                    {isHealthy ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dashboard</span>
                  <span className="flex items-center gap-1 text-neon-green-500">
                    <div className="w-2 h-2 rounded-full bg-neon-green-500" />
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Update</span>
                  <span className="text-foreground dev-mono">Just now</span>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <a
                    href="https://wakatime.com/help"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    WakaTime Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://wakatime.com/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    API Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://github.com/wakatime"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    GitHub Repository
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
