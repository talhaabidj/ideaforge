import { describe, expect, it } from 'vitest';
import type { Request } from 'express';
import { readUserId } from './session.js';

const requestWithHeader = (value?: string) =>
  ({ header: (name: string) => (name === 'x-user-id' ? value : undefined) }) as unknown as Request;

describe('readUserId', () => {
  it('returns a valid UUID from the header', () => {
    const id = '3f2b8c1e-5d4a-4c3b-9a8e-1f2d3c4b5a69';
    expect(readUserId(requestWithHeader(id))).toBe(id);
  });

  it('ignores a missing or malformed header', () => {
    expect(readUserId(requestWithHeader())).toBeNull();
    expect(readUserId(requestWithHeader('not-a-uuid'))).toBeNull();
  });
});
