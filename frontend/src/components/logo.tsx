import type { SVGProps } from "react";

/* ============================================================
   IdeaForge Logo — custom SVG mark + wordmark.

   Concept: A raw idea (spark) forged into structure (diamond).
   The mark is a faceted diamond (representing the structured,
   refined output) with a spark flame rising from its center
   (representing the raw idea being transformed). The facets
   suggest the 4-stage pipeline. Works at any size, in
   monochrome, and with the emerald accent.

   The wordmark uses the display font with tight tracking.
   ============================================================ */

type LogoProps = SVGProps<SVGSVGElement> & {
  /** Show the wordmark next to the mark */
  withWordmark?: boolean;
  /** Size of the mark in px (wordmark scales proportionally) */
  size?: number;
};

// The standalone mark — a faceted diamond with an inner spark.
export const LogoMark = ({ size = 32, ...props }: { size?: number } & SVGProps<SVGSVGElement>) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Outer diamond — the forge (structure, refinement) */}
    <path
      d="M20 3 L37 20 L20 37 L3 20 Z"
      fill="currentColor"
      opacity="0.12"
    />
    <path
      d="M20 3 L37 20 L20 37 L3 20 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Facet lines — suggest the 4-stage pipeline cutting through the raw material */}
    <path
      d="M20 3 L20 37 M3 20 L37 20"
      stroke="currentColor"
      strokeWidth="0.75"
      opacity="0.3"
    />
    {/* Inner spark — the idea (raw inspiration being forged) */}
    <path
      d="M20 13 C20 13 22 17 22 20 C22 22.2 21.1 24 20 24 C18.9 24 18 22.2 18 20 C18 17 20 13 20 13 Z"
      fill="currentColor"
    />
    {/* Spark glow tip */}
    <circle cx="20" cy="11" r="1.2" fill="currentColor" opacity="0.6" />
  </svg>
);

// The full lockup — mark + wordmark. Used in the header and footer.
export const Logo = ({ withWordmark = true, size = 28, ...props }: LogoProps) => (
  <span className="inline-flex items-center gap-2" {...(props as any)}>
    <LogoMark size={size} />
    {withWordmark && (
      <span
        className="font-display font-semibold tracking-tight text-foreground"
        style={{ fontSize: size * 0.62, lineHeight: 1 }}
      >
        Idea<span style={{ color: "var(--emerald)" }}>Forge</span>
      </span>
    )}
  </span>
);

// A compact favicon-style mark (just the spark + diamond, optimized for 16px).
export const LogoFavicon = (props: SVGProps<SVGSVGElement>) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="32" height="32" rx="7" fill="#1f6f4a" />
    <path d="M16 7 L25 16 L16 25 L7 16 Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
    <path
      d="M16 11 C16 11 17.5 14 17.5 16 C17.5 17.4 16.8 18.5 16 18.5 C15.2 18.5 14.5 17.4 14.5 16 C14.5 14 16 11 16 11 Z"
      fill="white"
    />
  </svg>
);
