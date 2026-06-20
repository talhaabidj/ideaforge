"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ============================================================
   Motion primitives — commercial-grade scroll animations.
   Purposeful, restrained: elements arrive with a soft rise,
   stagger naturally, and never flash or bounce.
   ============================================================ */

// Reveal — fade + rise on scroll into view. The workhorse.
export const Reveal = ({
  children,
  delay = 0,
  y = 14,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Stagger container + item — for lists where children cascade in.
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const StaggerGroup = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={staggerContainer}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: "-50px" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Eyebrow label — Inter weight 500, refined spacing.
export const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <span className={`eyebrow ${className}`}>{children}</span>
);
