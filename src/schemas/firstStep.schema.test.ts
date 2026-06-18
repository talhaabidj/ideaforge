import { describe, it, expect } from 'vitest';
import { firstStepGenerateBodySchema } from './firstStep.schema.js';

describe('firstStepGenerateBodySchema', () => {
  it('accepts an empty body since focusMilestoneId is optional', () => {
    const result = firstStepGenerateBodySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it('accepts a valid focusMilestoneId UUID', () => {
    const result = firstStepGenerateBodySchema.safeParse({
      focusMilestoneId: '33333333-3333-3333-3333-333333333333',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a focusMilestoneId that is not a valid UUID', () => {
    const result = firstStepGenerateBodySchema.safeParse({ focusMilestoneId: 'not-a-uuid' });

    expect(result.success).toBe(false);
  });
});