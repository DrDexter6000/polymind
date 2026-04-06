import type { Complexity, PolyMindConfig, RouteConfig, Scene } from '../plugin/types.js';

type ConfigAction =
  | { type: 'set-primary'; scene: Scene; complexity: Complexity; primary: string }
  | { type: 'add-fallback'; scene: Scene; complexity: Complexity; fallback: string }
  | { type: 'remove-fallback'; scene: Scene; complexity: Complexity; fallback: string }
  | { type: 'set-enabled'; enabled: boolean }
  | { type: 'flatten-scene'; scene: Scene };

function cloneConfig(config: PolyMindConfig): PolyMindConfig {
  return JSON.parse(JSON.stringify(config)) as PolyMindConfig;
}

function ensureTierRoute(config: PolyMindConfig, scene: Scene, complexity: Complexity): RouteConfig {
  const sceneRoute = config.routes[scene];
  if (!sceneRoute || 'primary' in sceneRoute || !sceneRoute[complexity]) {
    const next: RouteConfig = {
      primary: '',
      fallbacks: []
    };

    config.routes[scene] = {
      ...(sceneRoute && !('primary' in sceneRoute) ? sceneRoute : {}),
      [complexity]: next
    };

    return next;
  }

  return sceneRoute[complexity];
}

export function config(current: PolyMindConfig, action: ConfigAction): PolyMindConfig {
  const next = cloneConfig(current);

  if (action.type === 'set-enabled') {
    next.enabled = action.enabled;
    return next;
  }

  if (action.type === 'flatten-scene') {
    const sceneRoute = next.routes[action.scene];
    if (sceneRoute && !('primary' in sceneRoute)) {
      const first = sceneRoute.high ?? sceneRoute.medium ?? sceneRoute.low;
      if (first) {
        next.routes[action.scene] = {
          primary: first.primary,
          fallbacks: [...first.fallbacks]
        };
      }
    }

    return next;
  }

  const route = ensureTierRoute(next, action.scene, action.complexity);

  if (action.type === 'set-primary') {
    route.primary = action.primary;
    return next;
  }

  if (action.type === 'add-fallback') {
    route.fallbacks.push(action.fallback);
    return next;
  }

  route.fallbacks = route.fallbacks.filter((item) => item !== action.fallback);
  return next;
}
