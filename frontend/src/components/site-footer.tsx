import { LogoMark } from "./logo";

export const SiteFooter = () => (
  <footer className="mt-auto" style={{ background: "#101010", color: "#ededed" }}>
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8">
      <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          {/* Logo in footer — white variant */}
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} style={{ color: "#ededed" }} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Idea<span style={{ color: "#3ecf8e" }}>Forge</span>
            </span>
          </div>
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[#8b8b94]">
            An agentic pipeline from raw idea to testable first action. Built for
            the ones who generate ideas but lack the framework to execute them.
          </p>
        </div>
        <div>
          <div className="text-[13px] font-medium text-[#8b8b94]">Pipeline</div>
          <ul className="mt-3 space-y-2 text-[13px] text-[#b4b4bd]">
            <li>01 — Intake (6W3H)</li>
            <li>02 — Assumptions</li>
            <li>03 — Roadmap (30·60·90)</li>
            <li>04 — First step</li>
          </ul>
        </div>
        <div>
          <div className="text-[13px] font-medium text-[#8b8b94]">Colophon</div>
          <ul className="mt-3 space-y-2 text-[13px] text-[#b4b4bd]">
            <li>Next.js 16 · TypeScript</li>
            <li>Space Grotesk · Inter</li>
            <li>Phosphor Icons</li>
            <li>Responsible-AI guarded</li>
          </ul>
        </div>
      </div>
      <div
        className="mt-14 flex flex-col items-start justify-between gap-2 border-t pt-6 sm:flex-row sm:items-center"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <p className="text-[12px] text-[#8b8b94]">
          USAII Global AI Hackathon 2026 · UG track · Brief 03
        </p>
        <p className="text-[12px] text-[#8b8b94]">
          Forged for the ambitious · est. 2026
        </p>
      </div>
    </div>
  </footer>
);
