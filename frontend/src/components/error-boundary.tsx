"use client";

/* ============================================================
   Error Boundary — catches runtime errors in the component tree
   and renders a design-system-consistent fallback UI.

   Features:
   - Class component (required by React's error boundary API)
   - Retry button to attempt re-rendering
   - Collapsible error details for debugging
   - Accessible: ARIA roles, keyboard-navigable
   - Matches the IdeaForge emerald design system

   Usage:
     <ErrorBoundary>
       <YourComponent />
     </ErrorBoundary>

     <ErrorBoundary fallback={<CustomFallback />}>
       <YourComponent />
     </ErrorBoundary>
   ============================================================ */

import { Component, type ReactNode } from "react";
import { Warning, ArrowCounterClockwise, CaretDown, CaretUp } from "@phosphor-icons/react/dist/ssr";

/* ── Types ───────────────────────────────────────────────── */
interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Optional custom fallback UI */
  fallback?: ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error object */
  error: Error | null;
  /** Whether the error details panel is expanded */
  showDetails: boolean;
}

/* ── Error Boundary Class Component ──────────────────────── */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false,
    };
  }

  /* React lifecycle: derive error state from caught error */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /* React lifecycle: log error info for debugging */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[IdeaForge ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  /* Reset the error state to re-attempt rendering */
  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  /* Toggle error details visibility */
  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    /* ── No error — render children normally ────────────── */
    if (!this.state.hasError) {
      return this.props.children;
    }

    /* ── Custom fallback provided ────────────────────────── */
    if (this.props.fallback) {
      return this.props.fallback;
    }

    /* ── Default fallback UI — matches IdeaForge design system ── */
    const { error, showDetails } = this.state;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="mx-auto max-w-lg px-5 py-16 sm:px-8"
      >
        <div className="lift rounded-xl p-8 shadow-stack text-center">
          {/* Warning icon — destructive red accent */}
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "rgba(220, 38, 38, 0.08)" }}
          >
            <Warning size={28} weight="fill" style={{ color: "#dc2626" }} />
          </div>

          {/* Heading */}
          <h2 className="font-display text-xl font-semibold text-foreground">
            Something went wrong
          </h2>

          {/* Description */}
          <p className="mt-3 text-[14px] leading-relaxed text-body">
            An unexpected error occurred in the IdeaForge pipeline.
            Your data is safe — try again or refresh the page.
          </p>

          {/* Retry button */}
          <button
            onClick={this.handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium shadow-sm transition-smooth active:scale-[0.98] hover:shadow-md"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
            aria-label="Try again"
          >
            <ArrowCounterClockwise size={15} weight="bold" />
            Try again
          </button>

          {/* Collapsible error details */}
          {error && (
            <div className="mt-6 text-left">
              <button
                onClick={this.toggleDetails}
                className="flex items-center gap-1.5 text-[12px] font-medium text-mute transition-smooth hover:text-foreground"
                aria-expanded={showDetails}
                aria-controls="error-details"
              >
                {showDetails ? (
                  <CaretUp size={12} weight="bold" />
                ) : (
                  <CaretDown size={12} weight="bold" />
                )}
                {showDetails ? "Hide details" : "Show error details"}
              </button>

              {showDetails && (
                <div
                  id="error-details"
                  className="mt-3 rounded-md surface-1 hairline p-3 overflow-auto max-h-48"
                >
                  <p className="ui-mono text-destructive break-all">
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 ui-mono text-mute text-[10px] leading-relaxed whitespace-pre-wrap break-all">
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

/* ── Default export for convenience ──────────────────────── */
export default ErrorBoundary;
