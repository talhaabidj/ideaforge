"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Plus, Spinner, CalendarDots, Info } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import { generateMilestones, acceptMilestone, listMilestones } from "@/lib/api";
import type { Milestone, ApiError } from "@/lib/types";
import { Reveal } from "./motion";
import { HitlBanner } from "./hitl-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BUCKETS = [
  { day: 30, label: "First 30 days", sub: "validate the riskiest assumption" },
  { day: 60, label: "Days 31–60", sub: "build the smallest version" },
  { day: 90, label: "Days 61–90", sub: "ship and learn from real signal" },
] as const;

export const MilestonesView = () => {
  const roadmap = useIdeaforge((s) => s.roadmap);
  const milestones = useIdeaforge((s) => s.milestones);
  const setMilestones = useIdeaforge((s) => s.setMilestones);
  const setStage = useIdeaforge((s) => s.setStage);

  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);

  const hydrated = useRef<string | null>(null);
  useEffect(() => {
    if (!roadmap || hydrated.current === roadmap.id) return;
    hydrated.current = roadmap.id;
    listMilestones(roadmap.id).then(({ milestones: m }) => setMilestones(m)).catch(() => {});
  }, [roadmap, setMilestones]);

  const run = async () => {
    if (!roadmap) return;
    setLoading(true);
    try {
      const { milestones: m } = await generateMilestones(roadmap.id, constraints.trim() || undefined);
      setMilestones(m);
      toast.success(`${m.length} milestones forged.`);
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't generate the roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const accept = async (id: string) => {
    setAccepting(id);
    try {
      const { milestone } = await acceptMilestone(id);
      setMilestones(milestones.map((m) => (m.id === id ? milestone : m)));
      toast.success("Milestone accepted.");
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't accept milestone.");
    } finally {
      setAccepting(null);
    }
  };

  const acceptedCount = milestones.filter((m) => m.isAccepted).length;
  const grouped = BUCKETS.map((b) => ({
    ...b,
    items: milestones.filter((m) => m.dayBucket === b.day).sort((a, b2) => a.orderIndex - b2.orderIndex),
  }));

  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <Reveal>
        <span className="eyebrow">03 · roadmap · execution coach</span>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
            Your <span className="text-gradient-emerald">30·60·90</span> plan
          </h2>
          {milestones.length > 0 && (
            <div className="flex items-center gap-2 lift-2 rounded-full px-3 py-1.5">
              <Check size={13} weight="bold" className="text-emerald" style={{ color: "var(--emerald)" }} />
              <span className="ui-mono text-mute">
                <span className="text-emerald" style={{ color: "var(--emerald)" }}>{acceptedCount}</span>/{milestones.length} accepted
              </span>
            </div>
          )}
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-body max-w-xl">
          A chronological, achievable roadmap. The AI only proposes — every milestone
          stays a draft until you accept it. Human-in-the-loop, always.
        </p>
      </Reveal>

      {/* HITL disclaimer banner */}
      <div className="mt-6">
        <HitlBanner />
      </div>

      {milestones.length === 0 && (
        <Reveal delay={0.1}>
          <div className="mt-6 lift rounded-lg p-6">
            <span className="eyebrow">Optional real-world constraints</span>
            <p className="mt-1 text-[12px] text-mute">Budget, time, team size — anything the coach should factor in.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. solo founder, ~5 hrs/week, $0 budget"
                className="border-[var(--hairline)] bg-[var(--canvas)] placeholder:text-mute/60 focus-visible:ring-emerald/40"
              />
              <Button onClick={run} disabled={loading} className="shrink-0 bg-foreground text-background hover:bg-foreground/90">
                {loading ? (
                  <><Spinner size={14} weight="regular" className="animate-spin" />Forging…</>
                ) : (
                  <><CalendarDots size={14} weight="regular" />Generate roadmap</>
                )}
              </Button>
            </div>
          </div>
        </Reveal>
      )}

      {loading && milestones.length === 0 && (
        <div className="mt-6 space-y-6">
          {BUCKETS.map((b) => (
            <div key={b.day}>
              <div className="mb-2 h-4 w-32 surface-1 rounded animate-pulse" />
              <div className="space-y-1.5">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 rounded-lg surface-1 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mt-8 space-y-8">
          {grouped.map((bucket) => (
            <div key={bucket.day}>
              <div className="mb-3 flex items-center gap-3">
                <span className="ui-mono font-medium" style={{ color: "var(--emerald)" }}>DAY {bucket.day}</span>
                <div>
                  <h3 className="text-[15px] font-medium text-foreground">{bucket.label}</h3>
                  <p className="text-[12px] text-mute">{bucket.sub}</p>
                </div>
                <span className="ml-auto h-px flex-1" style={{ background: "var(--hairline)" }} />
              </div>
              <div className="space-y-1.5">
                <AnimatePresence>
                  {bucket.items.map((m, i) => (
                    <motion.div
                      key={m.id}
                      layout
                      className={`flex items-start gap-3 rounded-lg p-3.5 lift ${
                        m.isAccepted ? "" : ""
                      }`}
                      style={m.isAccepted ? { background: "rgba(31,111,74,0.04)", borderColor: "rgba(31,111,74,0.2)" } : {}}
                    >
                      <button
                        onClick={() => !m.isAccepted && accept(m.id)}
                        disabled={m.isAccepted || accepting === m.id}
                        className="mt-0.5 shrink-0"
                        aria-label={m.isAccepted ? "Accepted" : "Accept milestone"}
                      >
                        {m.isAccepted ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: "var(--emerald)" }}>
                            <Check size={11} weight="bold" className="text-white" />
                          </span>
                        ) : (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full hairline transition-smooth hover:shadow-sm"
                            style={{ borderColor: "var(--hairline)" }}>
                            {accepting === m.id ? (
                              <Spinner size={10} weight="regular" className="animate-spin" style={{ color: "var(--emerald)" }} />
                            ) : (
                              <Plus size={11} weight="regular" className="text-mute" />
                            )}
                          </span>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="ui-mono text-mute">{String(i + 1).padStart(2, "0")}</span>
                          <h4 className="text-[14px] font-medium text-foreground">{m.title}</h4>
                          {m.isAccepted && (
                            <span className="rounded-full px-1.5 py-0.5 ui-mono text-[10px]"
                              style={{ background: "rgba(31,111,74,0.1)", color: "var(--emerald)" }}>
                              committed
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <p className="mt-1 text-[13px] leading-relaxed text-body">{m.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {bucket.items.length === 0 && (
                <p className="rounded-lg border border-dashed p-3 text-center text-[12px] text-mute"
                  style={{ borderColor: "var(--hairline)" }}>
                  No milestones for this bucket.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {milestones.length > 0 && (
        <Reveal delay={0.1}>
          <div className="mt-10 lift rounded-lg p-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[14px] font-medium text-foreground">One last thing.</p>
              <p className="text-[13px] text-mute">Let's isolate the single smallest action you can take in the next 24 hours.</p>
            </div>
            <Button onClick={() => setStage("first-step")} className="bg-foreground text-background hover:bg-foreground/90">
              Find my first step
              <ArrowRight size={14} weight="bold" />
            </Button>
          </div>
        </Reveal>
      )}
    </section>
  );
};
