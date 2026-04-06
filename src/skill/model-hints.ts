import type { ModelHint } from '../plugin/types.js';

export const BUILT_IN_MODEL_HINTS: Record<string, ModelHint> = {
  'claude-opus': {
    scenes: ['coding', 'reasoning'],
    tier: 1
  },
  'claude-sonnet': {
    scenes: ['coding', 'writing'],
    tier: 2
  },
  kimi: {
    scenes: ['coding'],
    tier: 2
  },
  'glm-5-turbo': {
    scenes: ['writing', 'fast'],
    tier: 3
  },
  minimax: {
    scenes: ['fast'],
    tier: 3
  }
};

export function mergeModelHints(
  userHints: Record<string, ModelHint>
): Record<string, ModelHint> {
  return { ...BUILT_IN_MODEL_HINTS, ...userHints };
}

export function findModelHint(
  modelId: string,
  hints: Record<string, ModelHint>
): ModelHint | undefined {
  if (hints[modelId]) {
    return hints[modelId];
  }

  const lowerModelId = modelId.toLowerCase();

  for (const [pattern, hint] of Object.entries(hints)) {
    if (lowerModelId.includes(pattern.toLowerCase())) {
      return hint;
    }
  }

  return undefined;
}
