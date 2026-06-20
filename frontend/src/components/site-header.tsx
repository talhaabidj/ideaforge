"use client";

import { useIdeaforge, type Stage } from "@/lib/store";
import { Logo } from "./logo";

const STAGES: { id: Stage; label: string; n: string }[] = [
  { id: "intake", label: "Intake", n: "01" },
  { id: "assumptions", label: "Assumptions", n: "02" },
  { id: "milestones", label: "Roadmap", n: "03" },
  { id: "first-step", label: "First Step", n: "04" },
];

export const SiteHeader = () => {
  const stage = useIdeaforge((s) => s.stage);
  const setStage = useIdeaforge((s) => s.setStage);
  const roadmap = useIdeaforge((s) => s.roadmap);
  const activeIndex = STAGES.findIndex((s) => s.id === stage);
  const reachedIndex = activeIndex === -1 ? STAGES.length : activeIndex;
  const showLanding = !roadmap;

  return (
    <header
      className="sticky top-0 z-40 w-full hairline-b"
      style={{ background: "color-mix(in srgb, var(--canvas) 85%, transparent)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-8">
        {/* Logo — custom mark + wordmark */}
        <button
          onClick={() => {
            if (roadmap) {
              setStage("intake");
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          aria-label="IdeaForge home"
          className="transition-smooth hover:opacity-80"
        >
          <Logo size={26} />
        </button>

        {/* Stage progress — surface-lift active state */}
        {roadmap && (
          <nav className="hidden items-center md:flex" aria-label="Pipeline progress">
            {STAGES.map((s, i) => {
              const isActive = s.id === stage;
              const isReached = i <= reachedIndex;
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => isReached && setStage(s.id)}
                    disabled={!isReached}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-smooth ${
                      isActive
                        ? "surface-1 text-foreground shadow-sm"
                        : isReached
                          ? "text-mute hover:text-foreground"
                          : "text-mute/40 cursor-not-allowed"
                    }`}
                  >
                    <span className={`text-[12px] tabular-nums font-medium ${isActive ? "text-emerald" : "text-mute/60"}`}>
                      {s.n}
                    </span>
                    <span className="text-[13px] font-medium">{s.label}</span>
                  </button>
                  {i < STAGES.length - 1 && (
                    <span className="mx-1 h-px w-3" style={{ background: "var(--hairline)" }} aria-hidden />
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* Right — Library + How it works */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStage("library")}
            className={`rounded-md hairline surface-1 px-3.5 py-1.5 text-[13px] font-medium transition-smooth hover:surface-2 hover:shadow-sm ${
              stage === "library" ? "shadow-sm" : ""
            }`}
          >
            Library
          </button>
          {showLanding && (
            <a
              href="#how"
              className="hidden sm:inline-flex rounded-md hairline surface-1 px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-smooth hover:surface-2 hover:shadow-sm"
            >
              How it works
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
