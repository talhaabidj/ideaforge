"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/* ============================================================
   ForgeBackground — layered artwork for the IdeaForge canvas.

   Four layers, all decorative (pointer-events: none, fixed, -z-10):
   1. Base canvas color (solid, the foundation)
   2. Blueprint grid — a subtle dot-grid that evokes the architect's
      drafting paper. Low opacity, "felt before seen."
   3. Radial emerald glows — two soft, slow-drifting radial gradients
      (top-left and bottom-right) that give the page atmospheric depth
      without any heavy color blocks.
   4. Floating sparks — tiny emerald dots that rise slowly upward,
      representing ideas forming in the forge. Sparse, slow, never
      distracting. Respects reduced-motion.

   The whole composition is light-mode-first (works on the off-white
   #fcfcfd canvas) but has a dark-mode variant built into the CSS vars.
   ============================================================ */

// Precompute spark positions once — stable across re-renders.
const useSparks = () =>
  useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${8 + i * 12 + (i % 3) * 5}%`,
        delay: `${i * 2.1}s`,
        duration: `${14 + (i % 4) * 4}s`,
        size: 2 + (i % 3),
        drift: `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 3) * 5)}px`,
        opacity: 0.15 + (i % 3) * 0.08,
      })),
    [],
  );

export const ForgeBackground = () => {
  const sparks = useSparks();
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const travel = vh ? vh * 0.5 : 360;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1: Base canvas */}
      <div className="absolute inset-0" style={{ background: "var(--canvas)" }} />

      {/* Layer 2: Blueprint dot-grid — very subtle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }}
      />

      {/* Layer 3: Radial emerald glows — slow drift for atmosphere */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(31,111,74,0.10) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[65vh] w-[65vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(62,207,142,0.08) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 4: Floating sparks — ideas rising in the forge */}
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: s.left,
            bottom: "-10px",
            width: s.size,
            height: s.size,
            background: "var(--emerald)",
            boxShadow: `0 0 ${s.size * 3}px var(--emerald)`,
            opacity: s.opacity,
          }}
          animate={{
            y: [0, -travel],
            x: [0, parseFloat(s.drift)],
            opacity: [0, s.opacity, s.opacity, 0],
          }}
          transition={{
            duration: parseFloat(s.duration),
            delay: parseFloat(s.delay),
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Layer 5: Top fade — keeps the header area clean */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: "linear-gradient(to bottom, var(--canvas) 0%, transparent 100%)",
          opacity: 0.8,
        }}
      />
    </div>
  );
};
