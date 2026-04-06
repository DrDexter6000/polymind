import { describe, expect, it } from 'vitest';
import type {
  BeforeModelResolveHandler,
  BeforePromptBuildHandler,
  OpenClawPluginContext
} from '../contract/openclaw.js';
import { register } from './index.js';
import type { PolyMindConfig } from './types.js';

function createConfig(): PolyMindConfig {
  return {
    enabled: true,
    routes: {
      coding: {
        low: {
          primary: 'provider/coding-low',
          fallbacks: []
        }
      },
      fast: {
        primary: 'provider/fast-model',
        fallbacks: []
      }
    }
  };
}

function createPluginContext(options?: {
  config?: OpenClawPluginContext['config'];
  pluginConfig?: OpenClawPluginContext['pluginConfig'];
  onBeforeModelResolve?: (handler: BeforeModelResolveHandler) => void;
  onBeforePromptBuild?: (handler: BeforePromptBuildHandler) => void;
}): OpenClawPluginContext {
  function on(hookName: 'before_model_resolve', handler: BeforeModelResolveHandler, _opts?: { priority?: number }): void;
  function on(hookName: 'before_prompt_build', handler: BeforePromptBuildHandler, _opts?: { priority?: number }): void;
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
    config: options?.config ?? {},
    pluginConfig: options?.pluginConfig,
    on
  };
}

describe('plugin register', () => {
  it('registers before_model_resolve and before_prompt_build hooks', () => {
    const hookNames: string[] = [];

    const context = createPluginContext({
      onBeforeModelResolve: () => {
        hookNames.push('before_model_resolve');
      },
      onBeforePromptBuild: () => {
        hookNames.push('before_prompt_build');
      }
    });

    register(context);

    expect(hookNames).toEqual(['before_model_resolve', 'before_prompt_build']);
  });

  it('returns null when config is disabled or missing', () => {
    let beforeModelResolve:
      | BeforeModelResolveHandler
      | undefined;

    const context = createPluginContext({
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      }
    });

    register(context);

    expect(
      beforeModelResolve?.({ prompt: '继续' }, {})
    ).toBeNull();
  });

  it('uses previous turn scene captured from before_prompt_build for continuation hits', () => {
    let beforeModelResolve:
      | BeforeModelResolveHandler
      | undefined;
    let beforePromptBuild:
      | BeforePromptBuildHandler
      | undefined;

    const context = createPluginContext({
      pluginConfig: createConfig() as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      },
      onBeforePromptBuild: (handler) => {
        beforePromptBuild = handler;
      }
    });

    register(context);

    beforePromptBuild?.(
      {
        prompt: '帮我 debug 这个函数',
        messages: [{ role: 'user', content: '帮我 debug 这个函数' }]
      },
      {
        sessionKey: 'session-1'
      }
    );

    expect(
      beforeModelResolve?.(
        { prompt: '继续' },
        {
          sessionKey: 'session-1'
        }
      )
    ).toEqual({
      modelOverride: 'coding-low',
      providerOverride: 'provider'
    });
  });

  it('falls back to fast routing for acknowledgement messages', () => {
    let beforeModelResolve:
      | BeforeModelResolveHandler
      | undefined;
    let beforePromptBuild:
      | BeforePromptBuildHandler
      | undefined;

    const context = createPluginContext({
      pluginConfig: createConfig() as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      },
      onBeforePromptBuild: (handler) => {
        beforePromptBuild = handler;
      }
    });

    register(context);

    beforePromptBuild?.(
      {
        prompt: '帮我 debug 这个函数',
        messages: [{ role: 'user', content: '帮我 debug 这个函数' }]
      },
      {
        sessionKey: 'session-1'
      }
    );

    expect(
      beforeModelResolve?.(
        { prompt: 'ok' },
        {
          sessionKey: 'session-1'
        }
      )
    ).toEqual({
      modelOverride: 'fast-model',
      providerOverride: 'provider'
    });
  });

  it('does not let fast acknowledgements overwrite prior meaningful continuation state', () => {
    let beforeModelResolve:
      | BeforeModelResolveHandler
      | undefined;
    let beforePromptBuild:
      | BeforePromptBuildHandler
      | undefined;

    const context = createPluginContext({
      pluginConfig: createConfig() as unknown as Record<string, unknown>,
      onBeforeModelResolve: (handler) => {
        beforeModelResolve = handler;
      },
      onBeforePromptBuild: (handler) => {
        beforePromptBuild = handler;
      }
    });

    register(context);

    beforePromptBuild?.(
      {
        prompt: '帮我 debug 这个函数',
        messages: [{ role: 'user', content: '帮我 debug 这个函数' }]
      },
      {
        sessionKey: 'session-1'
      }
    );

    beforePromptBuild?.(
      {
        prompt: 'ok',
        messages: [{ role: 'user', content: 'ok' }]
      },
      {
        sessionKey: 'session-1'
      }
    );

    expect(
      beforeModelResolve?.(
        { prompt: '继续' },
        {
          sessionKey: 'session-1'
        }
      )
    ).toEqual({
      modelOverride: 'coding-low',
      providerOverride: 'provider'
    });
  });
});
