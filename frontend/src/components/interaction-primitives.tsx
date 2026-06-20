"use client";

import { motion, useMotionValue, useSpring, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";

/* ============================================================
   Interaction primitives — magnetic buttons, spotlight cards,
   count-up stats. The hand-crafted micro-interactions that
   separate a designed site from a template.
   ============================================================ */

// MagneticButton — the primary CTA springs toward the cursor by
// 6-8px. Uses a spring physics so it eases, not snaps. On press,
// scales to 0.97 (Framer's pressed state) rather than darkening.
export const MagneticButton = ({
  children,
  onClick,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - (rect.left + rect.width / 2);
    const my = e.clientY - (rect.top + rect.height / 2);
    x.set(mx * strength);
    y.set(my * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

// SpotlightCard — a radial mask follows the cursor inside the card,
// lighting up the forge-ember grid beneath. Pointer-events safe.
export const SpotlightCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const [hovered, setHovered] = useState(false);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden ${className}`}
      style={
        {
          "--mx": `${mx.get()}%`,
          "--my": `${my.get()}%`,
        } as React.CSSProperties
      }
    >
      {/* Spotlight overlay — radial gradient at cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(220px circle at ${mx}% ${my}%, rgba(232,133,74,0.12), transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

// Need useMotionTemplate — import lazily to keep the file self-contained
import { useMotionTemplate } from "framer-motion";

// CountUp — animates from 0 to target when scrolled into view.
// Tabular nums keep digits from jittering.
export const CountUp = ({
  to,
  suffix = "",
  duration = 1.4,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(val)}
      {suffix}
    </span>
  );
};

// CharReveal — splits text into characters and staggers their rise.
// For headline emphasis words only (cheap to render).
export const CharReveal = ({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const chars = text.split("");

  return (
    <span ref={ref} className={`inline-block ${className}`} aria-label={text}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0, y: "0.5em" }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.025,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: c === " " ? "pre" : "normal" }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
};
