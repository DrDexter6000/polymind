import type { Scene } from './types.js';

export interface ContinuationDecision {
  hit: boolean;
  scene?: Scene;
}

export interface PriorTurnState {
  scene: Scene;
  prompt: string;
}

const CONTINUATION_PATTERNS = [
  /^继续$/u,
  /^再试一次$/u,
  /^换个方式$/u,
  /^按这个改$/u,
  /^continue$/iu,
  /^try again$/iu,
  /^go on$/iu
];

const ACKNOWLEDGEMENTS = [/^ok$/iu, /^好的$/u, /^谢谢$/u, /^thanks$/iu];

const SCENE_COUNTER_SIGNALS = [/代码/u, /debug/iu, /refactor/iu, /write/iu];

export function detectContinuation(
  message: string,
  priorTurnState: PriorTurnState | undefined
): ContinuationDecision {
  const trimmed = message.trim();

  if (!priorTurnState) {
    return { hit: false };
  }

  if (trimmed.length === 0 || trimmed.length > 15) {
    return { hit: false };
  }

  if (ACKNOWLEDGEMENTS.some((pattern) => pattern.test(trimmed))) {
    return { hit: false };
  }

  if (SCENE_COUNTER_SIGNALS.some((pattern) => pattern.test(trimmed))) {
    return { hit: false };
  }

  if (CONTINUATION_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { hit: true, scene: priorTurnState.scene };
  }

  return { hit: false };
}
