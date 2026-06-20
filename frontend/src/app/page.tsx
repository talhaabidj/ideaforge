"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ForgeBackground } from "@/components/forge-background";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { IntakeChatbot } from "@/components/intake-chatbot";
import { AssumptionsView } from "@/components/assumptions-view";
import { MilestonesView } from "@/components/milestones-view";
import { FirstStepView } from "@/components/first-step-view";
import { Dashboard } from "@/components/dashboard";
import { RoadmapsList } from "@/components/roadmaps-list";
import { Button } from "@/components/ui/button";
import { useIdeaforge } from "@/lib/store";
import { fetchSession } from "@/lib/api";
import { cleanSixWThreeH } from "@/lib/six-w-three-h";

const IntakeReview = () => {
  const roadmap = useIdeaforge((s) => s.roadmap);
  const setStage = useIdeaforge((s) => s.setStage);
  const sixW3H = cleanSixWThreeH(roadmap?.sixW3hSummary ?? null);
  return (
    <section className="mx-auto max-w-[800px] px-5 py-16 sm:px-8">
      <span className="eyebrow">01 · intake · review</span>
      <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-tight text-foreground">
        Your structured idea
      </h2>
      <div className="mt-8 lift rounded-lg p-6">
        <span className="eyebrow">raw idea</span>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground">{roadmap?.rawIdea}</p>
        {sixW3H.fields.length > 0 && (
          <>
            <span className="eyebrow mt-6 block">6W3H structure</span>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {sixW3H.fields.map((f) => (
                <div key={f.key} className="flex gap-3 lift-2 rounded-md p-3">
                  <dt className="w-16 shrink-0 ui-mono text-emerald">{f.key}</dt>
                  <dd className={`text-[13px] ${f.value ? "text-foreground" : "text-mute italic"}`}>
                    {f.value || "needs founder input"}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={() => setStage("assumptions")} className="bg-foreground text-background hover:bg-foreground/90">
          Continue to assumptions
          <ArrowRight size={15} weight="bold" />
        </Button>
      </div>
    </section>
  );
};

export default function Home() {
  const stage = useIdeaforge((s) => s.stage);
  const roadmap = useIdeaforge((s) => s.roadmap);
  const setUserId = useIdeaforge((s) => s.setUserId);
  useEffect(() => {
    fetchSession().then((s) => setUserId(s.userId)).catch(() => {});
  }, [setUserId]);
  const showLanding = !roadmap && stage !== "library";
  return (
    <div className="flex min-h-screen flex-col">
      <ForgeBackground />
      <SiteHeader />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {showLanding ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Hero />
              <HowItWorks />
              <IntakeChatbot />
            </motion.div>
          ) : (
            <motion.div key={stage} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              {stage === "library" && <RoadmapsList />}
              {stage === "intake" && <IntakeReview />}
              {stage === "assumptions" && <AssumptionsView />}
              {stage === "milestones" && <MilestonesView />}
              {stage === "first-step" && <FirstStepView />}
              {stage === "complete" && <Dashboard />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
