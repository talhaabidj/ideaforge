import { describe, it, expect } from 'vitest';
import { intakeSubmitSchema } from './intake.schema.js';

describe('intakeSubmitSchema', () => {
  it('accepts a minimal valid payload with no sixWThreeH', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: '11111111-1111-1111-1111-111111111111',
      rawIdea: 'A marketplace connecting local farmers with restaurants.',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a partial sixWThreeH object', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: '11111111-1111-1111-1111-111111111111',
      rawIdea: 'A marketplace connecting local farmers with restaurants.',
      sixWThreeH: { who: 'Local farmers and restaurant buyers' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid userId that is not a UUID', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: 'not-a-uuid',
      rawIdea: 'A marketplace connecting local farmers with restaurants.',
    });

    expect(result.success).toBe(false);
  });

  it('rejects rawIdea shorter than 10 characters', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: '11111111-1111-1111-1111-111111111111',
      rawIdea: 'too short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects rawIdea longer than 2000 characters', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: '11111111-1111-1111-1111-111111111111',
      rawIdea: 'a'.repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a sixWThreeH field exceeding 500 characters', () => {
    const result = intakeSubmitSchema.safeParse({
      userId: '11111111-1111-1111-1111-111111111111',
      rawIdea: 'A marketplace connecting local farmers with restaurants.',
      sixWThreeH: { who: 'a'.repeat(501) },
    });

    expect(result.success).toBe(false);
  });
});