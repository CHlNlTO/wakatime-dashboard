// src/hooks/use-card-layout.ts
"use client";

import { useCallback, useEffect, useState } from "react";

export const CARD_IDS = [
  "overview",
  "best-day",
  "contributions",
  "languages",
  "activity",
  "projects",
  "editors",
  "roadmap",
] as const;

export type CardId = (typeof CARD_IDS)[number];

/** Default tile order. Contributions sit above Languages / Activity. */
export const DEFAULT_ORDER: readonly CardId[] = CARD_IDS;

const STORAGE_KEY = "wakatime-dashboard-layout:v1";

function isCardId(value: unknown): value is CardId {
  return typeof value === "string" && (CARD_IDS as readonly string[]).includes(value);
}

/**
 * Keeps a saved order usable across releases: unknown ids are dropped,
 * duplicates collapse, and cards added later are appended at their default
 * position relative to the end.
 */
function normalize(saved: unknown): CardId[] {
  if (!Array.isArray(saved)) return [...DEFAULT_ORDER];
  const order = [...new Set(saved.filter(isCardId))];
  for (const id of DEFAULT_ORDER) if (!order.includes(id)) order.push(id);
  return order;
}

function sameOrder(a: readonly CardId[], b: readonly CardId[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/** Card order for the dashboard grid, remembered per browser. */
export function useCardLayout() {
  const [order, setOrder] = useState<CardId[]>([...DEFAULT_ORDER]);

  // Read after mount so the server render and first client render match.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setOrder(normalize(JSON.parse(raw)));
    } catch {
      // Storage blocked or corrupt: fall back to the default order.
    }
  }, []);

  const persist = useCallback((next: CardId[]) => {
    setOrder(next);
    try {
      if (sameOrder(next, DEFAULT_ORDER)) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not persisted; the order still applies for this visit.
    }
  }, []);

  const move = useCallback(
    (activeId: CardId, overId: CardId) => {
      const from = order.indexOf(activeId);
      const to = order.indexOf(overId);
      if (from === -1 || to === -1 || from === to) return;
      const next = [...order];
      next.splice(to, 0, ...next.splice(from, 1));
      persist(next);
    },
    [order, persist]
  );

  const reset = useCallback(() => persist([...DEFAULT_ORDER]), [persist]);

  return {
    order,
    move,
    reset,
    isCustom: !sameOrder(order, DEFAULT_ORDER),
  };
}

export type CardLayout = ReturnType<typeof useCardLayout>;
