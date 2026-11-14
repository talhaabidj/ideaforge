import { describe, expect, it } from 'vitest';
import { createMemoryLimiter } from './rateLimiter.js';

describe('createMemoryLimiter', () => {
  it('allows up to the limit and then blocks', async () => {
    const check = createMemoryLimiter(2, 60_000);
    expect((await check('1.2.3.4')).success).toBe(true);
    expect((await check('1.2.3.4')).success).toBe(true);
    expect((await check('1.2.3.4')).success).toBe(false);
  });

  it('counts each key on its own', async () => {
    const check = createMemoryLimiter(1, 60_000);
    expect((await check('a')).success).toBe(true);
    expect((await check('b')).success).toBe(true);
  });

  it('starts a new window after it expires', async () => {
    const check = createMemoryLimiter(1, 1);
    await check('a');
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect((await check('a')).success).toBe(true);
  });
});
