// Lightweight, deterministic deny-list used to pre-screen user-submitted ideas
// before they reach the AI agents (intake, assumption, milestone, first-step).
// Deliberately regex-based (not an AI call) to keep this layer fast and free,
// per the planning doc's "lightweight functional middleware" requirement.
// Extend this list as new abuse patterns are observed in production.

type ModerationSeverity = 'critical' | 'high';

type ModerationCategory = {
  readonly id: string;
  readonly label: string;
  readonly severity: ModerationSeverity;
  readonly patterns: readonly RegExp[];
};

export const MODERATION_CATEGORIES: readonly ModerationCategory[] = [
  {
    id: 'csae',
    label: 'Child sexual abuse or exploitation',
    severity: 'critical',
    patterns: [/child\s*(porn|sexual|abuse)/i, /\bcsam\b/i, /minor.{0,15}(sexual|explicit|nude)/i],
  },
  {
    id: 'weapons',
    label: 'Weapons, explosives or mass-casualty harm',
    severity: 'critical',
    patterns: [
      /\b(bomb|explosive)\s*(making|build|recipe|instructions)/i,
      /\b(homemade|untraceable|3d\s*print\w*)\s*(gun|firearm|weapon)/i,
      /\bbioweapon\b|\bnerve\s*agent\b|\bchemical\s*weapon\b/i,
    ],
  },
  {
    id: 'terrorism',
    label: 'Terrorism or violent extremism',
    severity: 'critical',
    patterns: [
      /\b(recruit|fund|plan)\w*\s+.{0,20}\b(terror|extremist|jihadist)\b/i,
      /\bmass\s*shoot\w*\s*(plan|plot)\b/i,
    ],
  },
  {
    id: 'humanExploitation',
    label: 'Human trafficking or exploitation',
    severity: 'critical',
    patterns: [/\bhuman\s*traffick/i, /\bforced\s*labor\s*(network|ring|business)\b/i],
  },
  {
    id: 'cyberHarm',
    label: 'Malware, hacking-as-a-service or fraud tooling',
    severity: 'high',
    patterns: [
      /\b(ransomware|keylogger|ddos)\s*(service|builder|kit|tool|business)/i,
      /\bsell\w*\s+.{0,15}\bstolen\s+(credit\s*card|identit)/i,
      /\bphishing\s*(kit|page|service)\b/i,
      /\bbypass\w*\s+.{0,15}\b(2fa|otp|kyc)\b/i,
    ],
  },
  {
    id: 'drugsTrafficking',
    label: 'Illegal drug manufacturing or trafficking',
    severity: 'high',
    patterns: [
      /\b(synthesize|cook|manufactur\w*)\s+.{0,15}\b(meth|fentanyl|heroin)\b/i,
      /\bsell\w*\s+.{0,15}\b(drugs?|narcotics?)\b.{0,15}\bonline\b/i,
    ],
  },
  {
    id: 'fraudScam',
    label: 'Scams, counterfeiting or financial fraud',
    severity: 'high',
    patterns: [
      /\bfake\s*(id|passport|degree|certificate)\s*(generator|service|business)\b/i,
      /\bponzi\s*scheme\b/i,
      /\bmoney\s*launder\w*\s*(service|business|app)\b/i,
    ],
  },
];
