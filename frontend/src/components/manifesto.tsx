"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ============================================================
   Manifesto — an editorial interlude. Oversized serif type with
   anaphora rhythm, pinned with scroll-linked opacity. This is
   the "voice" section that AI templates never have.
   ============================================================ */

export const Manifesto = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Each line fades in/out at a different scroll phase — a reading rhythm
  const o1 = useTransform(scrollYProgress, [0.05, 0.2, 0.4, 0.55], [0.2, 1, 1, 0.3]);
  const o2 = useTransform(scrollYProgress, [0.15, 0.3, 0.5, 0.65], [0.2, 1, 1, 0.3]);
  const o3 = useTransform(scrollYProgress, [0.25, 0.4, 0.6, 0.75], [0.2, 1, 1, 0.3]);
  const o4 = useTransform(scrollYProgress, [0.35, 0.5, 0.7, 0.85], [0.2, 1, 1, 0.3]);

  const lines = [
    { text: "The problem isn't generating ideas.", op: o1, accent: false },
    { text: "It's the silence after.", op: o2, accent: true },
    { text: "The moment between the spark and the first move —", op: o3, accent: false },
    { text: "where most of them quietly die.", op: o4, accent: true },
  ];

  return (
    <section id="manifesto" ref={ref} className="relative mx-auto max-w-5xl scroll-mt-20 px-4 py-32 sm:px-6 lg:px-8">
      {/* Spec-sheet label, top-left */}
      <div className="mb-12 flex items-center gap-3">
        <span className="mono-eyebrow text-ember">02 / manifesto</span>
        <span className="h-px flex-1 bg-border" />
        <span className="mono-eyebrow text-muted-foreground/50">why this exists</span>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {lines.map((l, i) => (
          <motion.p
            key={i}
            style={{ opacity: l.op }}
            className={`font-serif text-[clamp(1.75rem,5vw,4rem)] leading-[1.05] ${
              l.accent ? "text-molten italic" : "text-foreground"
            }`}
          >
            {l.text}
          </motion.p>
        ))}
      </div>

      {/* Signature / colophon */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-16 flex items-center gap-3 text-muted-foreground/60"
      >
        <span className="h-px w-12 bg-ember/40" />
        <span className="mono-eyebrow">forged for the ambitious · est. 2026</span>
      </motion.div>
    </section>
  );
};
