"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ProductMock } from "./product-mock";

export const Hero = () => {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 pt-20 pb-24 sm:px-8 lg:pt-28">
      {/* 7/5 asymmetric grid */}
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left: content (7 cols) */}
        <div className="lg:col-span-7">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full hairline surface-1 px-3 py-1 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-spark" style={{ background: "var(--emerald)" }} />
              <span className="eyebrow">v1.0 · agentic pipeline</span>
            </span>
          </motion.div>

          {/* Headline — Space Grotesk display, gradient emerald accent */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.5rem,6.5vw,4.5rem)] leading-[1.0] text-foreground"
          >
            From idea to{" "}
            <span className="text-gradient-emerald">first step</span>{" "}
            in four moves.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 max-w-md text-[17px] leading-relaxed text-body"
          >
            IdeaForge is an agentic pipeline that structures your raw idea,
            surfaces its riskiest assumptions, forges a 30/60/90 roadmap, and
            hands you the single smallest action you can test before tomorrow.
          </motion.p>

          {/* CTAs — solid foreground primary, ghost secondary */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-9 flex items-center gap-3"
          >
            <button
              onClick={() => document.getElementById("intake")?.scrollIntoView({ behavior: "smooth" })}
              className="group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium shadow-md transition-smooth active:scale-[0.98]"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              Start the pipeline
              <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-lg hairline surface-1 px-6 py-3 text-sm font-medium text-foreground transition-smooth hover:surface-2 hover:shadow-sm"
            >
              See how it works
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.44 }}
            className="mt-12 text-[13px] text-mute"
          >
            Built for the USAII Global AI Hackathon 2026 — Undergraduate track, Challenge Brief 3.
          </motion.div>
        </div>

        {/* Right: real product UI mock (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5"
        >
          <div className="transition-smooth hover:shadow-lg" style={{ borderRadius: 12 }}>
            <ProductMock />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
