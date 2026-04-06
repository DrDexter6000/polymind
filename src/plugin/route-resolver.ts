import type { Complexity, PolyMindConfig, RouteResult, Scene } from './types.js';

function isRouteConfig(value: PolyMindConfig['routes'][Scene]): value is { primary: string; fallbacks: string[] } {
  return Boolean(value) && typeof value === 'object' && 'primary' in value;
}

function toRouteResult(primary: string): RouteResult {
  const parts = primary.split('/');

  if (parts.length === 2) {
    return {
      providerOverride: parts[0],
      modelOverride: parts[1]
    };
  }

  return { modelOverride: primary };
}

export function resolve(
  scene: Scene,
  complexity: Complexity,
  config: PolyMindConfig
): RouteResult | null {
  if (!config.enabled) {
    return null;
  }

  const sceneConfig = config.routes[scene];
  if (!sceneConfig) {
    return null;
  }

  if (isRouteConfig(sceneConfig)) {
    return toRouteResult(sceneConfig.primary);
  }

  const fallbackOrder: Complexity[] =
    complexity === 'low'
      ? ['low', 'medium', 'high']
      : complexity === 'medium'
        ? ['medium', 'high']
        : ['high'];

  for (const tier of fallbackOrder) {
    const route = sceneConfig[tier];
    if (route) {
      return toRouteResult(route.primary);
    }
  }

  return null;
}
