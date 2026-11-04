// src/components/ui/panel.tsx
"use client";

/*
 * The dashboard's card language, after jwt.io's decoder panels:
 *
 *   ┌ Card (beUI) ───────────────────────────────────────────┐
 *   │ [LABEL]  Title                       [view] [copy] ... │  ← header row
 *   │ ┌ inset panel ───────────────────────────────────────┐ │
 *   │ │ content                                            │ │
 *   │ └────────────────────────────────────────────────────┘ │
 *   └────────────────────────────────────────────────────────┘
 *
 * Hover is a cursor-follow spotlight and a border lift — no scaling. Entrance
 * is a short staggered blur-in that respects reduced motion.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, Copy, GripVertical } from "lucide-react";
import { Card } from "@/components/motion/card";
import { useDragHandle } from "@/components/ui/sortable-tile";
import { Tooltip } from "@/components/motion/tooltip";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

export interface PanelProps {
  title: React.ReactNode;
  /** Extra controls on the right of the header row. */
  actions?: React.ReactNode;
  /** When set, the header offers a Visual / JSON switch and a copy button. */
  json?: unknown;
  /** Entrance stagger, in seconds. */
  delay?: number;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

export function Panel({
  title,
  actions,
  json,
  delay = 0,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  const reduce = useReducedMotion();
  const [view, setView] = useState<"visual" | "json">("visual");
  const hasJson = json !== undefined;

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    []
  );

  return (
    <motion.div
      className={cn("h-full min-w-0", className)}
      initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
    >
      <Card
        onPointerMove={handlePointerMove}
        className={cn(
          "spotlight group/panel h-full gap-0 rounded-[20px] bg-card p-1.5",
          "transition-[border-color] duration-300 hover:border-border-strong"
        )}
      >
        <PanelHeader title={title}>
          {actions}
          {hasJson ? (
            <>
              <ViewSwitch value={view} onChange={setView} />
              <CopyButton value={json} />
            </>
          ) : null}
        </PanelHeader>

        <div
          className={cn(
            "relative flex-1 rounded-[14px] border border-border bg-panel p-4 sm:p-5",
            "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]",
            bodyClassName
          )}
        >
          {hasJson && view === "json" ? <JsonView data={json} /> : children}
        </div>
      </Card>
    </motion.div>
  );
}

export function PanelHeader({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const drag = useDragHandle();

  return (
    <div
      {...drag?.headerProps}
      className={cn(
        "flex min-h-11 items-center gap-2.5 pt-0.5 pr-1.5 pb-2 pl-3",
        drag && "cursor-grab touch-manipulation select-none",
        drag?.isDragging && "cursor-grabbing",
        className
      )}
    >
      <div className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground/90">
        {title}
      </div>
      {children || drag ? (
        <div className="flex shrink-0 items-center gap-1">
          {children}
          {drag ? <DragGrip {...drag.handleProps} /> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Keyboard + pointer handle for moving a card. Subtle until the card is hovered. */
function DragGrip(props: Record<string, unknown>) {
  return (
    <Tooltip content="Drag to move · Space to pick up" side="bottom">
      <button
        type="button"
        aria-label="Move card"
        {...props}
        className={cn(
          "grid h-8 w-6 cursor-grab touch-none place-items-center rounded-lg text-muted-foreground outline-none",
          "opacity-40 transition-[opacity,background-color,color] duration-150",
          "group-hover/panel:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100",
          "focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
          "[@media(hover:none)]:opacity-100"
        )}
      >
        <GripVertical className="size-4" />
      </button>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/* Header controls                                                            */
/* -------------------------------------------------------------------------- */

/* Neutral, not brand blue: the toggle is chrome, not a call to action. The
 * active label is white, so the pill stays mid-gray in both themes. */
const SEGMENT_INDICATOR = "bg-neutral-700 dark:bg-white/15";

function ViewSwitch({
  value,
  onChange,
}: {
  value: "visual" | "json";
  onChange: (value: "visual" | "json") => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as "visual" | "json")}
      variant="segment"
    >
      <TabsList
        aria-label="Panel view"
        className="hidden border border-border bg-panel sm:inline-flex"
      >
        <TabsTrigger
          value="visual"
          className="h-6 px-2 text-[11px]"
          indicatorClassName={SEGMENT_INDICATOR}
        >
          Visual
        </TabsTrigger>
        <TabsTrigger
          value="json"
          className="h-6 px-2 font-mono text-[11px]"
          indicatorClassName={SEGMENT_INDICATOR}
        >
          JSON
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        aria-label={label}
        className={cn(
          "grid size-8 place-items-center rounded-lg text-muted-foreground outline-none",
          "transition-colors duration-150 hover:bg-muted hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          "[&_svg]:size-4",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function CopyButton({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        typeof value === "string" ? value : JSON.stringify(value, null, 2)
      );
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <IconButton label={copied ? "Copied" : "Copy as JSON"} onClick={copy}>
      <ActionSwapIcon value={copied ? "copied" : "idle"}>
        {copied ? <Check className="text-success" /> : <Copy />}
      </ActionSwapIcon>
    </IconButton>
  );
}

/* -------------------------------------------------------------------------- */
/* JSON view                                                                  */
/* -------------------------------------------------------------------------- */

export function JsonView({
  data,
  className,
}: {
  data: unknown;
  className?: string;
}) {
  return (
    <pre
      className={cn(
        "scrollbar-hide max-h-[340px] overflow-auto font-mono text-[13px] leading-6",
        className
      )}
    >
      <JsonNode value={data} depth={0} />
    </pre>
  );
}

const INDENT = "  ";

function JsonNode({ value, depth }: { value: unknown; depth: number }) {
  const pad = INDENT.repeat(depth + 1);
  const closePad = INDENT.repeat(depth);

  if (value === null || value === undefined) {
    return <span className="text-syntax-boolean">null</span>;
  }
  if (typeof value === "string") {
    return <span className="text-syntax-string">&quot;{value}&quot;</span>;
  }
  if (typeof value === "number") {
    return (
      <span className="text-syntax-number">
        {Number.isInteger(value) ? value : Number(value.toFixed(2))}
      </span>
    );
  }
  if (typeof value === "boolean") {
    return <span className="text-syntax-boolean">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <Punct>[]</Punct>;
    return (
      <>
        <Punct>[</Punct>
        {"\n"}
        {value.map((item, i) => (
          <React.Fragment key={i}>
            {pad}
            <JsonNode value={item} depth={depth + 1} />
            {i < value.length - 1 ? <Punct>,</Punct> : null}
            {"\n"}
          </React.Fragment>
        ))}
        {closePad}
        <Punct>]</Punct>
      </>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <Punct>{"{}"}</Punct>;
    return (
      <>
        <Punct>{"{"}</Punct>
        {"\n"}
        {entries.map(([key, item], i) => (
          <React.Fragment key={key}>
            {pad}
            <JsonKey>{key}</JsonKey>
            <Punct>: </Punct>
            <JsonNode value={item} depth={depth + 1} />
            {i < entries.length - 1 ? <Punct>,</Punct> : null}
            {"\n"}
          </React.Fragment>
        ))}
        {closePad}
        <Punct>{"}"}</Punct>
      </>
    );
  }
  return <span>{String(value)}</span>;
}

function Punct({ children }: { children: React.ReactNode }) {
  return <span className="text-syntax-punct">{children}</span>;
}

export function JsonKey({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-syntax-key underline decoration-primary/60 decoration-dotted underline-offset-[5px]",
        className
      )}
    >
      &quot;{children}&quot;
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Claims: key/value readouts styled like decoded JWT claims                  */
/* -------------------------------------------------------------------------- */

export function ClaimGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid divide-border overflow-hidden rounded-xl border border-border",
        "grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0",
        className
      )}
    >
      {children}
    </dl>
  );
}

export function Claim({
  name,
  hint,
  children,
  className,
}: {
  name: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const key = <span className="font-mono text-xs text-muted-foreground">
    <span className="underline decoration-primary/50 decoration-dotted underline-offset-4">
      {name}
    </span>
  </span>;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3.5 py-3 sm:flex-col sm:items-start sm:justify-start sm:gap-1",
        className
      )}
    >
      <dt>{hint ? <Tooltip content={hint} side="top">{key}</Tooltip> : key}</dt>
      <dd className="font-mono text-sm font-medium text-foreground tabular-nums">
        {children}
      </dd>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

export function PanelEmpty({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <div className="grid size-10 place-items-center rounded-xl border border-dashed border-border-strong [&_svg]:size-4">
        {icon}
      </div>
      <p>{children}</p>
    </div>
  );
}
