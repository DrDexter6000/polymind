import { describe, expect, it } from 'vitest';
import { handleCommand } from './index.js';

describe('skill command router', () => {
  it('routes setup subcommand', () => {
    expect(handleCommand('/polymind setup')).toEqual({ type: 'setup' });
  });

  it('routes status subcommand', () => {
    expect(handleCommand('/polymind status')).toEqual({ type: 'status' });
  });

  it('routes config subcommand', () => {
    expect(handleCommand('/polymind config')).toEqual({ type: 'config' });
  });

  it('returns help for root command', () => {
    expect(handleCommand('/polymind')).toEqual({
      type: 'help',
      text: 'PolyMind — 智能模型路由\n\n可用命令:\n  /polymind setup\n  /polymind status\n  /polymind config'
    });
  });

  it('returns unknown command help for unsupported subcommand', () => {
    expect(handleCommand('/polymind foo')).toEqual({
      type: 'help',
      text: '未知命令: foo\n\nPolyMind — 智能模型路由\n\n可用命令:\n  /polymind setup\n  /polymind status\n  /polymind config'
    });
  });
});
