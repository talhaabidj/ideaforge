"use client";

import { motion } from "framer-motion";
import { Sparkle, ArrowUp, Check, Circle } from "@phosphor-icons/react/dist/ssr";

/* ============================================================
   ProductMock — the hero centerpiece. A hyper-realistic static
   capture of the intake chatbot mid-conversation: real message
   bubbles, 6W3H fields populating, agent "Thinking..." state.
   ============================================================ */

const FIELDS = [
  { k: "what", v: "A skill-swapping app for students", done: true },
  { k: "who", v: "2nd-year CS students", done: true },
  { k: "why", v: "Can't afford paid courses", done: true },
  { k: "where", v: "3 university campuses", done: true },
  { k: "when", v: "Ready for fall semester", done: false },
  { k: "how", v: "Inferred from context…", done: false, inferred: true },
];

export const ProductMock = () => (
  <div className="lift rounded-xl overflow-hidden shadow-lg" style={{ borderRadius: 12 }}>
    {/* Window chrome — minimal, hairline only */}
    <div className="hairline-b flex items-center justify-between px-4 py-2.5 surface-1">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--hairline)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--hairline)" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--hairline)" }} />
        </div>
        <span className="eyebrow ml-2">intake · agent-01</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Circle size={12} weight="fill" className="text-emerald" style={{ color: "var(--emerald)" }} />
        <span className="ui-mono text-mute">live</span>
      </div>
    </div>

    {/* Progress — segmented, 4 of 9 */}
    <div className="hairline-b flex gap-1 px-4 py-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-smooth"
          style={{
            background:
              i < 4 ? "var(--emerald)" : i === 4 ? "rgba(31,111,74,0.4)" : "var(--hairline)",
          }}
        />
      ))}
    </div>

    {/* Transcript */}
    <div className="space-y-3 p-4">
      {/* Agent turn */}
      <div className="flex gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md surface-1 hairline">
          <Sparkle size={12} weight="fill" style={{ color: "var(--emerald)" }} />
        </div>
        <div className="lift-2 max-w-[80%] rounded-lg px-3 py-2" style={{ borderRadius: 8 }}>
          <p className="text-[13px] leading-relaxed text-foreground">
            What exactly are you building? One sentence is fine.
          </p>
        </div>
      </div>

      {/* User turn */}
      <div className="flex gap-2.5 flex-row-reverse">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md surface-1 hairline">
          <span className="text-[10px] font-medium text-mute">JD</span>
        </div>
        <div
          className="max-w-[80%] rounded-lg px-3 py-2 shadow-sm"
          style={{ background: "var(--emerald)", color: "#fff", borderRadius: 8 }}
        >
          <p className="text-[13px] leading-relaxed">
            A peer-to-peer skill-swapping app for university students.
          </p>
        </div>
      </div>

      {/* Agent inferring — the "Thinking..." state */}
      <div className="flex gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md surface-1 hairline">
          <Sparkle size={12} weight="fill" style={{ color: "var(--emerald)" }} />
        </div>
        <div className="lift-2 rounded-lg px-3 py-2" style={{ borderRadius: 8 }}>
          <div className="flex items-center gap-2">
            <span className="ui-mono text-mute">inferring gaps…</span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full"
                  style={{ background: "var(--emerald)" }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 6W3H field state — populating */}
    <div className="hairline-t surface-1 p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="eyebrow">6W3H structure</span>
        <span className="ui-mono text-mute">4 / 9</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {FIELDS.map((f) => (
          <div
            key={f.k}
            className="flex items-center gap-2 rounded-md hairline px-2 py-1.5 transition-smooth"
            style={{ background: f.done ? "var(--surface-1)" : "var(--canvas)" }}
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full transition-smooth"
              style={{ background: f.done ? "var(--emerald)" : "var(--hairline)" }}
            >
              {f.done && <Check size={8} weight="bold" className="text-white" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="ui-mono text-mute leading-none">{f.k}</div>
              <div
                className={`truncate text-[11px] leading-tight ${
                  f.inferred ? "text-mute italic" : "text-foreground"
                }`}
              >
                {f.v}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Input bar */}
    <div className="hairline-t flex items-center gap-2 p-3">
      <div className="flex-1 rounded-md hairline surface-1 px-3 py-2">
        <span className="text-[13px] text-mute">When does this need to exist?</span>
      </div>
      <button
        className="flex h-8 w-8 items-center justify-center rounded-md transition-smooth active:scale-95"
        style={{ background: "var(--foreground)", color: "var(--background)" }}
      >
        <ArrowUp size={14} weight="bold" />
      </button>
    </div>
  </div>
);
