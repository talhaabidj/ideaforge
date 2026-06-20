"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChatCircleDots, Warning, CalendarDots, Target } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "./motion";

const STAGES = [
  { n: "01", icon: ChatCircleDots, title: "Intake", name: "6W3H chatbot", body: "A guided conversation structures your raw idea across nine fields — Who, What, Where, When, Why, Which, How, How much, How many. Answer what you know; the agent infers the rest, never overwriting what you typed.", accent: "var(--emerald)", mock: "intake" },
  { n: "02", icon: Warning, title: "Assumptions", name: "risk analyst", body: "An analytical agent surfaces the three to five riskiest, unvalidated beliefs hiding in your idea — the ones about demand, willingness to pay, and distribution that, if wrong, would sink it. Each tagged low, medium, or high.", accent: "#dc2626", mock: "assumptions" },
  { n: "03", icon: CalendarDots, title: "Roadmap", name: "execution coach", body: "A chronological 30/60/90-day plan, with concrete milestones a solo founder can actually hit. The AI only proposes — every milestone stays a draft until you accept it. Human-in-the-loop, always.", accent: "var(--emerald)", mock: "milestones" },
  { n: "04", icon: Target, title: "First step", name: "paralysis-breaker", body: "The single smallest testable action you can take in the next 24 to 48 hours — no budget, no team — that produces real signal about your riskiest assumption. Execution paralysis, broken.", accent: "var(--emerald)", mock: "firststep" },
];

const IntakeFragment = () => (
  <div className="lift rounded-lg overflow-hidden shadow-md" style={{ borderRadius: 10 }}>
    <div className="hairline-b surface-1 px-3 py-2 flex items-center gap-2">
      <ChatCircleDots size={13} weight="fill" style={{ color: "var(--emerald)" }} />
      <span className="eyebrow">intake · agent-01</span>
    </div>
    <div className="p-3 space-y-2">
      <div className="lift-2 rounded-md px-2.5 py-1.5" style={{ borderRadius: 6 }}>
        <p className="text-[12px] text-foreground">What exactly are you building?</p>
      </div>
      <div className="flex justify-end">
        <div className="rounded-md px-2.5 py-1.5 max-w-[75%] shadow-sm" style={{ background: "var(--emerald)", color: "#fff", borderRadius: 6 }}>
          <p className="text-[12px]">A skill-swapping app for students.</p>
        </div>
      </div>
      <div className="lift-2 rounded-md px-2.5 py-1.5 inline-flex items-center gap-1.5" style={{ borderRadius: 6 }}>
        <span className="ui-mono text-mute">inferring…</span>
        <span className="h-1 w-1 rounded-full animate-spark" style={{ background: "var(--emerald)" }} />
      </div>
    </div>
  </div>
);

const AssumptionsFragment = () => (
  <div className="lift rounded-lg overflow-hidden p-3 space-y-2 shadow-md" style={{ borderRadius: 10 }}>
    {[
      { t: "Students will swap skills without monetary incentive", r: "high", c: "#dc2626" },
      { t: "3 campuses is enough for a viable network", r: "medium", c: "#f59e0b" },
      { t: "Credit system is intuitive enough", r: "low", c: "var(--emerald)" },
    ].map((a, i) => (
      <div key={i} className="lift-2 rounded-md p-2.5" style={{ borderRadius: 6 }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.c }} />
          <span className="ui-mono text-mute uppercase">{a.r} risk</span>
        </div>
        <p className="text-[12px] text-foreground leading-snug">{a.t}</p>
      </div>
    ))}
  </div>
);

const MilestonesFragment = () => (
  <div className="lift rounded-lg overflow-hidden p-3 space-y-3 shadow-md" style={{ borderRadius: 10 }}>
    {[
      { d: "30", items: ["Validate 3 campuses", "Interview 15 students"] },
      { d: "60", items: ["Ship MVP credit system", "Onboard 50 swappers"] },
      { d: "90", items: ["Reach 200 active users", "Measure retention"] },
    ].map((b) => (
      <div key={b.d}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="ui-mono font-medium" style={{ color: "var(--emerald)" }}>DAY {b.d}</span>
          <span className="h-px flex-1" style={{ background: "var(--hairline)" }} />
        </div>
        {b.items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <span className="h-3 w-3 rounded-full hairline flex items-center justify-center">
              {i === 0 && b.d === "30" && <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--emerald)" }} />}
            </span>
            <span className="text-[12px] text-foreground">{it}</span>
          </div>
        ))}
      </div>
    ))}
  </div>
);

const FirstStepFragment = () => (
  <div className="lift rounded-lg overflow-hidden p-4 shadow-md" style={{ borderRadius: 10 }}>
    <div className="flex items-center justify-between mb-3">
      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ background: "rgba(31,111,74,0.1)" }}>
        <Target size={11} weight="fill" style={{ color: "var(--emerald)" }} />
        <span className="ui-mono" style={{ color: "var(--emerald)" }}>your move</span>
      </span>
      <span className="ui-mono text-mute">~2h</span>
    </div>
    <p className="text-[14px] font-medium leading-snug text-foreground">
      Interview 5 students about skill gaps. No app, no pitch — just listen.
    </p>
    <div className="mt-3 lift-2 rounded-md p-2.5" style={{ borderRadius: 6 }}>
      <span className="ui-mono text-mute">why this</span>
      <p className="text-[11px] text-body mt-1 leading-relaxed">
        Tests the demand assumption before you build anything. Cheapest signal possible.
      </p>
    </div>
  </div>
);

const MOCKS = { intake: IntakeFragment, assumptions: AssumptionsFragment, milestones: MilestonesFragment, firststep: FirstStepFragment };

export const HowItWorks = () => {
  return (
    <section id="how" className="scroll-mt-20 hairline-t">
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 lg:py-32">
        {/* Section intro */}
        <Reveal className="mb-20 max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.05] text-foreground">
            Four agents. One pipeline. <span className="text-gradient-emerald">Zero paralysis.</span>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-body">
            Each stage is a focused agent with one job. The output of each becomes
            the input to the next — the plan compounds instead of drifting.
          </p>
        </Reveal>

        {/* Vertical stack of single-product sections — alternating sides */}
        <div className="space-y-24">
          {STAGES.map((s, i) => {
            const Mock = MOCKS[s.mock as keyof typeof MOCKS];
            const flip = i % 2 === 1;
            return (
              <Reveal key={s.n} delay={0.05}>
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
                  {/* Copy */}
                  <div className={flip ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md hairline surface-1 shadow-sm transition-smooth hover:shadow-md"
                        style={{ borderRadius: 8 }}
                      >
                        <s.icon size={16} weight="regular" style={{ color: s.accent }} />
                      </div>
                      <span className="ui-mono text-mute">{s.n}</span>
                      <span className="h-px w-8" style={{ background: "var(--hairline)" }} />
                      <span className="eyebrow">{s.name}</span>
                    </div>
                    <h3 className="font-display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-5 text-[15px] leading-relaxed text-body max-w-md">
                      {s.body}
                    </p>
                  </div>
                  {/* Product fragment */}
                  <div className={flip ? "lg:order-1" : ""}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Mock />
                    </motion.div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* CTA */}
        <Reveal delay={0.1} className="mt-24 flex justify-center">
          <button
            onClick={() => document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" })}
            className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium shadow-md transition-smooth active:scale-[0.98]"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            Start at stage 01
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};
