"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Clock,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import { recommendFirstStep, fetchFirstStep } from "@/lib/api";
import type { ApiError } from "@/lib/types";
import { Reveal } from "./motion-primitives";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaliperGlyph, TargetGlyph } from "./forge-glyphs";

export const FirstStepView = () => {
  const roadmap = useIdeaforge((s) => s.roadmap);
  const milestones = useIdeaforge((s) => s.milestones);
  const firstStep = useIdeaforge((s) => s.firstStep);
  const setFirstStep = useIdeaforge((s) => s.setFirstStep);
  const setStage = useIdeaforge((s) => s.setStage);

  const [focusMilestoneId, setFocusMilestoneId] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Hydrate from the API on mount (store only persists roadmap + stage).
  const hydrated = useRef<string | null>(null);
  useEffect(() => {
    if (!roadmap || hydrated.current === roadmap.id) return;
    hydrated.current = roadmap.id;
    fetchFirstStep(roadmap.id)
      .then(({ firstStep: fs }) => setFirstStep(fs))
      .catch(() => {});
  }, [roadmap, setFirstStep]);

  const run = async () => {
    if (!roadmap) return;
    setLoading(true);
    try {
      const focusId = focusMilestoneId === "all" ? undefined : focusMilestoneId;
      const { firstStep: fs } = await recommendFirstStep(roadmap.id, focusId);
      setFirstStep(fs);
      toast.success("Your first step is ready.");
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't isolate a first step.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-4 flex items-center gap-3">
          <span className="mono-eyebrow text-ember">04 / first step</span>
          <span className="h-px w-12 bg-border" />
          <span className="mono-eyebrow text-muted-foreground/50">stage 04 · paralysis-breaker</span>
        </div>
        <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-foreground">
          The <span className="text-molten italic">smallest</span> thing you can do.
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Execution paralysis ends here. The agent isolates the single smallest
          testable action you can take in the next 24–48 hours — no budget, no
          team — that produces real signal about your riskiest assumption.
        </p>
      </Reveal>

      {/* Controls */}
      {!firstStep && (
        <Reveal delay={0.1}>
          <div className="mt-8 rounded-xl border border-border surface-1 p-6 shadow-stack sm:p-7">
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Anchor to a milestone (optional)
                </label>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Point the agent at a specific milestone to derive the action
                  from, or let it scan the whole roadmap.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={focusMilestoneId} onValueChange={setFocusMilestoneId}>
                  <SelectTrigger className="border-border bg-background/50 focus-visible:ring-ember/40">
                    <SelectValue placeholder="Whole roadmap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Whole roadmap</SelectItem>
                    {milestones.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        [Day {m.dayBucket}] {m.title.slice(0, 40)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={run}
                  disabled={loading}
                  className="shrink-0 bg-gradient-to-r from-ember to-coral text-ink hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Isolating…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Find my first step
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Loading */}
      {loading && !firstStep && (
        <div className="mt-8 h-48 rounded-xl shimmer" />
      )}

      {/* Result */}
      {firstStep && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <div className="border-hairline relative rounded-xl">
            <div className="relative overflow-hidden rounded-xl surface-1 p-7 shadow-stack-lg sm:p-9 grain">
              {/* glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 ember-glow blur-3xl opacity-50" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-ember/15 px-3 py-1 mono-eyebrow text-ember ring-1 ring-inset ring-ember/30">
                    <TargetGlyph className="h-3 w-3" />
                    your first move
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border surface-2 px-3 py-1 mono-eyebrow text-muted-foreground">
                    <Clock className="h-3 w-3 text-ember" />
                    ~{Math.round(firstStep.estimatedTimeHours)}h
                  </span>
                </div>

                <p className="mt-6 font-serif text-2xl leading-snug text-foreground sm:text-3xl">
                  {firstStep.action}
                </p>

                <div className="mt-6 rounded-lg border border-border surface-2 p-4">
                  <p className="mono-eyebrow text-muted-foreground/60">
                    why this
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {firstStep.rationale}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 mono-eyebrow text-muted-foreground">
                  <CaliperGlyph className="h-3.5 w-3.5 text-ember" />
                  no budget
                  <span className="text-border">·</span>
                  no team
                  <span className="text-border">·</span>
                  real signal
                </div>
              </div>
            </div>
          </div>

          {/* Proceed */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border surface-1 p-6 shadow-stack sm:flex-row">
            <div className="flex items-start gap-3">
              <TargetGlyph className="mt-0.5 h-5 w-5 shrink-0 text-sage" />
              <div>
                <p className="font-serif text-lg text-foreground">Your roadmap is complete.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  See the full picture — idea, assumptions, plan, and first move — in one view.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setStage("complete")}
              className="shrink-0 bg-gradient-to-r from-ember to-coral text-ink hover:opacity-90"
            >
              View dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  );
};
