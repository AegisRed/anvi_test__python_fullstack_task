import { describe, expect, it } from 'vitest';
import { analyzeReflection } from './vibeAnalyzer.js';

describe('analyzeReflection', () => {
  it('counts words and classifies productive reflections by keywords', () => {
    const result = analyzeReflection('Focused deep work today. Shipped the billing fix and completed the rollout.');

    expect(result.wordCount).toBe(12);
    expect(result.category).toBe('Productive');
    expect(result.matchedKeywords).toEqual(expect.arrayContaining(['focused', 'shipped', 'completed']));
    expect(result.keywords.map((keyword) => keyword.word)).toContain('billing');
  });

  it('returns Balanced when no category keywords are present', () => {
    const result = analyzeReflection('Quiet morning with normal meetings and a clear inbox.');

    expect(result.category).toBe('Balanced');
    expect(result.score).toBe(0);
  });
});
