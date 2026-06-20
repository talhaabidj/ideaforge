import { Info } from "@phosphor-icons/react/dist/ssr";

// The HITL disclaimer banner — required by the planning doc Section 7:
// "The UI must display a persistent, non-dismissible banner stating:
// 'The AI proposes a plan but never validates the idea itself; market
// testing remains a human responsibility'"
// Shown on every stage view (intake/assumptions/milestones/first-step/dashboard)
// once a roadmap exists.
export const HitlBanner = () => (
  <div
    className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-[13px]"
    style={{
      background: "rgba(31, 111, 74, 0.06)",
      border: "1px solid rgba(31, 111, 74, 0.15)",
    }}
  >
    <Info size={15} weight="fill" className="shrink-0" style={{ color: "var(--emerald)" }} />
    <span style={{ color: "var(--body)" }}>
      <strong style={{ color: "var(--foreground)" }}>The AI proposes a plan</strong> but never
      validates the idea itself; market testing remains a human responsibility.
    </span>
  </div>
);
