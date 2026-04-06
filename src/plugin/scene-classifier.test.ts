import { describe, expect, it } from 'vitest';
import { classify } from './scene-classifier.js';

describe('SceneClassifier', () => {
  it('classifies mixed Chinese/English coding request', () => {
    expect(classify('帮我 debug 这个函数')).toBe('coding');
  });

  it('classifies English coding request', () => {
    expect(classify('Please refactor this class')).toBe('coding');
  });

  it('classifies code block as coding', () => {
    expect(classify('```ts\nconst x = 1\n```')).toBe('coding');
  });

  it('classifies file path reference as coding', () => {
    expect(classify('src/plugin/index.ts 这个文件有问题')).toBe('coding');
  });

  it('classifies Chinese reasoning request', () => {
    expect(classify('分析一下这两个方案的优劣')).toBe('reasoning');
  });

  it('classifies English reasoning request', () => {
    expect(classify('Compare React vs Vue for this project')).toBe('reasoning');
  });

  it('classifies Chinese writing request', () => {
    expect(classify('帮我写一封邮件给客户')).toBe('writing');
  });

  it('classifies English writing request', () => {
    expect(classify('Draft a blog post about AI routing')).toBe('writing');
  });

  it('classifies short acknowledgement as fast', () => {
    expect(classify('好的')).toBe('fast');
  });

  it('classifies ok as fast', () => {
    expect(classify('ok')).toBe('fast');
  });

  it('classifies short proceed message as fast', () => {
    expect(classify('Yes, please proceed')).toBe('fast');
  });

  it('returns null for empty input', () => {
    expect(classify('')).toBeNull();
  });

  it('returns null for unmatched long message', () => {
    expect(classify('今天天气真不错，你觉得我应该去哪里玩比较好？')).toBeNull();
  });

  it('prioritizes coding over reasoning when both match', () => {
    expect(classify('帮我 debug 并分析一下这个函数的性能')).toBe('coding');
  });
});
