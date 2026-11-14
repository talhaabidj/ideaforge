import { describe, expect, it } from 'vitest';
import { assumptionStateBodySchema, idParamSchema, intakeBodySchema } from './index.js';

describe('intakeBodySchema', () => {
  it('accepts an idea with partial 6W3H answers', () => {
    const result = intakeBodySchema.safeParse({ rawIdea: 'A dog walking app for students', sixWThreeH: { who: 'students' } });
    expect(result.success).toBe(true);
  });

  it('rejects an idea shorter than 10 characters', () => {
    expect(intakeBodySchema.safeParse({ rawIdea: 'short' }).success).toBe(false);
  });

  it('drops a userId sent in the body', () => {
    const result = intakeBodySchema.parse({ rawIdea: 'A dog walking app for students', userId: 'x' });
    expect(result).not.toHaveProperty('userId');
  });
});

describe('idParamSchema', () => {
  it('rejects ids that are not UUIDs', () => {
    expect(idParamSchema.safeParse({ id: '1; drop table' }).success).toBe(false);
  });
});

describe('assumptionStateBodySchema', () => {
  it('only accepts validated or invalidated', () => {
    expect(assumptionStateBodySchema.safeParse({ state: 'validated' }).success).toBe(true);
    expect(assumptionStateBodySchema.safeParse({ state: 'pending' }).success).toBe(false);
  });
});
