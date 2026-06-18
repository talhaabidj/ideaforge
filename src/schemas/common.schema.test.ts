import { describe, it, expect } from 'vitest';
import { roadmapIdParamSchema, milestoneIdParamSchema } from './common.schema.js';

describe('roadmapIdParamSchema', () => {
  it('accepts a valid UUID', () => {
    const result = roadmapIdParamSchema.safeParse({
      roadmapId: '11111111-1111-1111-1111-111111111111',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    const result = roadmapIdParamSchema.safeParse({ roadmapId: '12345' });

    expect(result.success).toBe(false);
  });

  it('rejects a missing roadmapId', () => {
    const result = roadmapIdParamSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe('milestoneIdParamSchema', () => {
  it('accepts a valid UUID', () => {
    const result = milestoneIdParamSchema.safeParse({
      milestoneId: '22222222-2222-2222-2222-222222222222',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty string', () => {
    const result = milestoneIdParamSchema.safeParse({ milestoneId: '' });

    expect(result.success).toBe(false);
  });
});