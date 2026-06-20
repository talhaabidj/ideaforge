"use client";

/* ============================================================
   Responsible AI Section — IdeaForge Landing Page

   CRITICAL: This section addresses 10% of the hackathon judging
   criteria. It communicates our Responsible AI practices clearly
   and visually.

   Four pillars:
   1. Content Moderation — regex deny-list blocks harmful input
   2. Human-in-the-Loop — milestones require explicit acceptance
   3. Transparent Reasoning — AI shows its work at every stage
   4. Privacy by Design — local SQLite, no PII, session-based

   Design:
   - Emerald accent with subtle shield/lock iconography
   - Framer Motion scroll-triggered reveal animations
   - Staggered card entrance for premium feel
   - Accessible: proper headings, ARIA labels, semantic HTML
   ============================================================ */

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ShieldCheck,
  UserCheck,
  Eye,
  LockKey,
} from "@phosphor-icons/react/dist/ssr";

/* ── Responsible AI pillar data ──────────────────────────── */
const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Content Moderation",
    description:
      "A regex-based deny-list screens every user input before it reaches the LLM. Harmful, offensive, or adversarial prompts are blocked at the edge — the AI never sees them.",
    detail: "Deny-list · edge filtering · pre-LLM guard",
    badge: "GUARDED",
  },
  {
    icon: UserCheck,
    title: "Human-in-the-Loop",
    description:
      "Every milestone in the 30/60/90 roadmap starts as a draft. Nothing is finalized until the user explicitly accepts it. The AI proposes — you decide.",
    detail: "Draft → Accept flow · explicit user consent",
    badge: "HITL",
  },
  {
    icon: Eye,
    title: "Transparent Reasoning",
    description:
      "At every pipeline stage, the AI shows its work. Inferred fields are labeled as inferred. Risk levels are explained. The reasoning is never a black box.",
    detail: "Labeled inferences · visible risk scores",
    badge: "VISIBLE",
  },
  {
    icon: LockKey,
    title: "Privacy by Design",
    description:
      "All data lives in a local SQLite database. No PII is collected, stored, or transmitted. Sessions are ephemeral and user-controlled. Your ideas stay yours.",
    detail: "Local SQLite · zero PII · session-scoped",
    badge: "PRIVATE",
  },
];

/* ── Stagger animation variants ──────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ── ResponsibleAI Component ─────────────────────────────── */
export const ResponsibleAI = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      id="responsible-ai"
      ref={sectionRef}
      className="scroll-mt-20 hairline-t"
      aria-labelledby="rai-heading"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-24 sm:px-8 lg:py-32">
        {/* ── Section header ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-2xl"
        >
          {/* Eyebrow with shield icon */}
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck
              size={16}
              weight="fill"
              style={{ color: "var(--emerald)" }}
              aria-hidden
            />
            <span className="eyebrow">Responsible AI</span>
          </div>

          <h2
            id="rai-heading"
            className="font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.05] text-foreground"
          >
            Built responsibly.{" "}
            <span className="text-gradient-emerald">By design.</span>
          </h2>

          <p className="mt-5 text-[16px] leading-relaxed text-body">
            IdeaForge embeds responsible AI practices into every layer of
            the pipeline — from input filtering to data storage. The AI
            assists; you remain in control.
          </p>
        </motion.div>

        {/* ── Pillar cards — 2×2 grid ────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-5 sm:grid-cols-2"
        >
          {PILLARS.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={cardVariants}
              className="group relative lift rounded-xl p-6 transition-smooth hover:shadow-stack"
            >
              {/* Subtle emerald accent line — top edge */}
              <div
                className="absolute inset-x-0 top-0 h-px rounded-t-xl"
                style={{
                  background:
                    "linear-gradient(to right, transparent, var(--emerald), transparent)",
                  opacity: 0.3,
                }}
                aria-hidden
              />

              {/* Icon + badge row */}
              <div className="flex items-center justify-between mb-4">
                {/* Icon container */}
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-smooth group-hover:shadow-sm"
                  style={{
                    background: "rgba(31, 111, 74, 0.08)",
                    border: "1px solid rgba(31, 111, 74, 0.12)",
                  }}
                >
                  <pillar.icon
                    size={20}
                    weight="regular"
                    style={{ color: "var(--emerald)" }}
                    aria-hidden
                  />
                </div>

                {/* Badge */}
                <span
                  className="ui-mono text-[10px] font-medium rounded-full px-2 py-0.5"
                  style={{
                    background: "rgba(31, 111, 74, 0.06)",
                    color: "var(--emerald)",
                    border: "1px solid rgba(31, 111, 74, 0.12)",
                  }}
                >
                  {pillar.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-semibold text-foreground">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="mt-2.5 text-[14px] leading-relaxed text-body">
                {pillar.description}
              </p>

              {/* Technical detail — monospace annotation */}
              <div
                className="mt-4 flex items-center gap-2 rounded-md px-2.5 py-1.5"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--hairline)",
                }}
              >
                <span
                  className="h-1 w-1 rounded-full"
                  style={{ background: "var(--emerald)" }}
                  aria-hidden
                />
                <span className="ui-mono text-mute">{pillar.detail}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Bottom trust statement ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <span
            className="h-px w-12"
            style={{ background: "var(--hairline)" }}
            aria-hidden
          />
          <p className="text-[13px] text-mute text-center max-w-md">
            Aligned with USAII Responsible AI guidelines.
            The AI proposes — market testing remains a human responsibility.
          </p>
          <span
            className="h-px w-12"
            style={{ background: "var(--hairline)" }}
            aria-hidden
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ResponsibleAI;
