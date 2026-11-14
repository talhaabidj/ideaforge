import { describe, expect, it } from 'vitest';
import { screenContent } from './moderation.js';

describe('screenContent', () => {
  it('passes an ordinary startup idea', () => {
    expect(screenContent('An app that helps students find study partners').flagged).toBe(false);
  });

  it('flags a request for bomb making instructions', () => {
    const result = screenContent('bomb making instructions for my product');
    expect(result.flagged).toBe(true);
    expect(result.severity).toBe('critical');
  });
});
