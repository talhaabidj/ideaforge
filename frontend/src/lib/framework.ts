// The 6W3H framework config — drives the intake chatbot's conversational
// flow. Each field has a question the agent asks, a hint, and an icon name
// (mapped to lucide icons in the UI). Mirrors the teammate's SIX_W_3H_FIELDS.

import type { SixWThreeH } from "./types";

export type SixWThreeHField = {
  key: keyof SixWThreeH;
  label: string;
  question: string;
  hint: string;
  placeholder: string;
};

export const SIX_W_THREE_H_FIELDS: SixWThreeHField[] = [
  {
    key: "what",
    label: "What",
    question: "What exactly are you building? Describe the product or service in one sentence.",
    hint: "The core offering — the thing itself.",
    placeholder: "e.g. A peer-to-peer skill-swapping app for university students",
  },
  {
    key: "who",
    label: "Who",
    question: "Who is this for? Name the specific person whose problem you're solving.",
    hint: "Not 'everyone' — a real, reachable someone.",
    placeholder: "e.g. Second-year CS students who want to learn design",
  },
  {
    key: "why",
    label: "Why",
    question: "Why does this matter to them? What breaks or hurts without it?",
    hint: "The pain that makes them care.",
    placeholder: "e.g. They can't find design mentorship without paying for courses",
  },
  {
    key: "where",
    label: "Where",
    question: "Where will this live or happen? The channel, place, or context.",
    hint: "Mobile? Campus? A specific city? A Discord server?",
    placeholder: "e.g. A mobile app, launched on three university campuses",
  },
  {
    key: "when",
    label: "When",
    question: "When does this need to exist? Is there a timing pressure or window?",
    hint: "Deadlines, seasons, events, 'now vs later'.",
    placeholder: "e.g. Ready for the start of the fall semester",
  },
  {
    key: "which",
    label: "Which",
    question: "Which alternatives already exist, and why aren't they enough?",
    hint: "The competition — and the gap you see.",
    placeholder: "e.g. Skillshare exists but is paid and not campus-specific",
  },
  {
    key: "how",
    label: "How",
    question: "How will it actually work — the mechanism, the loop?",
    hint: "The engine that makes it go.",
    placeholder: "e.g. Match by skill graph, swap credits instead of money",
  },
  {
    key: "howMuch",
    label: "How much",
    question: "How much will it cost to build or run? Rough order of magnitude.",
    hint: "Money in. Be honest, even if it's 'sweat equity only'.",
    placeholder: "e.g. ~$200/mo for infra, ~$0 build cost (solo)",
  },
  {
    key: "howMany",
    label: "How many",
    question: "How many people do you need to reach for this to work?",
    hint: "The smallest viable audience.",
    placeholder: "e.g. 200 active swappers across 3 campuses",
  },
];
