import { describe, expect, it } from 'vitest';
import type { PolyMindConfig } from '../plugin/types.js';
import { config } from './config.js';

describe('config updates', () => {
  const base: PolyMindConfig = {
    enabled: true,
    routes: {
      coding: {
        high: {
          primary: 'anthropic/claude-opus-4-6',
          fallbacks: ['openai/gpt-5.4-codex']
        }
      }
    }
  };

  it('updates a scene tier primary', () => {
    expect(
      config(base, {
        type: 'set-primary',
        scene: 'coding',
        complexity: 'high',
        primary: 'anthropic/claude-sonnet-4-6'
      })
    ).toEqual({
      enabled: true,
      routes: {
        coding: {
          high: {
            primary: 'anthropic/claude-sonnet-4-6',
            fallbacks: ['openai/gpt-5.4-codex']
          }
        }
      }
    });
  });

  it('adds a fallback', () => {
    expect(
      config(base, {
        type: 'add-fallback',
        scene: 'coding',
        complexity: 'high',
        fallback: 'modelstudio/kimi-k2.5'
      })
    ).toEqual({
      enabled: true,
      routes: {
        coding: {
          high: {
            primary: 'anthropic/claude-opus-4-6',
            fallbacks: ['openai/gpt-5.4-codex', 'modelstudio/kimi-k2.5']
          }
        }
      }
    });
  });

  it('removes a fallback', () => {
    expect(
      config(base, {
        type: 'remove-fallback',
        scene: 'coding',
        complexity: 'high',
        fallback: 'openai/gpt-5.4-codex'
      })
    ).toEqual({
      enabled: true,
      routes: {
        coding: {
          high: {
            primary: 'anthropic/claude-opus-4-6',
            fallbacks: []
          }
        }
      }
    });
  });

  it('disables polymind', () => {
    expect(
      config(base, {
        type: 'set-enabled',
        enabled: false
      })
    ).toEqual({
      enabled: false,
      routes: base.routes
    });
  });

  it('degrades tiered route to flat route', () => {
    expect(
      config(base, {
        type: 'flatten-scene',
        scene: 'coding'
      })
    ).toEqual({
      enabled: true,
      routes: {
        coding: {
          primary: 'anthropic/claude-opus-4-6',
          fallbacks: ['openai/gpt-5.4-codex']
        }
      }
    });
  });
});
