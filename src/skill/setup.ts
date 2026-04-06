import type { ModelHint } from '../plugin/types.js';
import { findModelHint, mergeModelHints } from './model-hints.js';

interface SetupInput {
  installedModels: string[];
  userModelHints?: Record<string, ModelHint>;
}

interface TieredRoutes {
  coding?: { high?: string; medium?: string; low?: string };
  reasoning?: { high?: string; medium?: string; low?: string };
  writing?: { high?: string; medium?: string; low?: string };
  fast?: { primary: string };
}

interface FlatRoutes {
  coding?: { primary: string };
  reasoning?: { primary: string };
  writing?: { primary: string };
  fast?: { primary: string };
}

interface SetupResult {
  mode: 'tiered' | 'flat' | 'manual';
  routes: TieredRoutes | FlatRoutes | Record<string, never>;
}

function compactRecord<T extends object>(value: T): T {
  const entries = Object.entries(value).filter(([, entry]) => entry !== undefined);
  return Object.fromEntries(entries) as T;
}

function primaryRoute(model: { model: string; tier: 1 | 2 | 3 } | undefined):
  | { primary: string }
  | undefined {
  if (!model) {
    return undefined;
  }

  return { primary: model.model };
}

function tieredRoute(models: Array<{ model: string; tier: 1 | 2 | 3 }>):
  | { high?: string; medium?: string; low?: string }
  | undefined {
  if (models.length === 0) {
    return undefined;
  }

  return compactRecord({
    high: models.find((entry) => entry.tier === 1)?.model,
    medium: models.find((entry) => entry.tier === 2)?.model,
    low: models.find((entry) => entry.tier === 3)?.model
  });
}

function groupModelsByScene(
  installedModels: string[],
  userModelHints: Record<string, ModelHint> | undefined
): Map<string, Array<{ model: string; tier: 1 | 2 | 3 }>> {
  const registry = mergeModelHints(userModelHints ?? {});
  const grouped = new Map<string, Array<{ model: string; tier: 1 | 2 | 3 }>>();

  for (const model of installedModels) {
    const hint = findModelHint(model, registry);
    if (!hint) {
      continue;
    }

    for (const scene of hint.scenes) {
      const current = grouped.get(scene) ?? [];
      current.push({ model, tier: hint.tier });
      grouped.set(scene, current);
    }
  }

  for (const entries of grouped.values()) {
    entries.sort((left, right) => left.tier - right.tier);
  }

  return grouped;
}

export function setup(input: SetupInput): SetupResult {
  const grouped = groupModelsByScene(input.installedModels, input.userModelHints);

  if (grouped.size === 0) {
    return {
      mode: 'manual',
      routes: {}
    };
  }

  if (input.installedModels.length < 3) {
    return {
      mode: 'flat',
      routes: compactRecord({
        coding: primaryRoute(grouped.get('coding')?.[0]),
        reasoning: primaryRoute(grouped.get('reasoning')?.[0]),
        writing: primaryRoute(grouped.get('writing')?.[0]),
        fast: primaryRoute(grouped.get('fast')?.[0])
      })
    };
  }

  const coding = grouped.get('coding') ?? [];
  const reasoning = grouped.get('reasoning') ?? [];
  const writing = grouped.get('writing') ?? [];
  const fast = grouped.get('fast') ?? [];

  return {
    mode: 'tiered',
    routes: compactRecord({
      coding: tieredRoute(coding),
      reasoning: tieredRoute(reasoning),
      writing: tieredRoute(writing),
      fast: primaryRoute(fast[0])
    })
  };
}
