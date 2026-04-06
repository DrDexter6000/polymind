import type { PolyMindConfig, RouteConfig, SceneRouteConfig } from '../plugin/types.js';

function formatRouteConfig(route: RouteConfig): string {
  const fallback = route.fallbacks.length > 0 ? ` (fallback: ${route.fallbacks.join(', ')})` : '';
  return `${route.primary}${fallback}`;
}

function isFlatRouteConfig(route: SceneRouteConfig): route is RouteConfig {
  return 'primary' in route;
}

export function status(config: PolyMindConfig | undefined): string {
  if (!config) {
    return 'PolyMind 未配置，请运行 /polymind setup';
  }

  const lines: string[] = [
    `PolyMind 状态: ${config.enabled ? '✅ 已启用' : '❌ 已禁用'}`,
    '',
    '路由表:'
  ];

  for (const [scene, route] of Object.entries(config.routes)) {
    if (!route) {
      continue;
    }

    if (isFlatRouteConfig(route)) {
      lines.push(`  ${scene}    → ${formatRouteConfig(route)}`);
      continue;
    }

    lines.push(`  ${scene}`);
    for (const tier of ['high', 'medium', 'low'] as const) {
      const tierRoute = route[tier];
      if (tierRoute) {
        lines.push(`    ${tier}   → ${formatRouteConfig(tierRoute)}`);
      }
    }
  }

  return lines.join('\n');
}
