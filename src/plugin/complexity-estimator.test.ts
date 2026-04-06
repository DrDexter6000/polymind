import { describe, expect, it } from 'vitest';
import { estimate } from './complexity-estimator.js';

describe('ComplexityEstimator', () => {
  it('marks very long coding request as high', () => {
    expect(
      estimate('请帮我重构这个认证模块并拆分服务层、控制层、测试层。'.repeat(20), 'coding')
    ).toBe('high');
  });

  it('marks code block message as high', () => {
    expect(estimate('```ts\nfunction demo() {}\n```', 'coding')).toBe('high');
  });

  it('marks multi-file reference as high', () => {
    expect(estimate('重构 src/a.ts 和 src/b.ts 两个文件', 'coding')).toBe('high');
  });

  it('marks multi-step request as high', () => {
    expect(estimate('首先分析需求，然后设计方案，最后实现', 'reasoning')).toBe('high');
  });

  it('marks ordinary coding request as medium', () => {
    expect(estimate('帮我修一下这个 bug', 'coding')).toBe('medium');
  });

  it('marks short continuation-like edit as low', () => {
    expect(estimate('改一下变量名', 'coding')).toBe('low');
  });

  it('marks English retry as low', () => {
    expect(estimate('try again', 'coding')).toBe('low');
  });

  it('marks empty message as low', () => {
    expect(estimate('', 'coding')).toBe('low');
  });

  it('marks normal reasoning question as medium', () => {
    expect(estimate('这个函数的返回值是什么意思？', 'reasoning')).toBe('medium');
  });

  it('treats short fast scene content as low when called directly', () => {
    expect(estimate('ok', 'fast')).toBe('low');
  });
});
