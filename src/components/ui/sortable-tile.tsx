// src/components/ui/sortable-tile.tsx
"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

/*
 * A grid tile the user can drag to a new position. The card inside picks up
 * the drag wiring from context, so cards don't take any drag props:
 *   - the grip button is the keyboard handle (Space to lift, arrows, Space)
 *   - the rest of the header row is a pointer handle, except its own controls
 */

interface DragHandle {
  /** Spread on the grip button. */
  handleProps: Record<string, unknown> & { ref: (node: HTMLElement | null) => void };
  /** Spread on the header row: same listeners, ignoring its own controls. */
  headerProps: Record<string, unknown>;
  isDragging: boolean;
}

const DragHandleContext = createContext<DragHandle | null>(null);

export function useDragHandle() {
  return useContext(DragHandleContext);
}

/** Events from these never start a drag from the header row. */
const INTERACTIVE = "button, a, input, select, textarea, [role='tab'], [data-no-drag]";

function headerListeners(listeners: DraggableSyntheticListeners) {
  if (!listeners) return {};
  const filtered: Record<string, (event: React.SyntheticEvent) => void> = {};
  for (const [name, handler] of Object.entries(listeners)) {
    filtered[name] = (event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE)) return;
      (handler as (e: React.SyntheticEvent) => void)(event);
    };
  }
  return filtered;
}

export function SortableTile({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handle = useMemo<DragHandle>(
    () => ({
      handleProps: {
        ...(attributes as DraggableAttributes),
        ...listeners,
        ref: setActivatorNodeRef,
      },
      headerProps: headerListeners(listeners),
      isDragging,
    }),
    [attributes, listeners, setActivatorNodeRef, isDragging]
  );

  return (
    <div
      ref={setNodeRef}
      // Translate only: the sorting strategy also scales tiles to the size of
      // the slot they pass over, which would squash charts mid-drag.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "relative min-w-0",
        isDragging &&
          "z-30 [&_[data-slot=card]]:border-border-strong [&_[data-slot=card]]:shadow-[0_24px_60px_-20px_rgb(0_0_0/0.55)]",
        className
      )}
    >
      <DragHandleContext.Provider value={handle}>{children}</DragHandleContext.Provider>
    </div>
  );
}
