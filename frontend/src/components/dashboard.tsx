"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, ArrowClockwise, Target, ChatCircleDots, Warning, CalendarDots, Trash } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import type { RiskLevel } from "@/lib/types";
import { cleanSixWThreeH } from "@/lib/six-w-three-h";
import { deleteRoadmap } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { HitlBanner } from "./hitl-banner";
import { Reveal } from "./motion";

const RISK_DOT: Record<RiskLevel, string> = {
  high: "#dc2626",
  medium: "#f59e0b",
  low: "var(--emerald)",
};
const BUCKET_LABEL: Record<number, string> = { 30: "First 30", 60: "31–60", 90: "61–90" };

export const Dashboard = () => {
  const roadmap = useIdeaforge((s) => s.roadmap);
  const assumptions = useIdeaforge((s) => s.assumptions);
  const milestones = useIdeaforge((s) => s.milestones);
  const firstStep = useIdeaforge((s) => s.firstStep);
  const setStage = useIdeaforge((s) => s.setStage);
  const reset = useIdeaforge((s) => s.reset);

  const [deleting, setDeleting] = useState(false);

  const acceptedCount = milestones.filter((m) => m.isAccepted).length;
  const highRisk = assumptions.filter((a) => a.riskLevel === "high").length;
  const sixW3H = cleanSixWThreeH(roadmap?.sixW3hSummary ?? null);

  const stats = [
    { label: "assumptions", value: assumptions.length, icon: Warning, accent: "#dc2626" },
    { label: "milestones", value: milestones.length, icon: CalendarDots, accent: "var(--emerald)" },
    { label: "committed", value: acceptedCount, icon: Check, accent: "var(--emerald)" },
    { label: "high-risk", value: highRisk, icon: Target, accent: "#dc2626" },
  ];

  const handleDelete = async () => {
    if (!roadmap) return;
    setDeleting(true);
    try {
      await deleteRoadmap(roadmap.id);
      toast.success("Roadmap deleted.");
      reset();
    } catch {
      toast.error("Couldn't delete roadmap.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">complete · your roadmap</span>
            <h2 className="mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
              From <span className="text-gradient-emerald">spark</span> to signal
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-9 w-9 items-center justify-center rounded-md hairline surface-1 transition-smooth hover:shadow-sm disabled:opacity-40"
              aria-label="Delete roadmap"
            >
              <Trash size={14} weight="regular" className="text-mute" />
            </button>
            <Button variant="outline" onClick={reset}
              className="border-[var(--hairline)] bg-[var(--canvas)] text-foreground hover:surface-1">
              <ArrowClockwise size={13} weight="regular" />
              Forge a new idea
            </Button>
          </div>
        </div>
      </Reveal>

      {/* HITL banner */}
      <div className="mt-6">
        <HitlBanner />
      </div>

      {/* Title card */}
      <div className="mt-6 lift rounded-lg overflow-hidden">
        <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md surface-1 hairline">
              <ChatCircleDots size={18} weight="regular" style={{ color: "var(--emerald)" }} />
            </div>
            <div>
              <span className="eyebrow">roadmap</span>
              <h3 className="mt-0.5 text-[18px] font-medium leading-tight text-foreground">{roadmap?.title}</h3>
              <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-body">{roadmap?.rawIdea}</p>
            </div>
          </div>
          <span className="rounded-full px-2.5 py-1 ui-mono"
            style={{ background: "rgba(31,111,74,0.1)", color: "var(--emerald)" }}>
            {roadmap?.status}
          </span>
        </div>
        <div className="hairline-t grid grid-cols-2 surface-1 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="p-4" style={{ background: "var(--canvas)" }}>
              <div className="flex items-center gap-2">
                <s.icon size={13} weight="regular" style={{ color: s.accent }} />
                <span className="font-display text-2xl text-foreground tabular-nums">{s.value}</span>
              </div>
              <p className="mt-1 eyebrow">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          {sixW3H.fields.length > 0 && (
            <div className="lift rounded-lg p-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                  <ChatCircleDots size={14} weight="regular" style={{ color: "var(--emerald)" }} />
                  6W3H structure
                </h4>
                <button onClick={() => setStage("intake")} className="eyebrow hover:text-emerald">edit</button>
              </div>
              <dl className="space-y-1.5">
                {sixW3H.fields.map((f) => (
                  <div key={f.key} className="flex gap-3 lift-2 rounded-md px-2.5 py-1.5">
                    <dt className="w-16 shrink-0 ui-mono" style={{ color: "var(--emerald)" }}>{f.key}</dt>
                    <dd className={`text-[12px] ${f.value ? "text-foreground" : "text-mute italic"}`}>
                      {f.value || "needs founder input"}
                    </dd>
                  </div>
                ))}
              </dl>
              {sixW3H.gaps > 0 && (
                <p className="mt-3 text-[11px] text-mute">{sixW3H.gaps} gap{sixW3H.gaps > 1 ? "s" : ""} inferred</p>
              )}
            </div>
          )}

          {firstStep && (
            <div className="lift rounded-lg p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{ background: "rgba(31,111,74,0.1)" }}>
                  <Target size={11} weight="fill" style={{ color: "var(--emerald)" }} />
                  <span className="ui-mono" style={{ color: "var(--emerald)" }}>first move</span>
                </span>
                <span className="ui-mono text-mute">~{Math.round(firstStep.estimatedTimeHours)}h</span>
              </div>
              <p className="mt-3 text-[16px] font-medium leading-snug text-foreground">{firstStep.action}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-body">{firstStep.rationale}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="lift rounded-lg p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                <Warning size={14} weight="regular" className="text-[#dc2626]" />
                Riskiest assumptions
              </h4>
              <button onClick={() => setStage("assumptions")} className="eyebrow hover:text-emerald">view all</button>
            </div>
            <div className="space-y-1.5">
              {assumptions.slice(0, 4).map((a, i) => (
                <div key={a.id} className="flex items-start gap-2.5 lift-2 rounded-md p-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RISK_DOT[a.riskLevel] }} />
                  <p className="text-[12px] leading-relaxed text-foreground">
                    <span className="mr-1.5 ui-mono text-mute">{String(i + 1).padStart(2, "0")}</span>
                    {a.statement}
                  </p>
                </div>
              ))}
              {assumptions.length === 0 && (
                <p className="text-[12px] text-mute italic p-2">No assumptions yet.</p>
              )}
            </div>
          </div>

          <div className="lift rounded-lg p-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-[15px] font-medium text-foreground">
                <CalendarDots size={14} weight="regular" style={{ color: "var(--emerald)" }} />
                30·60·90 roadmap
              </h4>
              <button onClick={() => setStage("milestones")} className="eyebrow hover:text-emerald">view all</button>
            </div>
            <div className="space-y-3">
              {[30, 60, 90].map((bucket) => {
                const items = milestones.filter((m) => m.dayBucket === bucket);
                if (items.length === 0) return null;
                return (
                  <div key={bucket}>
                    <p className="mb-1.5 eyebrow">day {bucket} · {BUCKET_LABEL[bucket]}</p>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((m) => (
                        <div key={m.id} className="flex items-center gap-2 lift-2 rounded-md px-2.5 py-1.5">
                          {m.isAccepted ? (
                            <Check size={12} weight="bold" className="shrink-0" style={{ color: "var(--emerald)" }} />
                          ) : (
                            <span className="h-3 w-3 rounded-full hairline shrink-0" />
                          )}
                          <span className={`truncate text-[12px] ${m.isAccepted ? "text-foreground" : "text-body"}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {milestones.length === 0 && (
                <p className="text-[12px] text-mute italic p-2">No milestones yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 lift rounded-lg p-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-xl text-foreground">Now go do the first step.</p>
          <p className="mt-1 text-[13px] text-mute">The plan is only as good as the signal you collect. 24 hours starts now.</p>
        </div>
        <Button onClick={reset} className="bg-foreground text-background hover:bg-foreground/90">
          Forge another
          <ArrowRight size={14} weight="bold" />
        </Button>
      </div>
    </section>
  );
};
