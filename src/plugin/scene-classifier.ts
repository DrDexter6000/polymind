import type { Scene } from './types.js';

const FAST_PATTERNS = [/^ok$/iu, /^好的$/u, /^yes, please proceed$/iu];
const CODING_PATTERNS = [/debug/iu, /refactor/iu, /代码/u, /函数/u, /class/iu, /```/u, /src\//u, /\.ts\b/iu];
const REASONING_PATTERNS = [/分析/u, /compare/iu, /why/iu, /评估/u];
const WRITING_PATTERNS = [/写/u, /draft/iu, /邮件/u, /document/iu];

export function classify(message: string): Scene | null {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (CODING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'coding';
  }

  if (REASONING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'reasoning';
  }

  if (WRITING_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'writing';
  }

  if (FAST_PATTERNS.some((pattern) => pattern.test(trimmed)) || trimmed.length < 20) {
    return 'fast';
  }

  return null;
}
