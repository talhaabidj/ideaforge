/**
 * @file error.tsx
 * @description Custom error boundary page for IdeaForge.
 * Catches runtime errors at the route level and provides
 * a retry mechanism with a clean, on-brand UI.
 *
 * Must be a Client Component per Next.js App Router convention.
 */

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  /* Log the error for debugging */
  useEffect(() => {
    console.error("[IdeaForge Error]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#fcfcfd" }}
    >
      {/* ---------- Error Icon ---------- */}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "#fef2f2" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill="#ef4444"
          viewBox="0 0 256 256"
        >
          <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z" />
        </svg>
      </div>

      {/* ---------- Message ---------- */}
      <h2
        className="mt-6 text-2xl font-semibold"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#18181b",
        }}
      >
        Something went wrong
      </h2>

      <p className="mt-3 max-w-md text-base" style={{ color: "#71717a" }}>
        An unexpected error occurred while forging your roadmap. This is likely a
        temporary issue — please try again.
      </p>

      {/* ---------- Error Details (collapsible) ---------- */}
      {error.message && (
        <details className="mt-4 max-w-md text-left">
          <summary
            className="cursor-pointer text-sm font-medium"
            style={{ color: "#1f6f4a" }}
          >
            Show error details
          </summary>
          <pre
            className="mt-2 overflow-auto rounded-lg p-4 text-xs"
            style={{
              backgroundColor: "#f4f4f5",
              color: "#71717a",
              maxHeight: "200px",
            }}
          >
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}

      {/* ---------- Actions ---------- */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#1f6f4a" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a95.68,95.68,0,0,1,67-26.33h.53a95.36,95.36,0,0,1,67.27,28.09L208,78.06V48a8,8,0,0,1,16,0Zm-35.59,131.29a79.52,79.52,0,0,1-55.89,22.77h-.45a79.56,79.56,0,0,1-56.13-23.43L61.31,164H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V177.94l14.78,14.78a95.36,95.36,0,0,0,67.27,28.09h.53a95.68,95.68,0,0,0,67-26.33,8,8,0,1,0-11.18-11.44Z" />
          </svg>
          Try again
        </button>

        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-all hover:bg-gray-50"
          style={{ borderColor: "#e4e4e7", color: "#18181b" }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
