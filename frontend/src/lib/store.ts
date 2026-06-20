"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Roadmap, Assumption, Milestone, FirstStep } from "./types";

// The 4-stage pipeline stages, in order. The user progresses linearly:
// intake → assumptions → milestones → first-step. `complete` is the terminal
// dashboard state where all stages have produced output.
export type Stage = "intake" | "assumptions" | "milestones" | "first-step" | "complete" | "library";

type IdeaforgeState = {
  // Identity
  userId: string | null;
  setUserId: (id: string) => void;

  // Active roadmap + its derived artifacts
  roadmap: Roadmap | null;
  setRoadmap: (roadmap: Roadmap | null) => void;

  assumptions: Assumption[];
  setAssumptions: (a: Assumption[]) => void;

  milestones: Milestone[];
  setMilestones: (m: Milestone[]) => void;

  firstStep: FirstStep | null;
  setFirstStep: (fs: FirstStep | null) => void;

  // The stage the user is currently viewing/working on
  stage: Stage;
  setStage: (s: Stage) => void;

  // Reset everything to start a new idea
  reset: () => void;
};

export const useIdeaforge = create<IdeaforgeState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (id) => set({ userId: id }),

      roadmap: null,
      setRoadmap: (roadmap) => set({ roadmap }),

      assumptions: [],
      setAssumptions: (assumptions) => set({ assumptions }),

      milestones: [],
      setMilestones: (milestones) => set({ milestones }),

      firstStep: null,
      setFirstStep: (firstStep) => set({ firstStep }),

      stage: "intake",
      setStage: (stage) => set({ stage }),

      reset: () =>
        set({
          roadmap: null,
          assumptions: [],
          milestones: [],
          firstStep: null,
          stage: "intake",
        }),
    }),
    {
      name: "ideaforge-store",
      partialize: (state) => ({
        userId: state.userId,
        roadmap: state.roadmap,
        stage: state.stage,
      }),
    },
  ),
);
