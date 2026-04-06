import { describe, expect, it } from 'vitest';
import { resolve } from './route-resolver.js';
import type { PolyMindConfig } from './types.js';

describe('RouteResolver', () => {
  const tieredConfig: PolyMindConfig = {
    enabled: true,
    routes: {
      coding: {
        high: { primary: 'anthropic/claude-opus-4-6', fallbacks: [] },
        medium: { primary: 'anthropic/claude-sonnet-4-6', fallbacks: [] },
        low: { primary: 'modelstudio/kimi-k2.5', fallbacks: [] }
      }
    }
  };

  it('returns exact tier match from tiered config', () => {
    expect(resolve('coding', 'high', tieredConfig)).toEqual({
      modelOverride: 'claude-opus-4-6',
      providerOverride: 'anthropic'
    });
  });

  it('returns low tier match from tiered config', () => {
    expect(resolve('coding', 'low', tieredConfig)).toEqual({
      modelOverride: 'kimi-k2.5',
      providerOverride: 'modelstudio'
    });
  });

  it('falls back from low to medium when low tier missing', () => {
    expect(
      resolve('coding', 'low', {
        enabled: true,
        routes: {
          coding: {
            medium: { primary: 'anthropic/claude-sonnet-4-6', fallbacks: [] },
            high: { primary: 'anthropic/claude-opus-4-6', fallbacks: [] }
          }
        }
      })
    ).toEqual({
      modelOverride: 'claude-sonnet-4-6',
      providerOverride: 'anthropic'
    });
  });

  it('uses flat config without looking at complexity', () => {
    expect(
      resolve('coding', 'high', {
        enabled: true,
        routes: {
          coding: {
            primary: 'claude-opus-4-6',
            fallbacks: []
          }
        }
      })
    ).toEqual({
      modelOverride: 'claude-opus-4-6'
    });
  });

  it('returns null when scene route is missing', () => {
    expect(resolve('reasoning', 'high', tieredConfig)).toBeNull();
  });

  it('returns null when feature is disabled', () => {
    expect(resolve('coding', 'high', { ...tieredConfig, enabled: false })).toBeNull();
  });

  it('parses provider/model primary', () => {
    expect(resolve('coding', 'medium', tieredConfig)).toEqual({
      modelOverride: 'claude-sonnet-4-6',
      providerOverride: 'anthropic'
    });
  });

  it('returns model only when provider is absent', () => {
    expect(
      resolve('coding', 'high', {
        enabled: true,
        routes: {
          coding: {
            high: { primary: 'claude-opus-4-6', fallbacks: [] }
          }
        }
      })
    ).toEqual({
      modelOverride: 'claude-opus-4-6'
    });
  });
});
