import { describe, it, expect } from 'vitest';
import { milestoneGenerateBodySchema } from './milestone.schema.js';

describe('milestoneGenerateBodySchema', () => {
  it('accepts an empty body since constraints is optional', () => {
    const result = milestoneGenerateBodySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('accepts valid constraints text', () => {
    const result = milestoneGenerateBodySchema.safeParse({
      constraints: 'Solo founder, $200 budget, 10 hours per week',
    });

    expect(result.success).toBe(true);
  });

  it('rejects constraints longer than 500 characters', () => {
    const result = milestoneGenerateBodySchema.safeParse({ constraints: 'a'.repeat(501) });

    expect(result.success).toBe(false);
  });
});