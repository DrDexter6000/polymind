import { describe, expect, it } from 'vitest';
import type { ModelHint } from '../plugin/types.js';
import {
  BUILT_IN_MODEL_HINTS,
  findModelHint,
  mergeModelHints
} from './model-hints.js';

describe('model hint registry', () => {
  it('ships a built-in capability seed', () => {
    expect(BUILT_IN_MODEL_HINTS['claude-opus']).toEqual({
      scenes: ['coding', 'reasoning'],
      tier: 1
    });
  });

  it('lets user hints override built-in entries', () => {
    const userHints: Record<string, ModelHint> = {
      'claude-opus': {
        scenes: ['writing'],
        tier: 2
      }
    };

    expect(mergeModelHints(userHints)['claude-opus']).toEqual({
      scenes: ['writing'],
      tier: 2
    });
  });

  it('lets user hints add new model families', () => {
    const userHints: Record<string, ModelHint> = {
      'my-custom-model': {
        scenes: ['writing'],
        tier: 2
      }
    };

    expect(mergeModelHints(userHints)['my-custom-model']).toEqual({
      scenes: ['writing'],
      tier: 2
    });
  });

  it('finds exact user overrides before fuzzy built-ins', () => {
    const hints = mergeModelHints({
      'gpt-5.4-codex': {
        scenes: ['coding'],
        tier: 1
      }
    });

    expect(findModelHint('gpt-5.4-codex', hints)).toEqual({
      scenes: ['coding'],
      tier: 1
    });
  });

  it('finds built-in hints through fuzzy matching', () => {
    expect(findModelHint('claude-opus-4-6', BUILT_IN_MODEL_HINTS)).toEqual({
      scenes: ['coding', 'reasoning'],
      tier: 1
    });
  });

  it('returns undefined when no hint exists', () => {
    expect(findModelHint('totally-unknown-model', BUILT_IN_MODEL_HINTS)).toBeUndefined();
  });
});
