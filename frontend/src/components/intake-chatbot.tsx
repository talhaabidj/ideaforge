"use client";

/**
 * @fileoverview IntakeChatbot — Stage 01 of the IdeaForge pipeline.
 *
 * This component implements a conversational chatbot that walks the user through
 * the 6W3H framework (Who, What, Where, When, Why, Which, How, How Much, How Many).
 * The user first enters a raw idea, then answers nine structured questions. Skipped
 * fields are inferred by the AI backend. Once all fields are answered or skipped,
 * the intake is submitted to the API which returns a structured roadmap scaffold.
 *
 * Phases:
 *   - "idea"       → User enters the raw idea text
 *   - "fields"     → 6W3H conversational flow (9 questions)
 *   - "submitting" → API call in progress, AI inferring gaps
 *   - "done"       → Roadmap created, proceed to assumptions stage
 *
 * Key UX features:
 *   - Segmented progress rail showing completion across all 9 fields
 *   - Animated typing indicator during AI processing
 *   - Error states with retry functionality
 *   - Keyboard shortcuts (Cmd/Ctrl+Enter to submit)
 *   - Auto-scroll to latest chat message
 */

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowRight, Check, Loader2, SkipForward, RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import { SIX_W_THREE_H_FIELDS } from "@/lib/framework";
import { createIntake, fetchSession } from "@/lib/api";
import type { SixWThreeH, ApiError } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AnvilGlyph, SparkGlyph, SpikeMark } from "./forge-glyphs";

/** The four distinct phases of the intake chatbot flow */
type Phase = "idea" | "fields" | "submitting" | "done";

/** A single line in the chat transcript */
type ChatLine = {
  id: string;
  role: "bot" | "user";
  text: string;
  /** Optional 6W3H field label shown above the message */
  field?: string;
};

/**
 * TypingIndicator — Animated dots that appear when the AI is "thinking."
 * Three dots bounce in sequence to convey processing activity.
 */
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    className="flex gap-3"
  >
    {/* Bot avatar */}
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg surface-3 text-emerald edge-highlight">
      <SpikeMark className="h-3.5 w-3.5" />
    </span>
    {/* Bouncing dots container */}
    <div className="flex items-center gap-1.5 rounded-lg rounded-tl-sm surface-2 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-emerald"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
);

/**
 * ErrorBar — Inline error display with retry button.
 * Appears below the chat when an API call fails.
 *
 * @param message - The error message to display
 * @param onRetry - Callback to retry the failed operation
 * @param onDismiss - Callback to dismiss the error
 */
const ErrorBar = ({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3"
  >
    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
    <span className="flex-1 text-sm text-red-400">{message}</span>
    <div className="flex items-center gap-2">
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 gap-1.5 text-xs text-red-400 hover:text-red-300"
          aria-label="Retry failed operation"
        >
          <RotateCcw className="h-3 w-3" />
          Retry
        </Button>
      )}
      <button
        onClick={onDismiss}
        className="text-xs text-muted-foreground hover:text-foreground"
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  </motion.div>
);

/**
 * IntakeChatbot — The main intake component for Stage 01.
 *
 * Renders a chat-style interface where the user enters a raw idea,
 * then answers 9 structured 6W3H questions. The component manages
 * its own internal state machine (phase) and communicates with the
 * global Zustand store for cross-stage data (roadmap, stage).
 */
export const IntakeChatbot = () => {
  /* ── Zustand store bindings ─────────────────────────────── */
  const setUserId = useIdeaforge((s) => s.setUserId);
  const setRoadmap = useIdeaforge((s) => s.setRoadmap);
  const setStage = useIdeaforge((s) => s.setStage);

  /* ── Local state ────────────────────────────────────────── */
  const [phase, setPhase] = useState<Phase>("idea");
  const [rawIdea, setRawIdea] = useState("");
  const [fieldIndex, setFieldIndex] = useState(0);
  const [fieldAnswer, setFieldAnswer] = useState("");
  const [answers, setAnswers] = useState<SixWThreeH>({});
  const [chat, setChat] = useState<ChatLine[]>([
    {
      id: "greet",
      role: "bot",
      text: "Let's forge this idea. Tell me, in your own words, what you're trying to build — messy is fine. I'll sharpen it from there.",
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  /** Whether the bot is "typing" (brief delay before showing next question) */
  const [isTyping, setIsTyping] = useState(false);

  /* ── Auto-scroll chat to bottom on new messages ────────── */
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat, phase, fieldIndex, isTyping]);

  /**
   * Ensures a session exists by fetching/creating one from the API.
   * Stores the userId in the Zustand store for subsequent API calls.
   * @returns The user's session ID
   */
  const ensureSession = async () => {
    const { userId } = await fetchSession();
    setUserId(userId);
    return userId;
  };

  /**
   * Commits the raw idea and transitions to the 6W3H field-by-field phase.
   * Validates that the idea is at least 10 characters long.
   */
  const commitIdea = () => {
    if (rawIdea.trim().length < 10) {
      setError("Give me at least a sentence or two to work with.");
      return;
    }
    setError(null);
    setChat((c) => [
      ...c,
      { id: `u-idea-${Date.now()}`, role: "user", text: rawIdea.trim() },
      {
        id: `b-ack-${Date.now()}`,
        role: "bot",
        text: "Good — that's enough to work with. Now the 6W3H framework: nine questions to sharpen the structure. Answer what you know, skip what you don't. I infer the gaps — never overwriting what you type.",
      },
      {
        id: `b-q0-${Date.now()}`,
        role: "bot",
        text: SIX_W_THREE_H_FIELDS[0].question,
      }
    ]);
    setPhase("fields");
  };

  /** The current 6W3H field being asked */
  const currentField = SIX_W_THREE_H_FIELDS[fieldIndex];

  /**
   * Records the user's answer for the current 6W3H field (or skips it),
   * adds it to the chat transcript, and advances to the next field.
   * If this was the last field, triggers the submission flow.
   *
   * @param skip - Whether the user chose to skip this field
   */
  const answerField = (skip: boolean) => {
    const value = skip ? undefined : fieldAnswer.trim();
    if (!skip && value && value.length > 0) {
      setAnswers((a) => ({ ...a, [currentField.key]: value }));
      setChat((c) => [
        ...c,
        { id: `u-${currentField.key}-${Date.now()}`, role: "user", text: value, field: currentField.label },
      ]);
    } else {
      setChat((c) => [
        ...c,
        { id: `u-${currentField.key}-${Date.now()}`, role: "user", text: "— skip, infer it —", field: currentField.label },
      ]);
    }
    setFieldAnswer("");

    if (fieldIndex < SIX_W_THREE_H_FIELDS.length - 1) {
      /* Show a brief typing indicator before the next question appears */
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChat((c) => [
          ...c,
          {
            id: `b-q${fieldIndex + 1}-${Date.now()}`,
            role: "bot",
            text: SIX_W_THREE_H_FIELDS[fieldIndex + 1].question,
          },
        ]);
        setFieldIndex((i) => i + 1);
      }, 400);
    } else {
      void submit();
    }
  };

  /**
   * Submits the completed intake (raw idea + 6W3H answers) to the API.
   * The backend infers any skipped fields, structures the idea, and
   * returns a roadmap scaffold. On success, transitions to "done" phase.
   * On failure, shows an error with retry capability.
   */
  const submit = async () => {
    setPhase("submitting");
    setChat((c) => [
      ...c,
      { id: `b-submit-${Date.now()}`, role: "bot", text: "Forging now — inferring the gaps and locking in the structure…" },
    ]);
    try {
      const userId = await ensureSession();
      const { roadmap } = await createIntake({ userId, rawIdea: rawIdea.trim(), sixWThreeH: answers });
      setRoadmap(roadmap);
      setChat((c) => [
        ...c,
        {
          id: `b-done-${Date.now()}`,
          role: "bot",
          text: `Structured as "${roadmap.title.slice(0, 56)}${roadmap.title.length > 56 ? "…" : ""}". Next: pressure-test the assumptions hiding inside it.`,
        },
      ]);
      setPhase("done");
    } catch (e) {
      const err = e as ApiError;
      const msg = err.status === 403 ? err.message : "The forge hiccuped. Try again in a moment.";
      setError(msg ?? "Something went wrong.");
      toast.error(msg ?? "Something went wrong.");
      setPhase("fields");
    }
  };

  /**
   * Retry handler — called from the ErrorBar when the user wants to
   * re-attempt a failed submission.
   */
  const handleRetry = useCallback(() => {
    setError(null);
    void submit();
  }, [answers, rawIdea]);

  /* ── Derived values ─────────────────────────────────────── */
  /** Overall progress percentage (0–100) across the 9 fields */
  const progress = phase === "idea" ? 0 : Math.round((fieldIndex / SIX_W_THREE_H_FIELDS.length) * 100);
  /** Count of fields the user has actually answered (not skipped) */
  const answeredCount = Object.keys(answers).length;

  return (
    <section
      id="intake"
      className="relative mx-auto max-w-5xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8"
      aria-label="Idea intake chatbot"
    >
      {/* ── Section header — spec-sheet taxonomy ─────────── */}
      <div className="mb-10">
        <span className="eyebrow">01 · intake · 6W3H agent</span>
        <h2 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
          Drop the raw idea. <span className="text-gradient-emerald">We'll structure it.</span>
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          A 6W3H chatbot turns a vague thought into a structured problem statement.
          The agent infers whatever you skip — but never overwrites what you type.
        </p>
      </div>

      {/* ── The forge interface ── */}
      <div className="relative overflow-hidden rounded-lg lift mt-8">
        {/* ── Window chrome — mono ID, not mac dots ────────── */}
        <div className="flex items-center justify-between border-b border-border surface-2 px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <AnvilGlyph className="h-4 w-4 text-emerald" />
            <span className="eyebrow text-muted-foreground">intake.console</span>
            <span className="eyebrow text-muted-foreground/40">/ agent-01</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-muted-foreground/60">session</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse-dot" />
            <span className="eyebrow text-emerald">live</span>
          </div>
        </div>

        {/* ── Progress rail — segmented, shows field completion ── */}
        <div className="flex items-center gap-1 border-b border-border px-5 py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < fieldIndex || phase === "submitting" || phase === "done"
                  ? "bg-emerald"
                  : i === fieldIndex && phase === "fields"
                    ? "bg-emerald/50"
                    : "surface-3"
              }`}
              aria-hidden="true"
            />
          ))}
          {/* Step counter — visible during fields phase */}
          {phase === "fields" && (
            <span className="ml-2 shrink-0 eyebrow text-muted-foreground/60 text-[10px]">
              {fieldIndex + 1}/9
            </span>
          )}
          {phase === "done" && (
            <span className="ml-2 shrink-0 eyebrow text-emerald text-[10px]">
              ✓ done
            </span>
          )}
        </div>

        {/* ── Chat transcript ─────────────────────────────── */}
        <div
          ref={scrollRef}
          className="max-h-[400px] min-h-[300px] space-y-4 overflow-y-auto p-5 sm:p-6"
          role="log"
          aria-label="Chat transcript"
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            {chat.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-3 ${line.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar — spike-mark for agent, mono "you" for user */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    line.role === "bot" ? "surface-3 text-emerald edge-highlight" : "surface-2 text-muted-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {line.role === "bot" ? (
                    <SpikeMark className="h-3.5 w-3.5" />
                  ) : (
                    <span className="eyebrow text-[9px]">you</span>
                  )}
                </span>
                <div
                  className={`max-w-[78%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                    line.role === "bot"
                      ? "rounded-tl-sm surface-2 text-foreground"
                      : "rounded-tr-sm surface-3 text-foreground ring-1 ring-inset ring-emerald/15"
                  }`}
                >
                  {line.field && (
                    <span className="mb-1 block eyebrow text-emerald/80">{line.field}</span>
                  )}
                  {line.text}
                </div>
              </motion.div>
            ))}
            {/* Typing indicator — shown briefly between questions and during submission */}
            {(isTyping || phase === "submitting") && (
              <TypingIndicator key="typing" />
            )}
          </AnimatePresence>
        </div>

        {/* ── Error bar — shown when API calls fail ───────── */}
        <AnimatePresence>
          {error && phase !== "idea" && (
            <div className="px-4 pb-2">
              <ErrorBar
                message={error}
                onRetry={phase === "fields" ? handleRetry : undefined}
                onDismiss={() => setError(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* ── Input area — surface-2 separator ────────────── */}
        <div className="border-t border-border surface-2 p-4 sm:p-5">
          {/* Phase: Raw idea entry */}
          {phase === "idea" && (
            <div className="space-y-3">
              <Textarea
                value={rawIdea}
                onChange={(e) => setRawIdea(e.target.value)}
                placeholder="e.g. A peer-to-peer skill-swapping app for university students who can't afford paid courses…"
                className="min-h-[100px] resize-none border-border surface-1 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-emerald/40"
                aria-label="Your raw idea"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (rawIdea.trim().length >= 10) {
                      commitIdea();
                    }
                  }
                }}
              />
              <div className="flex items-center justify-between">
                <span className="eyebrow text-muted-foreground/60">
                  {rawIdea.length}<span className="text-muted-foreground/40">/2000</span>
                </span>
                <div className="flex items-center gap-2">
                  {error && <span className="text-xs text-red-500">{error}</span>}
                  <Button
                    onClick={commitIdea}
                    disabled={rawIdea.trim().length < 10}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase: 6W3H field-by-field questions */}
          {phase === "fields" && currentField && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md surface-3 text-emerald">
                    <SparkGlyph className="h-3 w-3" />
                  </span>
                  <span className="eyebrow text-muted-foreground">
                    q{fieldIndex + 1}<span className="text-muted-foreground/40">/9</span> · {currentField.label}
                  </span>
                </div>
                <span className="eyebrow text-muted-foreground/60">
                  {answeredCount} answered
                </span>
              </div>
              <Textarea
                value={fieldAnswer}
                onChange={(e) => setFieldAnswer(e.target.value)}
                placeholder={currentField.placeholder}
                className="min-h-[72px] resize-none border-border surface-1 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-emerald/40"
                aria-label={`Answer for: ${currentField.label}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (fieldAnswer.trim().length > 0) {
                      answerField(false);
                    }
                  }
                }}
                autoFocus
              />
              <div className="flex items-center justify-between gap-2">
                <p className="hidden text-xs text-muted-foreground/70 sm:block">
                  <span className="text-emerald/80">·</span> {currentField.hint}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => answerField(true)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Skip this question and let AI infer"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    Skip
                  </Button>
                  <Button
                    onClick={() => answerField(false)}
                    disabled={fieldAnswer.trim().length === 0}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {fieldIndex < SIX_W_THREE_H_FIELDS.length - 1 ? "Next" : "Forge it"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Phase: Submitting to the API */}
          {phase === "submitting" && (
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-emerald" />
              Inferring gaps & structuring your idea…
            </div>
          )}

          {/* Phase: Done — roadmap created, proceed to assumptions */}
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-5 sm:flex-row sm:justify-between"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage/20">
                  <Check className="h-3.5 w-3.5 text-sage" />
                </span>
                <span className="text-foreground">Roadmap scaffold created.</span>
              </div>
              <Button
                onClick={() => setStage("assumptions")}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Pressure-test assumptions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
