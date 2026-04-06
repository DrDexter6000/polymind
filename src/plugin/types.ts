export type Scene = 'coding' | 'reasoning' | 'writing' | 'fast';

export type Complexity = 'high' | 'medium' | 'low';

export interface ModelHint {
  scenes: Scene[];
  tier: 1 | 2 | 3;
}

export interface RouteConfig {
  primary: string;
  fallbacks: string[];
}

export type SceneRouteConfig =
  | RouteConfig
  | Partial<Record<Complexity, RouteConfig>>;

export interface PolyMindConfig {
  enabled: boolean;
  modelHints?: Record<string, ModelHint>;
  routes: Partial<Record<Scene, SceneRouteConfig>>;
}

export interface RouteResult {
  modelOverride: string;
  providerOverride?: string;
}
