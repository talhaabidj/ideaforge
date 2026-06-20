"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/* ============================================================
   ForgeSchematic v2 — a real architect's working drawing.
   Dimension lines with arrowheads, a revision block, grid
   coordinates (A–F / 1–6), tolerance notes, section callouts.
   This reads as a hand-drafted blueprint, not a flowchart.
   ============================================================ */

export const ForgeSchematic = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  // Helper for dimension arrows (both ends) — brighter so they read as real drafting marks
  const dim = (x1: number, y1: number, x2: number, y2: number, key: string) => (
    <g key={key} stroke="rgba(232,133,74,0.55)" strokeWidth="0.7">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {/* arrowheads */}
      {x1 === x2 ? (
        <>
          <path d={`M${x1 - 4} ${y1 + 6} L${x1} ${y1} L${x1 + 4} ${y1 + 6}`} fill="none" />
          <path d={`M${x2 - 4} ${y2 - 6} L${x2} ${y2} L${x2 + 4} ${y2 - 6}`} fill="none" />
        </>
      ) : (
        <>
          <path d={`M${x1 + 6} ${y1 - 4} L${x1} ${y1} L${x1 + 6} ${y1 + 4}`} fill="none" />
          <path d={`M${x2 - 6} ${y2 - 4} L${x2} ${y2} L${x2 - 6} ${y2 + 4}`} fill="none" />
        </>
      )}
    </g>
  );

  return (
    <div ref={ref} className="relative">
      <motion.div style={{ y }} className="relative">
        <svg viewBox="0 0 460 500" className="w-full" role="img" aria-label="Architect's blueprint: raw idea enters the forge anvil, is tempered through three stages, and emerges as a roadmap.">
          <defs>
            <linearGradient id="ember-line2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f4a261" />
              <stop offset="50%" stopColor="#e8854a" />
              <stop offset="100%" stopColor="#e76f51" />
            </linearGradient>
            <radialGradient id="ember-core2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f4a261" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e8854a" stopOpacity="0" />
            </radialGradient>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(232,133,74,0.15)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Drawing border (double-line, drafting standard) */}
          <rect x="12" y="12" width="436" height="476" fill="none" stroke="rgba(232,133,74,0.3)" strokeWidth="1" />
          <rect x="16" y="16" width="428" height="468" fill="none" stroke="rgba(232,133,74,0.15)" strokeWidth="0.5" />

          {/* Grid coordinates — A–F top, 1–6 left */}
          <g fill="rgba(154,143,126,0.5)" fontSize="7" fontFamily="monospace" letterSpacing="0.5">
            {["A", "B", "C", "D", "E", "F"].map((c, i) => (
              <text key={c} x={50 + i * 70} y="10" textAnchor="middle">{c}</text>
            ))}
            {["1", "2", "3", "4", "5", "6"].map((c, i) => (
              <text key={c} x="6" y={60 + i * 75} textAnchor="middle">{c}</text>
            ))}
          </g>

          {/* Title block (bottom-right, drafting standard) */}
          <g>
            <rect x="280" y="430" width="160" height="50" fill="#16140f" stroke="rgba(232,133,74,0.3)" strokeWidth="0.5" />
            <line x1="280" y1="445" x2="440" y2="445" stroke="rgba(232,133,74,0.2)" strokeWidth="0.4" />
            <line x1="280" y1="460" x2="440" y2="460" stroke="rgba(232,133,74,0.2)" strokeWidth="0.4" />
            <line x1="360" y1="430" x2="360" y2="480" stroke="rgba(232,133,74,0.2)" strokeWidth="0.4" />
            <text x="285" y="440" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace">TITLE</text>
            <text x="285" y="455" fill="#e8e0d4" fontSize="8" fontFamily="serif">IdeaForge Pipeline</text>
            <text x="285" y="470" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace">DWG NO</text>
            <text x="365" y="440" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace">SCALE</text>
            <text x="365" y="450" fill="#e8854a" fontSize="7" fontFamily="monospace">1:1</text>
            <text x="365" y="463" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace">REV</text>
            <text x="365" y="473" fill="#e8854a" fontSize="7" fontFamily="monospace">A</text>
            <text x="285" y="477" fill="rgba(154,143,126,0.5)" fontSize="5" fontFamily="monospace">IFG-2026-001</text>
          </g>

          {/* Input container (top-left) — dashed, with hatch fill on corner */}
          <g>
            <rect x="44" y="48" width="150" height="62" fill="none" stroke="rgba(232,224,212,0.35)" strokeWidth="0.8" strokeDasharray="5 3" />
            <rect x="44" y="100" width="150" height="10" fill="url(#hatch)" />
            <text x="52" y="62" fill="rgba(154,143,126,0.9)" fontSize="6.5" fontFamily="monospace" letterSpacing="1">INPUT · RAW IDEA</text>
            <text x="52" y="80" fill="#e8e0d4" fontSize="8.5" fontFamily="monospace">{"// peer-to-peer skill"}</text>
            <text x="52" y="92" fill="#e8e0d4" fontSize="8.5" fontFamily="monospace">{"// swapping app for"}</text>
            <text x="52" y="98" fill="rgba(154,143,126,0.6)" fontSize="8.5" fontFamily="monospace">{"// students..."}</text>
            {/* leader line + callout */}
            <line x1="194" y1="79" x2="220" y2="79" stroke="rgba(232,133,74,0.4)" strokeWidth="0.4" />
            <circle cx="220" cy="79" r="1.5" fill="#e8854a" />
            <text x="225" y="76" fill="rgba(232,133,74,0.8)" fontSize="6" fontFamily="monospace">unstructured</text>
            <text x="225" y="84" fill="rgba(232,133,74,0.8)" fontSize="6" fontFamily="monospace">≤ 2000 chars</text>
          </g>

          {/* Flow: input → anvil, with dimension */}
          <motion.path
            d="M119 110 L119 145 L230 145 L230 175"
            fill="none"
            stroke="url(#ember-line2)"
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <path d="M230 170 L226 164 M230 175 L234 169" fill="none" stroke="#e8854a" strokeWidth="1.4" strokeLinecap="round" />
          {dim(119, 138, 230, 138, "dim1")}
          <text x="170" y="135" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace" textAnchor="middle">111px</text>

          {/* The anvil — the forge core */}
          <g>
            <circle cx="230" cy="225" r="58" fill="url(#ember-core2)" opacity="0.5" />
            {/* Anvil body */}
            <motion.path
              d="M188 205 L272 205 L282 218 L282 234 L270 234 L270 226 L190 226 L190 234 L178 234 L178 218 Z"
              fill="#1f1c16"
              stroke="#e8854a"
              strokeWidth="1.4"
              strokeLinejoin="round"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{ transformOrigin: "230px 220px" }}
            />
            {/* Anvil horn */}
            <path d="M178 218 L166 214 L166 206 L178 206" fill="#1f1c16" stroke="#e8854a" strokeWidth="1.4" strokeLinejoin="round" />
            {/* Hardy hole */}
            <rect x="254" y="210" width="6" height="6" fill="none" stroke="#e8854a" strokeWidth="1" />
            {/* Base */}
            <path d="M213 234 L247 234 L242 250 L218 250 Z" fill="#1f1c16" stroke="#e8854a" strokeWidth="1.4" strokeLinejoin="round" />
            <line x1="213" y1="250" x2="247" y2="250" stroke="#e8854a" strokeWidth="1.4" />
            {/* Hatch under base */}
            <rect x="208" y="250" width="44" height="6" fill="url(#hatch)" />

            {/* Hammer — animated strike */}
            <motion.g
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: [0, 0, 5, 0], rotate: [0, 0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.55, 0.68, 0.82] }}
              style={{ transformOrigin: "230px 175px" }}
            >
              <rect x="220" y="163" width="20" height="12" rx="1" fill="#28241c" stroke="#e8854a" strokeWidth="1.2" />
              <rect x="223" y="165" width="14" height="8" fill="none" stroke="rgba(232,133,74,0.4)" strokeWidth="0.4" />
              <line x1="230" y1="175" x2="230" y2="195" stroke="#e8854a" strokeWidth="1.4" strokeLinecap="round" />
            </motion.g>

            {/* Label + tolerance note */}
            <text x="230" y="270" fill="#e8854a" fontSize="7.5" fontFamily="monospace" letterSpacing="1.5" textAnchor="middle">
              FORGE · INTAKE
            </text>
            <text x="230" y="282" fill="rgba(154,143,126,0.7)" fontSize="6" fontFamily="monospace" textAnchor="middle">
              6W3H structure applied
            </text>
            {/* Tolerance callout */}
            <line x1="288" y1="220" x2="308" y2="220" stroke="rgba(232,133,74,0.5)" strokeWidth="0.6" />
            <circle cx="308" cy="220" r="1.5" fill="#e8854a" />
            <text x="313" y="218" fill="#e8854a" fontSize="6.5" fontFamily="monospace">tol: ±1 field</text>
            <text x="313" y="227" fill="rgba(232,133,74,0.8)" fontSize="6.5" fontFamily="monospace">inferred</text>
          </g>

          {/* Output to temper stages */}
          <motion.path
            d="M230 250 L230 296"
            fill="none"
            stroke="url(#ember-line2)"
            strokeWidth="1.4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.2 }}
          />

          {/* Three temper stages */}
          {[
            { y: 306, label: "01 · ASSUMPTIONS", sub: "riskiest beliefs", chip: "RISK: HIGH", dot: "#e76f51" },
            { y: 344, label: "02 · MILESTONES", sub: "30 · 60 · 90", chip: "DAYS: 90", dot: "#e8854a" },
            { y: 382, label: "03 · FIRST STEP", sub: "smallest action", chip: "~2H", dot: "#7fb069" },
          ].map((s, i) => (
            <motion.g
              key={s.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1.4 + i * 0.18 }}
            >
              <rect x="130" y={s.y} width="200" height="28" rx="3" fill="#16140f" stroke="rgba(232,133,74,0.3)" strokeWidth="0.8" />
              {/* status dot */}
              <circle cx="144" cy={s.y + 14} r="3" fill={s.dot} className="animate-pulse-dot" style={{ animationDelay: `${i * 0.3}s` }} />
              <text x="156" y={s.y + 12} fill="#e8e0d4" fontSize="7.5" fontFamily="monospace" letterSpacing="0.5">{s.label}</text>
              <text x="156" y={s.y + 22} fill="rgba(154,143,126,0.8)" fontSize="6.5" fontFamily="monospace">{s.sub}</text>
              {/* Chip */}
              <rect x="288" y={s.y + 6} width="38" height="14" rx="2" fill="rgba(231,111,81,0.12)" stroke="rgba(231,111,81,0.3)" strokeWidth="0.5" />
              <text x="307" y={s.y + 15} fill="#e76f51" fontSize="6" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">{s.chip}</text>
              <line x1="284" y1={s.y + 13} x2="288" y2={s.y + 13} stroke="rgba(232,133,74,0.3)" strokeWidth="0.4" />
            </motion.g>
          ))}

          {/* Vertical dashed connectors */}
          <line x1="230" y1="334" x2="230" y2="344" stroke="rgba(232,133,74,0.3)" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="230" y1="372" x2="230" y2="382" stroke="rgba(232,133,74,0.3)" strokeWidth="0.6" strokeDasharray="2 2" />

          {/* Output: roadmap */}
          <motion.path d="M230 410 L230 420" fill="none" stroke="url(#ember-line2)" strokeWidth="1.4" strokeLinecap="round"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 2 }} />
          <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.2 }}>
            <rect x="60" y="420" width="200" height="22" rx="3" fill="rgba(232,133,74,0.08)" stroke="#e8854a" strokeWidth="0.8" />
            <text x="160" y="435" fill="#e8854a" fontSize="7" fontFamily="monospace" letterSpacing="1.5" textAnchor="middle">OUTPUT · FORGED ROADMAP</text>
          </motion.g>

          {/* Right-side vertical dimension (full pipeline height) */}
          {dim(380, 48, 380, 410, "dimV")}
          <text x="390" y="230" fill="rgba(154,143,126,0.7)" fontSize="6.5" fontFamily="monospace" transform="rotate(90 390 230)">
            362px · full pipeline
          </text>

          {/* Revision note (top-right) */}
          <g>
            <text x="400" y="30" fill="rgba(154,143,126,0.6)" fontSize="6" fontFamily="monospace" textAnchor="end">REV A · 2026-06-19</text>
            <text x="400" y="38" fill="rgba(154,143,126,0.5)" fontSize="5.5" fontFamily="monospace" textAnchor="end">sheet 1 of 1</text>
          </g>
        </svg>
      </motion.div>

      {/* Live tag */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-border surface-2 px-2.5 py-1 mono-eyebrow text-ember"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse-dot" />
        live agent
      </motion.div>
    </div>
  );
};
