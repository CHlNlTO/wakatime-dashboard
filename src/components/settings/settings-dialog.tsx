// src/components/settings/settings-dialog.tsx
"use client";

/*
 * Settings as a modal over the dashboard (no separate page). It renders its
 * own header trigger button, and keeps the open section in the URL hash
 * (#settings/storage) so a reload or a shared link reopens the same place.
 * The old /settings route redirects to /dashboard#settings.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";
import { IconButton } from "@/components/ui/panel";
import {
  isSettingsSectionId,
  SettingsPanel,
  type SettingsHealth,
  type SettingsSectionId,
} from "./settings-panel";

const HASH = /^#settings(?:\/([\w-]+))?$/;

export function SettingsDialog({
  health,
  isDemoMode = false,
}: {
  health: SettingsHealth;
  isDemoMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<SettingsSectionId>("connection");

  // Open from the hash on load, and when the hash changes (back/forward, links).
  useEffect(() => {
    const sync = () => {
      const match = window.location.hash.match(HASH);
      if (!match) return;
      if (match[1] && isSettingsSectionId(match[1])) setSection(match[1]);
      setOpen(true);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // Mirror the open section into the URL without adding history entries.
  useEffect(() => {
    if (open) window.history.replaceState(null, "", `#settings/${section}`);
  }, [open, section]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next && HASH.test(window.location.hash)) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <CenterMorphModal open={open} onOpenChange={handleOpenChange}>
      <CenterMorphModalTrigger>
        <IconButton label="Settings">
          <Settings />
        </IconButton>
      </CenterMorphModalTrigger>

      <CenterMorphModalContent
        ariaLabel="Settings"
        closeButtonLabel="Close settings"
        className="max-w-4xl rounded-[30px] bg-card p-1.5"
      >
        <div className="flex h-14 items-center pr-14 pl-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Settings</h2>
        </div>
        <SettingsPanel
          section={section}
          onSectionChange={setSection}
          health={health}
          isDemoMode={isDemoMode}
          onKeyCleared={() => handleOpenChange(false)}
          className="h-[min(600px,calc(100dvh-11rem))]"
        />
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}
