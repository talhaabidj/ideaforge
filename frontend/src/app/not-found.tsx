/**
 * @file not-found.tsx
 * @description Custom 404 page for IdeaForge.
 * Matches the emerald design system with a forge-themed message
 * encouraging users to return to the main page.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#fcfcfd" }}
    >
      {/* ---------- 404 Large Display ---------- */}
      <h1
        className="text-[8rem] font-bold leading-none tracking-tighter"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#1f6f4a",
          opacity: 0.15,
        }}
      >
        404
      </h1>

      {/* ---------- Message ---------- */}
      <h2
        className="mt-2 text-2xl font-semibold"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#18181b",
        }}
      >
        Page not found
      </h2>

      <p className="mt-3 max-w-md text-base" style={{ color: "#71717a" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back to forging ideas.
      </p>

      {/* ---------- CTA ---------- */}
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
        style={{ backgroundColor: "#1f6f4a" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
        </svg>
        Back to IdeaForge
      </Link>
    </div>
  );
}
