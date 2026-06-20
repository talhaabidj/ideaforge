"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Spinner, Warning, Check, X } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import { generateAssumptions, listAssumptions, validateAssumption } from "@/lib/api";
import type { Assumption, RiskLevel, ApiError, ValidationState } from "@/lib/types";
import { Reveal } from "./motion";
import { HitlBanner } from "./hitl-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RISK_DOT: Record<RiskLevel, string> = {
  high: "#dc2626",
  medium: "#f59e0b",
  low: "var(--emerald)",
};
const RISK_LABEL: Record<RiskLevel, string> = { high: "high", medium: "medium", low: "low" };

export const AssumptionsView = () => {
  const roadmap = useIdeaforge((s) => s.roadmap);
  const assumptions = useIdeaforge((s) => s.assumptions);
  const setAssumptions = useIdeaforge((s) => s.setAssumptions);
  const setStage = useIdeaforge((s) => s.setStage);

  const [focusHint, setFocusHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  const hydrated = useRef<string | null>(null);
  useEffect(() => {
    if (!roadmap || hydrated.current === roadmap.id) return;
    hydrated.current = roadmap.id;
    listAssumptions(roadmap.id)
      .then(({ assumptions: a }) => setAssumptions(a))
      .catch(() => {});
  }, [roadmap, setAssumptions]);

  const run = async () => {
    if (!roadmap) return;
    setLoading(true);
    try {
      const { assumptions: a } = await generateAssumptions(roadmap.id, focusHint.trim() || undefined);
      setAssumptions(a);
      toast.success(`${a.length} assumptions surfaced.`);
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't surface assumptions.");
    } finally {
      setLoading(false);
    }
  };

  const validate = async (id: string, state: ValidationState) => {
    setValidating(id);
    try {
      const { assumption } = await validateAssumption(id, state);
      setAssumptions(assumptions.map((a) => (a.id === id ? assumption : a)));
      toast.success(state === "validated" ? "Marked as validated." : "Marked as invalidated.");
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't update assumption.");
    } finally {
      setValidating(null);
    }
  };

  const highCount = assumptions.filter((a) => a.riskLevel === "high").length;
  const validatedCount = assumptions.filter((a) => a.isValidated === "validated").length;
  const invalidatedCount = assumptions.filter((a) => a.isValidated === "invalidated").length;

  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <Reveal>
        <span className="eyebrow">02 · assumptions · risk analyst</span>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
            What could <span className="text-gradient-emerald">sink</span> this?
          </h2>
          {assumptions.length > 0 && (
            <div className="flex items-center gap-2 lift-2 rounded-full px-3 py-1.5">
              <Warning size={13} weight="fill" className="text-[#dc2626]" />
              <span className="ui-mono text-mute">
                <span className="text-[#dc2626]">{highCount}</span> high · {validatedCount} ✓ · {invalidatedCount} ✗
              </span>
            </div>
          )}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-body max-w-xl">
          An analytical agent surfaces the 3–5 riskiest, unvalidated beliefs hiding
          in your idea — the ones that, if wrong, would sink it.
        </p>
      </Reveal>

      {/* HITL disclaimer banner */}
      <div className="mt-6">
        <HitlBanner />
      </div>

      {roadmap && (
        <Reveal delay={0.05}>
          <div className="mt-6 lift-2 rounded-lg p-4">
            <span className="eyebrow">source idea</span>
            <p className="mt-1.5 text-[13px] text-foreground">{roadmap.rawIdea}</p>
          </div>
        </Reveal>
      )}

      {assumptions.length === 0 && (
        <Reveal delay={0.1}>
          <div className="mt-6 lift rounded-lg p-6">
            <span className="eyebrow">Optional focus hint</span>
            <p className="mt-1 text-[12px] text-mute">Steer the analyst — e.g. "focus on pricing risk".</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={focusHint}
                onChange={(e) => setFocusHint(e.target.value)}
                placeholder="e.g. focus on willingness to pay"
                className="border-[var(--hairline)] bg-[var(--canvas)] placeholder:text-mute/60 focus-visible:ring-emerald/40"
              />
              <Button onClick={run} disabled={loading} className="shrink-0 bg-foreground text-background hover:bg-foreground/90">
                {loading ? (
                  <><Spinner size={14} weight="regular" className="animate-spin" />Analyzing…</>
                ) : (
                  <><Warning size={14} weight="regular" />Surface assumptions</>
                )}
              </Button>
            </div>
          </div>
        </Reveal>
      )}

      {loading && assumptions.length === 0 && (
        <div className="mt-6 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-lg surface-1 animate-pulse" />
          ))}
        </div>
      )}

      {assumptions.length > 0 && (
        <div className="mt-6 space-y-2">
          <AnimatePresence>
            {assumptions.map((a, i) => {
              const dot = RISK_DOT[a.riskLevel];
              const isValidated = a.isValidated === "validated";
              const isInvalidated = a.isValidated === "invalidated";
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`lift rounded-lg p-4 ${isInvalidated ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="ui-mono text-mute mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ui-mono"
                          style={{ background: `${dot}14`, color: dot }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
                          {RISK_LABEL[a.riskLevel]} risk
                        </span>
                        {a.riskLevel === "high" && (
                          <span className="text-[11px] text-[#dc2626]">test this first</span>
                        )}
                        {isValidated && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 ui-mono"
                            style={{ background: "rgba(31,111,74,0.1)", color: "var(--emerald)" }}>
                            <Check size={10} weight="bold" /> validated
                          </span>
                        )}
                        {isInvalidated && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 ui-mono"
                            style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}>
                            <X size={10} weight="bold" /> invalidated
                          </span>
                        )}
                      </div>
                      <p className="text-[14px] leading-relaxed text-foreground">{a.statement}</p>

                      {/* Validation buttons — HITL: human decides which assumptions hold */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => validate(a.id, "validated")}
                          disabled={validating === a.id || isValidated}
                          className="inline-flex items-center gap-1.5 rounded-md hairline px-2.5 py-1 text-[12px] font-medium transition-smooth hover:shadow-sm disabled:opacity-40"
                          style={isValidated ? { background: "rgba(31,111,74,0.1)", color: "var(--emerald)" } : {}}
                        >
                          {validating === a.id ? <Spinner size={11} weight="regular" className="animate-spin" /> : <Check size={12} weight="regular" />}
                          Validate
                        </button>
                        <button
                          onClick={() => validate(a.id, "invalidated")}
                          disabled={validating === a.id || isInvalidated}
                          className="inline-flex items-center gap-1.5 rounded-md hairline px-2.5 py-1 text-[12px] font-medium transition-smooth hover:shadow-sm disabled:opacity-40"
                          style={isInvalidated ? { background: "rgba(220,38,38,0.1)", color: "#dc2626" } : {}}
                        >
                          {validating === a.id ? <Spinner size={11} weight="regular" className="animate-spin" /> : <X size={12} weight="regular" />}
                          Invalidate
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {assumptions.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-8 lift rounded-lg p-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[14px] font-medium text-foreground">Ready to forge the plan?</p>
              <p className="text-[13px] text-mute">Next, the execution coach builds your 30/60/90-day roadmap.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={run} disabled={loading} className="text-mute hover:text-foreground">
                {loading ? <Spinner size={14} weight="regular" className="animate-spin" /> : "Re-run"}
              </Button>
              <Button onClick={() => setStage("milestones")} className="bg-foreground text-background hover:bg-foreground/90">
                Build roadmap
                <ArrowRight size={14} weight="bold" />
              </Button>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
};
