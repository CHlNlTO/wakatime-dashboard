// src/components/settings/settings-panel.tsx
"use client";

/*
 * Settings content, laid out like Discord's: a sidebar of sections and the
 * selected section beside it. Inside a section, settings are split by divider
 * lines rather than separate cards. Rendered inside the settings modal.
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Activity,
  Bell,
  BookOpen,
  Clock,
  ExternalLink,
  HardDrive,
  KeyRound,
  Palette,
  Plug,
  Trash2,
} from "lucide-react";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button/base";
import { Switch } from "@/components/motion/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { useTheme } from "@/components/theme-provider";
import { useApiKey, type ApiKeyStorageMode } from "@/contexts/api-key-context";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

export const SETTINGS_SECTIONS = [
  { id: "connection", group: "Account", label: "Connection", icon: Plug },
  { id: "storage", group: "Account", label: "Key storage", icon: KeyRound },
  { id: "appearance", group: "App", label: "Appearance", icon: Palette },
  { id: "notifications", group: "App", label: "Notifications", icon: Bell },
  { id: "status", group: "About", label: "Status", icon: Activity },
  { id: "resources", group: "About", label: "Resources", icon: BookOpen },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

const GROUPS = [...new Set(SETTINGS_SECTIONS.map((s) => s.group))];

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((s) => s.id === value);
}

const NOTIFICATIONS = {
  dailyReport: ["Daily reports", "Daily coding summary email"],
  weeklyReport: ["Weekly reports", "Weekly productivity insights"],
  goalReminders: ["Goal reminders", "Heads-up when you approach a goal"],
  streakAlerts: ["Streak alerts", "Notifications about coding streaks"],
} as const;

type NotificationKey = keyof typeof NOTIFICATIONS;

export interface SettingsHealth {
  isHealthy: boolean | null;
  username: string | null;
  githubUsername: string | null;
  loading: boolean;
  error: string | null;
}

interface SettingsPanelProps {
  section: SettingsSectionId;
  onSectionChange: (id: SettingsSectionId) => void;
  health: SettingsHealth;
  isDemoMode?: boolean;
  /** Called after the saved key is cleared (the dashboard signs out). */
  onKeyCleared?: () => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export function SettingsPanel({
  section,
  onSectionChange,
  health,
  isDemoMode = false,
  onKeyCleared,
  className,
}: SettingsPanelProps) {
  const reduce = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, storageMode, setStorageMode, clearApiKey } = useApiKey();

  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    dailyReport: true,
    weeklyReport: true,
    goalReminders: false,
    streakAlerts: true,
  });

  const connection = isDemoMode
    ? { status: "neutral" as const, text: "Demo" }
    : health.loading
      ? { status: "loading" as const, text: "Checking" }
      : health.isHealthy
        ? { status: "success" as const, text: "Connected" }
        : { status: "danger" as const, text: "Disconnected" };

  const renderSection = (id: SettingsSectionId) => {
    switch (id) {
      case "connection":
        return (
          <Section
            title="Connection"
            description="The WakaTime account this dashboard reads from."
            action={
              <AnimatedBadge status={connection.status} size="sm" className="font-mono">
                {connection.text}
              </AnimatedBadge>
            }
          >
            {isDemoMode ? (
              <Block>
                <p className="text-sm text-muted-foreground">
                  You&apos;re exploring the demo. Connect your own WakaTime key
                  to see your account here.
                </p>
              </Block>
            ) : (
              <Block>
                <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border font-mono text-sm">
                  <Row k="user" v={health.username ? `"${health.username}"` : "null"} string={Boolean(health.username)} />
                  <Row
                    k="github"
                    v={health.githubUsername ? `"${health.githubUsername}"` : "null"}
                    string={Boolean(health.githubUsername)}
                  />
                  <Row k="status" v={`"${connection.text.toLowerCase()}"`} string />
                  {health.error ? <Row k="error" v={`"${health.error}"`} danger /> : null}
                </dl>
              </Block>
            )}
            <Block title="API key setup">
              <Steps
                steps={[
                  <>
                    Get your key from{" "}
                    <a
                      href="https://wakatime.com/oauth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      WakaTime settings
                      <ExternalLink className="size-3" />
                    </a>
                  </>,
                  "Enter it on the dashboard when prompted",
                  <>
                    It is kept in this browser —{" "}
                    <button
                      type="button"
                      onClick={() => onSectionChange("storage")}
                      className="text-primary hover:underline"
                    >
                      choose how
                    </button>
                  </>,
                ]}
              />
            </Block>
          </Section>
        );

      case "storage":
        return (
          <Section title="Key storage" description="Where this browser keeps your WakaTime API key.">
            <SettingRow
              title="Where your key is saved"
              description="Local keeps it until you clear it. Session forgets it when this tab or browser closes — safer on a shared device."
            >
              <StorageModeSwitch value={storageMode} onChange={setStorageMode} />
            </SettingRow>
            <SettingRow
              title="Clear saved key"
              description="Removes it from both storage types and signs you out."
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onKeyCleared?.();
                  clearApiKey();
                }}
                disabled={!isAuthenticated}
                className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Clear
              </Button>
            </SettingRow>
          </Section>
        );

      case "appearance":
        return (
          <Section title="Appearance" description="How the dashboard looks on this device.">
            <SettingRow title="Dark mode" description={`Currently using ${theme} mode`}>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} ariaLabel="Dark mode" />
            </SettingRow>
          </Section>
        );

      case "notifications":
        return (
          <Section title="Notifications" description="What the dashboard should tell you about.">
            {(Object.keys(NOTIFICATIONS) as NotificationKey[]).map((key) => (
              <SettingRow key={key} title={NOTIFICATIONS[key][0]} description={NOTIFICATIONS[key][1]}>
                <Switch
                  checked={notifications[key]}
                  onCheckedChange={() =>
                    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
                  }
                  ariaLabel={NOTIFICATIONS[key][0]}
                />
              </SettingRow>
            ))}
          </Section>
        );

      case "status":
        return (
          <Section title="Status" description="Whether the services behind the dashboard are reachable.">
            <SettingRow title="WakaTime API" description="Source of your coding stats">
              <StatusBadge ok={isDemoMode || Boolean(health.isHealthy)} />
            </SettingRow>
            <SettingRow title="Dashboard" description="This app">
              <StatusBadge ok />
            </SettingRow>
          </Section>
        );

      case "resources":
        return (
          <Section title="Resources" description="Docs and help for WakaTime.">
            {[
              ["WakaTime docs", "Guides and FAQ", "https://wakatime.com/help"],
              ["API reference", "Endpoints this dashboard uses", "https://wakatime.com/developers"],
              ["WakaTime on GitHub", "Plugins and source", "https://github.com/wakatime"],
            ].map(([label, description, href]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group -mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-4 transition-colors hover:bg-muted/60"
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">{label}</span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </a>
            ))}
          </Section>
        );
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col md:grid md:grid-cols-[210px_minmax(0,1fr)]", className)}>
      <SettingsNav active={section} onSelect={onSectionChange} />

      <div
        role="tabpanel"
        id={`settings-panel-${section}`}
        aria-labelledby={`settings-tab-${section}`}
        className="min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-border bg-panel px-5 py-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)] sm:px-7 sm:py-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.18, ease: EASE_OUT }}
          >
            {renderSection(section)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function SettingsNav({
  active,
  onSelect,
}: {
  active: SettingsSectionId;
  onSelect: (id: SettingsSectionId) => void;
}) {
  const reduce = useReducedMotion();
  const refs = useRef<Partial<Record<SettingsSectionId, HTMLButtonElement | null>>>({});

  // On phones the sidebar is a horizontal row; keep the active tab in view.
  useEffect(() => {
    refs.current[active]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  // Arrow keys move between sections, like any tab list.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const count = SETTINGS_SECTIONS.length;
    const index = SETTINGS_SECTIONS.findIndex((s) => s.id === active);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? count - 1
          : (index + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + count) % count;
    const id = SETTINGS_SECTIONS[next]!.id;
    onSelect(id);
    refs.current[id]?.focus();
  };

  return (
    <nav
      aria-label="Settings sections"
      className="scrollbar-hide mb-1.5 shrink-0 overflow-x-auto md:mb-0 md:overflow-visible md:py-2 md:pr-2 md:pl-1"
    >
      <div
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="flex gap-1 md:flex-col md:gap-0"
      >
        {GROUPS.map((group) => (
          <div key={group} role="presentation" className="contents md:mb-4 md:block md:last:mb-0">
            <p
              aria-hidden
              className="mb-1.5 hidden px-2.5 font-mono text-[11px] tracking-wide text-muted-foreground uppercase md:block"
            >
              {group}
            </p>
            <div role="presentation" className="contents md:flex md:flex-col md:gap-0.5">
              {SETTINGS_SECTIONS.filter((s) => s.group === group).map(({ id, label, icon: Icon }) => {
                const selected = id === active;
                return (
                  <button
                    key={id}
                    ref={(node) => {
                      refs.current[id] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`settings-tab-${id}`}
                    aria-selected={selected}
                    aria-controls={`settings-panel-${id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => onSelect(id)}
                    className={cn(
                      "relative flex h-9 shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-sm whitespace-nowrap outline-none",
                      "transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    {selected ? (
                      <motion.span
                        layoutId="settings-nav-active"
                        aria-hidden
                        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                        className="absolute inset-0 rounded-lg border border-border bg-panel"
                      />
                    ) : null}
                    <Icon className="relative size-4 shrink-0" />
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Content building blocks                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {action ? <div className="shrink-0 pt-1">{action}</div> : null}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

/** A divided group inside a section, with an optional small heading. */
function Block({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="py-5">
      {title ? <p className="mb-3 text-sm font-medium text-foreground">{title}</p> : null}
      {children}
    </div>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="max-w-md">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Steps({ steps }: { steps: React.ReactNode[] }) {
  return (
    <ol className="space-y-1.5 text-sm text-muted-foreground">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="font-mono text-xs leading-5 text-muted-foreground/70">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

function Row({
  k,
  v,
  string,
  danger,
}: {
  k: string;
  v: string;
  string?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-2.5">
      <dt className="text-muted-foreground underline decoration-primary/50 decoration-dotted underline-offset-4">
        {k}
      </dt>
      <dd
        className={cn(
          "truncate",
          danger ? "text-destructive" : string ? "text-syntax-string" : "text-syntax-boolean"
        )}
      >
        {v}
      </dd>
    </div>
  );
}

function StorageModeSwitch({
  value,
  onChange,
}: {
  value: ApiKeyStorageMode;
  onChange: (mode: ApiKeyStorageMode) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ApiKeyStorageMode)} variant="segment">
      <TabsList aria-label="API key storage" className="inline-flex border border-border bg-card">
        <TabsTrigger value="local" icon={<HardDrive className="size-3.5" />} className="h-8 px-3 text-xs">
          Local
        </TabsTrigger>
        <TabsTrigger value="session" icon={<Clock className="size-3.5" />} className="h-8 px-3 text-xs">
          Session
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <AnimatedBadge status={ok ? "success" : "danger"} size="sm" className="font-mono">
      {ok ? "online" : "offline"}
    </AnimatedBadge>
  );
}
