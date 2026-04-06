import { describe, expect, it } from 'vitest';
import type {
  BeforeModelResolveEvent,
  BeforePromptBuildEvent,
  OpenClawHookContext,
  OpenClawPluginContext
} from './openclaw.js';

describe('OpenClaw contract scaffold', () => {
  it('defines typed hook registration on plugin api', () => {
    const context: OpenClawPluginContext = {
      config: {},
      on: () => undefined
    };

    expect(context.on).toBeDefined();
  });

  it('defines before_model_resolve event shape', () => {
    const event: BeforeModelResolveEvent = {
      prompt: 'debug this function'
    };

    expect(event.prompt).toContain('debug');
  });

  it('defines before_prompt_build event shape', () => {
    const event: BeforePromptBuildEvent = {
      prompt: 'continue',
      messages: [{ role: 'user', content: 'debug this function' }]
    };

    expect(event.messages).toHaveLength(1);
  });

  it('defines hook context session metadata fields', () => {
    const context: OpenClawHookContext = {
      sessionKey: 'session-1'
    };

    expect(context.sessionKey).toBe('session-1');
  });
});
