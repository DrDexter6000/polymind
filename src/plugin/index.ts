import type { OpenClawPluginContext } from '../contract/openclaw.js';
import { estimate } from './complexity-estimator.js';
import { detectContinuation } from './continuation-detector.js';
import { resolve } from './route-resolver.js';
import { classify } from './scene-classifier.js';
import type { PolyMindConfig } from './types.js';

interface TurnState {
  prompt: string;
  scene: Exclude<ReturnType<typeof classify>, null>;
}

function shouldPersistTurnState(scene: Exclude<ReturnType<typeof classify>, null>): boolean {
  return scene !== 'fast';
}

function isPolyMindConfig(value: unknown): value is PolyMindConfig {
  return value !== null && typeof value === 'object' && 'enabled' in value && 'routes' in value;
}

function readPolyMindConfig(api: OpenClawPluginContext): PolyMindConfig | undefined {
  if (isPolyMindConfig(api.pluginConfig)) {
    return api.pluginConfig;
  }

  return api.config.polymind;
}

function extractLastUserPrompt(messages: unknown[], fallbackPrompt: string): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || typeof message !== 'object') {
      continue;
    }

    if (!('content' in message) || typeof message.content !== 'string') {
      continue;
    }

    if ('role' in message && typeof message.role === 'string' && message.role !== 'user') {
      continue;
    }

    return message.content;
  }

  return fallbackPrompt;
}

export function register(context: OpenClawPluginContext): void {
  const config = readPolyMindConfig(context);
  const sessionState = new Map<string, TurnState>();

  context.on('before_model_resolve', (event, hookContext) => {
    if (!config?.enabled) {
      return null;
    }

    const priorTurn = hookContext.sessionKey
      ? sessionState.get(hookContext.sessionKey)
      : undefined;

    const continuation = detectContinuation(event.prompt, priorTurn?.scene ? priorTurn : undefined);

    if (continuation.hit && continuation.scene) {
      return resolve(continuation.scene, 'low', config);
    }

    const scene = classify(event.prompt);
    if (!scene) {
      return null;
    }

    if (scene === 'fast') {
      return resolve('fast', 'low', config);
    }

    const complexity = estimate(event.prompt, scene);
    return resolve(scene, complexity, config);
  });

  context.on('before_prompt_build', (event, hookContext) => {
    if (!hookContext.sessionKey) {
      return;
    }

    const prompt = extractLastUserPrompt(event.messages, event.prompt);
    const scene = classify(prompt);

    if (!scene) {
      sessionState.delete(hookContext.sessionKey);
      return;
    }

    if (!shouldPersistTurnState(scene)) {
      return;
    }

    sessionState.set(hookContext.sessionKey, {
      prompt,
      scene
    });
  });
}
