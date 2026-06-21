import type {
  Roadmap,
  Assumption,
  Milestone,
  FirstStep,
  SixWThreeH,
  ApiError,
} from "./types";

// Typed client for the IdeaForge API. Every method maps 1:1 to a backend
// route, keeping the frontend fully connected to the (reimplemented) Express
// contract. Errors are normalized into ApiError so the UI can branch cleanly.

const BASE = process.env.NODE_ENV === "production" ? "/_/backend/api" : "http://localhost:3001/api";

const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = data as ApiError;
    const message =
      err?.message ||
      err?.error ||
      (res.status === 429
        ? "Too many requests. Please wait a moment and try again."
        : "Something went wrong. Please try again.");
    const error: ApiError & { status: number } = { ...err, status: res.status, message };
    throw error;
  }

  return data as T;
};

// ---- Session ----
export const fetchSession = () =>
  request<{ userId: string; name: string | null; email: string }>("/session");

// ---- Intake ----
export const createIntake = (input: {
  userId: string;
  rawIdea: string;
  sixWThreeH?: SixWThreeH;
}) =>
  request<{ roadmap: Roadmap }>("/intake", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const fetchIntake = (roadmapId: string) =>
  request<{ roadmap: Roadmap }>(`/intake/${roadmapId}`);

// ---- Roadmaps (dashboard list) ----
export const listRoadmaps = () =>
  request<{ roadmaps: (Roadmap & { _count: { assumptions: number; milestones: number } })[] }>(
    "/roadmaps",
  );

// ---- Assumptions ----
export const generateAssumptions = (roadmapId: string, focusHint?: string) =>
  request<{ roadmapId: string; assumptions: Assumption[] }>(
    `/assumptions/${roadmapId}/generate`,
    { method: "POST", body: JSON.stringify({ focusHint }) },
  );

export const listAssumptions = (roadmapId: string) =>
  request<{ roadmapId: string; assumptions: Assumption[] }>(`/assumptions/${roadmapId}`);

export const validateAssumption = (assumptionId: string, state: "validated" | "invalidated") =>
  request<{ assumption: Assumption }>(`/assumptions/validate/${assumptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  });

// ---- Milestones ----
export const generateMilestones = (roadmapId: string, constraints?: string) =>
  request<{ roadmapId: string; milestones: Milestone[] }>(
    `/milestones/${roadmapId}/generate`,
    { method: "POST", body: JSON.stringify({ constraints }) },
  );

export const listMilestones = (roadmapId: string) =>
  request<{ roadmapId: string; milestones: Milestone[] }>(`/milestones/${roadmapId}`);

export const acceptMilestone = (milestoneId: string) =>
  request<{ milestone: Milestone }>(`/milestones/${milestoneId}/accept`, {
    method: "PATCH",
  });

// ---- Roadmap management ----
export const deleteRoadmap = (roadmapId: string) =>
  request<{ deleted: boolean; id: string }>(`/roadmaps/${roadmapId}`, {
    method: "DELETE",
  });

// ---- First step ----
export const recommendFirstStep = (roadmapId: string, focusMilestoneId?: string) =>
  request<{ roadmapId: string; firstStep: FirstStep }>(
    `/first-step/${roadmapId}/recommend`,
    { method: "POST", body: JSON.stringify({ focusMilestoneId }) },
  );

export const fetchFirstStep = (roadmapId: string) =>
  request<{ roadmapId: string; firstStep: FirstStep }>(`/first-step/${roadmapId}`);

// ---- Health ----
export const fetchHealth = () =>
  request<{ status: string; checks: Record<string, string>; timestamp: string }>("/health");
