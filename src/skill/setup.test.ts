import { describe, expect, it } from 'vitest';
import { setup } from './setup.js';

describe('setup', () => {
  it('builds tiered recommendations from built-in hints when three or more models exist', () => {
    expect(
      setup({
        installedModels: ['claude-opus-4-6', 'claude-sonnet-4-6', 'minimax/MiniMax-M2.7-highspeed']
      })
    ).toEqual({
      mode: 'tiered',
      routes: {
        coding: {
          high: 'claude-opus-4-6',
          medium: 'claude-sonnet-4-6'
        },
        reasoning: {
          high: 'claude-opus-4-6'
        },
        writing: {
          medium: 'claude-sonnet-4-6'
        },
        fast: {
          primary: 'minimax/MiniMax-M2.7-highspeed'
        }
      }
    });
  });

  it('builds flat recommendations when fewer than three models exist', () => {
    expect(
      setup({
        installedModels: ['kimi-k2.5', 'glm-5-turbo']
      })
    ).toEqual({
      mode: 'flat',
      routes: {
        coding: {
          primary: 'kimi-k2.5'
        },
        writing: {
          primary: 'glm-5-turbo'
        },
        fast: {
          primary: 'glm-5-turbo'
        }
      }
    });
  });

  it('uses user modelHints overrides when present', () => {
    expect(
      setup({
        installedModels: ['claude-opus-4-6', 'my-custom-model', 'minimax/MiniMax-M2.7-highspeed'],
        userModelHints: {
          'my-custom-model': {
            scenes: ['writing'],
            tier: 2
          }
        }
      })
    ).toEqual({
      mode: 'tiered',
      routes: {
        coding: {
          high: 'claude-opus-4-6'
        },
        reasoning: {
          high: 'claude-opus-4-6'
        },
        writing: {
          medium: 'my-custom-model'
        },
        fast: {
          primary: 'minimax/MiniMax-M2.7-highspeed'
        }
      }
    });
  });

  it('returns manual configuration signal when no known models match', () => {
    expect(
      setup({
        installedModels: ['unknown-a', 'unknown-b']
      })
    ).toEqual({
      mode: 'manual',
      routes: {}
    });
  });
});
