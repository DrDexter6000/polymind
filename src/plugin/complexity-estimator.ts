import type { Complexity, Scene } from './types.js';

export function estimate(message: string, scene: Scene): Complexity {
  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return 'low';
  }

  if (scene === 'fast') {
    return 'low';
  }

  const followUpPatterns = [/^继续$/u, /^try again$/iu, /^改一下/u, /^换个方式$/u, /^go on$/iu, /^retry$/iu];
  const hasCodeBlock = trimmed.includes('```');
  const fileMatches = trimmed.match(/(?:[\w-]+\/)+[\w.-]+\.[a-z]+/giu) ?? [];
  const hasMultiStepSignal = /首先.*然后.*最后/u.test(trimmed) || /step\s*1.*step\s*2/iu.test(trimmed);

  if (trimmed.length > 100 || hasCodeBlock || fileMatches.length >= 2 || hasMultiStepSignal) {
    return 'high';
  }

  if (trimmed.length < 30 && followUpPatterns.some((pattern) => pattern.test(trimmed))) {
    return 'low';
  }

  return 'medium';
}
