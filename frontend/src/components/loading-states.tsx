"use client";

/* ============================================================
   Loading States — reusable loading components for IdeaForge.

   Components:
   1. LoadingSkeleton — generic shimmer skeleton (replaces content)
   2. AIProcessingIndicator — animated "AI is thinking" with
      forge-themed messaging and rotating status lines
   3. StageTransition — animated transition between pipeline stages
   4. PulsingDot — small animated dot for live/status indicators

   All components use Framer Motion for smooth animations and
   respect the emerald (#1f6f4a) design system palette.
   ============================================================ */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkle } from "@phosphor-icons/react/dist/ssr";

/* ── LoadingSkeleton ─────────────────────────────────────────
   Generic skeleton loading placeholder. Accepts width, height,
   and rounded props for flexible sizing. Uses the CSS shimmer
   animation defined in globals.css.
   ─────────────────────────────────────────────────────────── */
export const LoadingSkeleton = ({
  width = "100%",
  height = "1rem",
  rounded = "md",
  className = "",
}: {
  /** CSS width value or Tailwind class */
  width?: string;
  /** CSS height value */
  height?: string;
  /** Border radius: "sm" | "md" | "lg" | "full" */
  rounded?: "sm" | "md" | "lg" | "full";
  /** Additional CSS classes */
  className?: string;
}) => {
  const radiusMap = {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "999px",
  };

  return (
    <div
      className={`animate-shimmer ${className}`}
      role="status"
      aria-label="Loading content"
      style={{
        width,
        height,
        borderRadius: radiusMap[rounded],
      }}
    />
  );
};

/* ── SkeletonGroup ───────────────────────────────────────────
   Convenience wrapper that renders multiple skeleton lines
   with staggered widths for a realistic content placeholder.
   ─────────────────────────────────────────────────────────── */
export const SkeletonGroup = ({
  lines = 3,
  className = "",
}: {
  /** Number of skeleton lines to render */
  lines?: number;
  /** Additional CSS classes for the container */
  className?: string;
}) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
    {Array.from({ length: lines }).map((_, i) => (
      <LoadingSkeleton
        key={i}
        width={i === lines - 1 ? "60%" : i % 2 === 0 ? "100%" : "85%"}
        height="0.875rem"
      />
    ))}
  </div>
);

/* ── Forge-themed processing messages ────────────────────── */
const FORGE_MESSAGES = [
  "Heating the forge…",
  "Analyzing your idea…",
  "Shaping the structure…",
  "Tempering assumptions…",
  "Hammering out the details…",
  "Forging your roadmap…",
  "Almost there…",
];

/* ── AIProcessingIndicator ───────────────────────────────────
   Animated "AI is thinking" indicator with forge-themed
   rotating messages. Shows a sparkle icon, bouncing dots,
   and a cycling status message for visual engagement.
   ─────────────────────────────────────────────────────────── */
export const AIProcessingIndicator = ({
  message,
  className = "",
}: {
  /** Override the rotating message with a static one */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  /* Rotate through forge-themed messages every 2.5s */
  useEffect(() => {
    if (message) return; // skip rotation if static message provided
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % FORGE_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [message]);

  const displayMessage = message || FORGE_MESSAGES[msgIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 surface-1 hairline ${className}`}
      role="status"
      aria-live="polite"
      aria-label="AI is processing"
    >
      {/* Sparkle icon — gently pulsing */}
      <motion.div
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="shrink-0"
      >
        <Sparkle size={16} weight="fill" style={{ color: "var(--emerald)" }} />
      </motion.div>

      {/* Status message — animated text swap */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.span
            key={displayMessage}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="block text-[13px] font-medium text-foreground truncate"
          >
            {displayMessage}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bouncing dots — the classic "typing" indicator */}
      <div className="flex items-center gap-1" aria-hidden>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--emerald)" }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

/* ── Pipeline stage labels ───────────────────────────────── */
const STAGE_LABELS: Record<string, string> = {
  intake: "Intake",
  assumptions: "Assumptions",
  milestones: "Roadmap",
  "first-step": "First Step",
  complete: "Complete",
};

/* ── StageTransition ─────────────────────────────────────────
   Animated transition overlay shown when moving between
   pipeline stages. Displays "from → to" with a progress-like
   bar animation. Used as a brief interstitial.
   ─────────────────────────────────────────────────────────── */
export const StageTransition = ({
  from,
  to,
  onComplete,
  className = "",
}: {
  /** Stage ID being transitioned from */
  from: string;
  /** Stage ID being transitioned to */
  to: string;
  /** Callback when the transition animation completes */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}) => {
  const fromLabel = STAGE_LABELS[from] || from;
  const toLabel = STAGE_LABELS[to] || to;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => {
        /* Auto-dismiss after showing the transition */
        setTimeout(() => onComplete?.(), 600);
      }}
      className={`flex flex-col items-center justify-center gap-4 py-16 ${className}`}
      role="status"
      aria-label={`Transitioning from ${fromLabel} to ${toLabel}`}
    >
      {/* Stage labels with arrow */}
      <div className="flex items-center gap-3">
        <span className="ui-mono text-mute">{fromLabel}</span>
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: 40 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-px overflow-hidden"
          style={{ background: "var(--emerald)" }}
        />
        <span className="ui-mono text-emerald font-medium">{toLabel}</span>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--hairline)" }}>
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: "var(--emerald)" }}
        />
      </div>
    </motion.div>
  );
};

/* ── PulsingDot ──────────────────────────────────────────────
   Small animated status dot. Supports "live" (emerald pulsing),
   "pending" (amber), and "inactive" (gray, no pulse) variants.
   ─────────────────────────────────────────────────────────── */
export const PulsingDot = ({
  variant = "live",
  size = 6,
  className = "",
}: {
  /** Visual variant: "live" (emerald), "pending" (ember), "inactive" (gray) */
  variant?: "live" | "pending" | "inactive";
  /** Dot diameter in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}) => {
  const colors = {
    live: "var(--emerald)",
    pending: "var(--ember)",
    inactive: "var(--mute)",
  };

  const shouldPulse = variant !== "inactive";

  return (
    <span className={`relative inline-flex ${className}`} aria-hidden>
      {/* Outer glow ring — only for active variants */}
      {shouldPulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: colors[variant],
            width: size,
            height: size,
          }}
          animate={{
            scale: [1, 2],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
      {/* Core dot */}
      <span
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: colors[variant],
        }}
      />
    </span>
  );
};
