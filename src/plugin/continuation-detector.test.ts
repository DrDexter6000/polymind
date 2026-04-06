import { describe, expect, it } from 'vitest';
import { detectContinuation } from './continuation-detector.js';

describe('ContinuationDetector', () => {
  it('inherits prior scene for short Chinese continuation', () => {
    expect(
      detectContinuation('继续', {
        prompt: '帮我重构这个函数',
        scene: 'coding'
      })
    ).toEqual({ hit: true, scene: 'coding' });
  });

  it('inherits prior scene for short English retry', () => {
    expect(
      detectContinuation('try again', {
        prompt: '分析一下这两个方案',
        scene: 'reasoning'
      })
    ).toEqual({ hit: true, scene: 'reasoning' });
  });

  it('does not inherit without prior scene', () => {
    expect(detectContinuation('继续', undefined)).toEqual({ hit: false });
  });

  it('does not treat acknowledgement as continuation', () => {
    expect(
      detectContinuation('ok', {
        prompt: '帮我写测试',
        scene: 'coding'
      })
    ).toEqual({ hit: false });
  });

  it('does not inherit long messages', () => {
    expect(
      detectContinuation('continue with a full redesign of the whole authentication system', {
        prompt: '帮我写测试',
        scene: 'coding'
      })
    ).toEqual({ hit: false });
  });

  it('does not inherit ambiguous scene-bearing short messages', () => {
    expect(
      detectContinuation('继续写代码', {
        prompt: '分析一下架构',
        scene: 'reasoning'
      })
    ).toEqual({ hit: false });
  });
});
