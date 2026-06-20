"use client";

/* A horizontal ticker of pipeline terms — adds editorial density and
   motion variety. Duplicated content for seamless loop. */
const ITEMS = [
  "6W3H intake",
  "risk-aware assumptions",
  "30 · 60 · 90 roadmap",
  "human-in-the-loop",
  "smallest testable action",
  "responsible-AI guarded",
  "agentic pipeline",
  "execution-paralysis breaker",
];

export const Ticker = () => (
  <div className="relative border-y border-border surface-1 py-3 mask-fade-edges">
    <div className="flex w-max animate-ticker gap-8">
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
          <span className="mono-eyebrow text-muted-foreground/70">{item}</span>
          <span className="text-ember">✦</span>
        </span>
      ))}
    </div>
  </div>
);
