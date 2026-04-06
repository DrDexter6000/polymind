import { describe, expect, it } from 'vitest';
import type {
  BeforeModelResolveHandler,
  BeforePromptBuildHandler,
  OpenClawPluginContext
} from './contract/openclaw.js';
import { register } from './plugin/index.js';
import type { PolyMindConfig } from './plugin/types.js';
import { setup } from './skill/setup.js';
import { status } from './skill/status.js';

function createIntegrationConfig(): PolyMindConfig {
  return {
    enabled: true,
    routes: {
      coding: {
        high: { primary: 'anthropic/claude-opus-4-6', fallbacks: ['openai/gpt-5.4-codex'] },
        medium: { primary: 'anthropic/claude-sonnet-4-6', fallbacks: ['modelstudio/kimi-k2.5'] },
        low: { primary: 'modelstudio/kimi-k2.5', fallbacks: [] }
      },
      reasoning: {
        high: { primary: 'google/gemini-3.1-pro', fallbacks: ['anthropic/claude-opus-4-6'] }
      },
      fast: {
        primary: 'minimax/MiniMax-M2.7-highspeed',
        fallbacks: ['google/gemini-3.1-flash']
      }
    }
  };
}

function createPluginContext(options?: {
  pluginConfig?: OpenClawPluginContext['pluginConfig'];
  onBeforeModelResolve?: (handler: BeforeModelResolveHandler) => void;
  onBeforePromptBuild?: (handler: BeforePromptBuildHandler) => void;
}): OpenClawPluginContext {
  function on(hookName: 'before_model_resolve', handler: BeforeModelResolveHandler): void;
  function on(hookName: 'before_prompt_build', handler: BeforePromptBuildHandler): void;
  function on(
    hookName: 'before_model_resolve' | 'before_prompt_build',
    handler: BeforeModelResolveHandler | BeforePromptBuildHandler
  ): void {
    if (hookName === 'before_model_resolve') {
      options?.onBeforeModelResolve?.(handler as BeforeModelResolveHandler);
      return;
    }

    options?.onBeforePromptBuild?.(handler as BeforePromptBuildHandler);
  }

  return {
    config: {},
    pluginConfig: options?.pluginConfig,
    on
  };
}

describe('integration', () => {
  it('routes a coding message through the full pipeline', () => {
    let beforeModelResolve: BeforeModelResolveHandler | undefined;

    const context = createPluginContext({
      pluginConfig: createIntegrationConfig() as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      }
    });

    register(context);

    const result = beforeModelResolve?.(
      { prompt: 'debug this function and fix the error in src/plugin/index.ts and also check src/plugin/types.ts for consistency' },
      { sessionKey: 'session-int-1' }
    );

    expect(result).toEqual({
      providerOverride: 'anthropic',
      modelOverride: 'claude-opus-4-6'
    });
  });

  it.skip('falls back when primary is unavailable', () => {
    // Stage 1 does not implement availability checking.
    // This test is reserved for Stage 2 when the platform provides
    // error callbacks for model resolution failures.
  });

  it('returns null when plugin is disabled', () => {
    let beforeModelResolve: BeforeModelResolveHandler | undefined;

    const disabledConfig = createIntegrationConfig();
    disabledConfig.enabled = false;

    const context = createPluginContext({
      pluginConfig: disabledConfig as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      }
    });

    register(context);

    const result = beforeModelResolve?.(
      { prompt: 'debug this function' },
      { sessionKey: 'session-int-2' }
    );

    expect(result).toBeNull();
  });

  it('returns null for an unclassifiable long message', () => {
    let beforeModelResolve: BeforeModelResolveHandler | undefined;

    const context = createPluginContext({
      pluginConfig: createIntegrationConfig() as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      }
    });

    register(context);

    const result = beforeModelResolve?.(
      { prompt: '今天天气真不错，你觉得我应该去哪里玩比较好呢？好久没出去走走了' },
      { sessionKey: 'session-int-3' }
    );

    expect(result).toBeNull();
  });

  it('setup generates config that status can render', () => {
    const setupResult = setup({
      installedModels: [
        'anthropic/claude-opus-4-6',
        'anthropic/claude-sonnet-4-6',
        'modelstudio/kimi-k2.5',
        'minimax/MiniMax-M2.7-highspeed'
      ]
    });

    expect(setupResult.mode).toBe('tiered');

    // Convert setup output (plain model strings) to RouteConfig format
    // that PolyMindConfig expects ({ primary, fallbacks })
    const routes = setupResult.routes as Record<string, Record<string, string | undefined>>;
    const configRoutes: PolyMindConfig['routes'] = {};

    for (const [scene, tiers] of Object.entries(routes)) {
      if (scene === 'fast') {
        const primary = (tiers as unknown as { primary: string }).primary;
        if (primary) {
          configRoutes.fast = { primary, fallbacks: [] };
        }
        continue;
      }

      const complexityMap: Record<string, { primary: string; fallbacks: string[] }> = {};
      for (const [complexity, model] of Object.entries(tiers)) {
        if (model) {
          complexityMap[complexity] = { primary: model, fallbacks: [] };
        }
      }

      if (Object.keys(complexityMap).length > 0) {
        (configRoutes as Record<string, unknown>)[scene] = complexityMap;
      }
    }

    const config: PolyMindConfig = {
      enabled: true,
      routes: configRoutes
    };

    const statusOutput = status(config);

    expect(statusOutput).toContain('✅ 已启用');
    expect(statusOutput).toContain('coding');
    expect(statusOutput).toContain('claude-opus-4-6');
    expect(statusOutput).toContain('minimax/MiniMax-M2.7-highspeed');
  });

  it('setup returns manual when no known models are installed', () => {
    const setupResult = setup({
      installedModels: ['unknown-vendor/unknown-model-xyz']
    });

    expect(setupResult.mode).toBe('manual');
    expect(Object.keys(setupResult.routes)).toHaveLength(0);
  });
});
