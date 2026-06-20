import type { SVGProps } from "react";

/* ============================================================
   Custom forge/blueprint iconography — bespoke line-art glyphs
   replacing lucide-in-rounded-squares. 1.5px stroke, hand-drawn
   feel. Each glyph is a real forge-tool metaphor, not a generic
   outline icon.
   ============================================================ */

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* Anvil — the intake stage. Raw idea hammered into shape. */
export const AnvilGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 8h12l2 2v2a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z" />
    <path d="M9 8V5h6v3" />
    <path d="M10 16v3M14 16v3M8 19h6" />
    <path d="M4 8L2 6M16 8l2-2" />
  </svg>
);

/* Bellows — the assumptions stage. Blowing air to find weak spots. */
export const BellowsGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 9l6 3v0l-6 3z" />
    <path d="M9 9l6-1v8l-6-1" />
    <path d="M15 9h4M15 12h5M15 15h4" />
    <path d="M3 9v6" />
  </svg>
);

/* Quench — the milestone stage. The plan tempered in stages. */
export const QuenchGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3c2 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2-5 4-8z" />
    <path d="M5 18h14M6 21h12" />
    <path d="M9 18l1 3M15 18l-1 3" />
  </svg>
);

/* Caliper — the first-step stage. Measuring the smallest move. */
export const CaliperGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 5v14M4 5h6M4 19h6" />
    <path d="M10 5v14" />
    <path d="M10 9h6M10 15h6M16 9l4 1M16 15l4-1" />
    <path d="M6 7v0M6 17v0" />
  </svg>
);

/* Spike-mark — the IdeaForge wordmark prefix (4-spoke radial) */
export const SpikeMark = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2L13 11L22 12L13 13L12 22L11 13L2 12L11 11Z" />
  </svg>
);

/* Forge hammer — used in micro-interaction contexts */
export const HammerGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M14 3l7 7-3 3-7-7z" />
    <path d="M11 6L4 13l3 3 7-7" />
    <path d="M4 13l-2 5 5-2" />
  </svg>
);

/* Ember spark — decorative, for animated motes / live indicators */
export const SparkGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2c0 4 2 6 6 6-4 0-6 2-6 6 0-4-2-6-6-6 4 0 6-2 6-6z" opacity="0.9" />
  </svg>
);

/* Ruler tick — annotation / measurement marks */
export const RulerGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 9l6-6 12 12-6 6z" />
    <path d="M7 7l1 1M10 4l2 2M13 7l1 1M16 10l2 2M9 10l1 1M12 13l1 1M15 16l2 2" />
  </svg>
);

/* Compass — direction / navigation */
export const CompassGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9l-2 5-4 1 2-5z" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
  </svg>
);

/* Map pin marker — roadmap */
export const MarkerGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

/* Target — the first-step bullseye */
export const TargetGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

/* Layers — assumptions stacked */
export const LayersGlyph = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 3l9 5-9 5-9-5z" />
    <path d="M3 13l9 5 9-5M3 17l9 5 9-5" opacity="0.6" />
  </svg>
);
