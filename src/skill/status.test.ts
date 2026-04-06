import { describe, expect, it } from 'vitest';
import { status } from './status.js';

describe('status', () => {
  it('shows setup hint when polymind is missing', () => {
    expect(status(undefined)).toBe('PolyMind 未配置，请运行 /polymind setup');
  });

  it('shows enabled tiered routes', () => {
    expect(
      status({
        enabled: true,
        routes: {
          coding: {
            high: { primary: 'anthropic/claude-opus-4-6', fallbacks: ['openai/gpt-5.4-codex'] }
          },
          fast: {
            primary: 'minimax/MiniMax-M2.7-highspeed',
            fallbacks: []
          }
        }
      })
    ).toContain('PolyMind 状态: ✅ 已启用');
  });

  it('shows disabled status when feature is off', () => {
    expect(
      status({
        enabled: false,
        routes: {
          fast: {
            primary: 'minimax/MiniMax-M2.7-highspeed',
            fallbacks: []
          }
        }
      })
    ).toContain('PolyMind 状态: ❌ 已禁用');
  });
});
