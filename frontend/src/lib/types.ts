// Shared domain types — mirror the teammate's Drizzle schema shapes so the
// frontend is fully typed against the API contract.

export type RoadmapStatus = "draft" | "assumptions" | "milestones" | "complete";

export type Roadmap = {
  id: string;
  userId: string;
  title: string;
  rawIdea: string;
  sixW3hSummary: string | null;
  status: RoadmapStatus;
  createdAt: string;
  updatedAt: string;
};

export type RiskLevel = "low" | "medium" | "high";
export type ValidationState = "pending" | "validated" | "invalidated";

export type Assumption = {
  id: string;
  roadmapId: string;
  statement: string;
  riskLevel: RiskLevel;
  isValidated: ValidationState;
  focusHint: string | null;
  createdAt: string;
};

export type Milestone = {
  id: string;
  roadmapId: string;
  title: string;
  description: string | null;
  dayBucket: 30 | 60 | 90;
  orderIndex: number;
  isAccepted: boolean;
  acceptedAt: string | null;
  createdAt: string;
};

export type FirstStep = {
  id: string;
  roadmapId: string;
  action: string;
  rationale: string;
  estimatedTimeHours: number;
  focusMilestoneId: string | null;
  createdAt: string;
};

export type SixWThreeH = {
  who?: string;
  what?: string;
  where?: string;
  when?: string;
  why?: string;
  which?: string;
  how?: string;
  howMuch?: string;
  howMany?: string;
};

// API error shape — matches the teammate's Express errorHandler.
export type ApiError = {
  error: string;
  message?: string;
  details?: { path: string; message: string }[];
  categories?: string[];
  timestamp?: string;
  retryAfter?: number;
  detail?: string;
};
