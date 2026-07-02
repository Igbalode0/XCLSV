"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, formatTimestamp } from "@/lib/utils";
import { REACTION_META, type Reaction, type ReactionType } from "./types";

interface MomentsPanelProps {
  reactions: Reaction[];
  currentLabel: string; // "0:41" — the moment a new reaction will attach to
  onSeek: (ms: number) => void;
  onAdd: (type: ReactionType, body?: string) => void;
  className?: string;
}

const QUICK: ReactionType[] = ["favorite", "fire", "best"];

/**
 * The feedback timeline as a list. Reacting attaches to the CURRENT moment;
 * tapping a moment jumps playback there. No global chat — every note is a
 * timestamp.
 */
export function MomentsPanel({
  reactions,
  currentLabel,
  onSeek,
  onAdd,
  className,
}: MomentsPanelProps) {
  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState("");

  const sorted = [...reactions].sort((a, b) => a.timeMs - b.timeMs);

  function sendComment() {
    const body = draft.trim();
    if (!body) return;
    onAdd("comment", body);
    setDraft("");
    setCommenting(false);
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display text-sm uppercase tracking-[0.18em] text-faint">
          Moments
        </h2>
        <span className="tnum text-xs text-faint">{sorted.length}</span>
      </div>

      {/* React at the current moment */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          {QUICK.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onAdd(t)}
              aria-label={`${REACTION_META[t].label} at ${currentLabel}`}
              className="grid h-11 flex-1 place-items-center rounded-xl border border-line bg-overlay text-lg transition-transform hover:-translate-y-0.5 hover:bg-overlay-strong active:scale-95"
              title={`${REACTION_META[t].label} · ${currentLabel}`}
            >
              {REACTION_META[t].emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCommenting((c) => !c)}
            aria-label="Add a comment at this moment"
            className={cn(
              "grid h-11 flex-1 place-items-center rounded-xl border text-lg transition-transform hover:-translate-y-0.5 active:scale-95",
              commenting
                ? "border-[rgb(var(--rp-rgb))] bg-overlay-strong"
                : "border-line bg-overlay hover:bg-overlay-strong",
            )}
          >
            {REACTION_META.comment.emoji}
          </button>
        </div>
        <p className="mt-1.5 px-1 text-xs text-faint">
          Reacting marks <span className="tnum text-muted">{currentLabel}</span>
        </p>

        <AnimatePresence>
          {commenting ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendComment()}
                  placeholder={`What happens at ${currentLabel}?`}
                  className="h-11 flex-1 rounded-xl border border-line bg-field px-3.5 text-sm text-foreground placeholder:text-faint focus:border-[rgb(var(--rp-rgb))] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendComment}
                  className="h-11 rounded-xl px-4 text-sm font-medium text-on-accent"
                  style={{ background: "rgb(var(--rp-rgb))" }}
                >
                  Post
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* The timeline of moments */}
      <div className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {sorted.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted">
            No moments yet — react to a part you love and it lands here.
          </p>
        ) : (
          sorted.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSeek(r.timeMs)}
              className="flex w-full items-start gap-3 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-line hover:bg-overlay"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-overlay text-sm">
                {REACTION_META[r.type].emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="tnum text-xs text-[rgb(var(--rp-rgb))]">
                  {formatTimestamp(r.timeMs)}
                </span>
                {r.body ? (
                  <span className="block truncate text-sm text-foreground">{r.body}</span>
                ) : (
                  <span className="block text-sm text-muted">{REACTION_META[r.type].label}</span>
                )}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Mobile bottom sheet wrapper. Drags up to expand, down to collapse; tap the
 * grab handle to toggle. Used only on small screens.
 */
export function BottomSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.18}
      onDragEnd={(_, info) => {
        if (info.offset.y < -40) setOpen(true);
        else if (info.offset.y > 40) setOpen(false);
      }}
      className="glass fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-x-0 border-b-0 border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)]"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Collapse moments" : "Expand moments"}
        className="mx-auto block h-1.5 w-10 rounded-full bg-line-strong"
      />
      <div
        className={cn(
          "transition-[max-height] duration-300 ease-out",
          open ? "max-h-[58vh]" : "max-h-[164px]",
          "overflow-hidden",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
