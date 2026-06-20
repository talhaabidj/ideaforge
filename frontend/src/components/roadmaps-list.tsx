"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Trash, Clock, Calendar } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";
import { useIdeaforge } from "@/lib/store";
import { listRoadmaps, deleteRoadmap, fetchIntake } from "@/lib/api";
import type { Roadmap, ApiError } from "@/lib/types";
import { Reveal } from "./motion";
import { Button } from "@/components/ui/button";

type RoadmapWithCount = Roadmap & { _count: { assumptions: number; milestones: number } };

export const RoadmapsList = () => {
  const setRoadmap = useIdeaforge((s) => s.setRoadmap);
  const setStage = useIdeaforge((s) => s.setStage);
  const reset = useIdeaforge((s) => s.reset);

  const [roadmaps, setRoadmaps] = useState<RoadmapWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    listRoadmaps()
      .then(({ roadmaps }) => setRoadmaps(roadmaps))
      .catch(() => toast.error("Couldn't load roadmaps."))
      .finally(() => setLoading(false));
  }, []);

  const loadRoadmap = async (id: string) => {
    try {
      const { roadmap } = await fetchIntake(id);
      reset();
      setRoadmap(roadmap);
      setStage("assumptions");
      toast.success("Roadmap loaded.");
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't load roadmap.");
    }
  };

  const remove = async (id: string) => {
    setDeleting(id);
    try {
      await deleteRoadmap(id);
      setRoadmaps(roadmaps.filter((r) => r.id !== id));
      toast.success("Roadmap deleted.");
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message ?? "Couldn't delete roadmap.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <Reveal>
        <span className="eyebrow">library · past roadmaps</span>
        <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
          Your <span className="text-gradient-emerald">roadmaps</span>
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-body max-w-xl">
          Every idea you've forged is stored here. Load one to continue, or delete it.
        </p>
      </Reveal>

      {loading && (
        <div className="mt-8 space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg surface-1 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && roadmaps.length === 0 && (
        <div className="mt-8 lift rounded-lg p-12 text-center">
          <p className="text-[15px] font-medium text-foreground">No roadmaps yet</p>
          <p className="mt-1 text-[13px] text-mute">Forge your first idea to get started.</p>
          <Button
            onClick={() => { reset(); setStage("intake"); }}
            className="mt-5 bg-foreground text-background hover:bg-foreground/90"
          >
            Start a new idea
            <ArrowRight size={14} weight="bold" />
          </Button>
        </div>
      )}

      {!loading && roadmaps.length > 0 && (
        <div className="mt-8 space-y-2">
          {roadmaps.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="lift rounded-lg p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-medium text-foreground truncate">{r.title}</h3>
                <p className="mt-0.5 text-[12px] text-mute truncate">{r.rawIdea}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-mute">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} weight="regular" />
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} weight="regular" />
                    {r._count.assumptions} assumptions · {r._count.milestones} milestones
                  </span>
                  <span className="ui-mono px-1.5 py-0.5 rounded"
                    style={{ background: r.status === "complete" ? "rgba(31,111,74,0.1)" : "var(--surface-1)", color: r.status === "complete" ? "var(--emerald)" : "var(--mute)" }}>
                    {r.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={() => loadRoadmap(r.id)}
                  className="bg-foreground text-background hover:bg-foreground/90 text-[13px]"
                  size="sm"
                >
                  Load
                  <ArrowRight size={12} weight="bold" />
                </Button>
                <button
                  onClick={() => remove(r.id)}
                  disabled={deleting === r.id}
                  className="flex h-8 w-8 items-center justify-center rounded-md hairline transition-smooth hover:shadow-sm disabled:opacity-40"
                  aria-label="Delete roadmap"
                >
                  {deleting === r.id ? (
                    <Clock size={13} weight="regular" className="animate-spin" />
                  ) : (
                    <Trash size={13} weight="regular" className="text-mute" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
