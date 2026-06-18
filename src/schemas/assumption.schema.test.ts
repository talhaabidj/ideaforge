import { describe, it, expect } from 'vitest';
import { assumptionGenerateBodySchema } from './assumption.schema.js';

describe('assumptionGenerateBodySchema', () => {
  it('accepts an empty body since focusHint is optional', () => {
    const result = assumptionGenerateBodySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('accepts a valid focusHint', () => {
    const result = assumptionGenerateBodySchema.safeParse({ focusHint: 'focus on pricing risk' });

    expect(result.success).toBe(true);
  });

  it('rejects a focusHint longer than 500 characters', () => {
    const result = assumptionGenerateBodySchema.safeParse({ focusHint: 'a'.repeat(501) });

    expect(result.success).toBe(false);
  });
});