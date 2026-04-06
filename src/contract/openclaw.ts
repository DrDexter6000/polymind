import type { PolyMindConfig, RouteResult } from '../plugin/types.js';

export interface BeforeModelResolveEvent {
  prompt: string;
}

export interface BeforePromptBuildEvent {
  prompt: string;
  messages: unknown[];
}

export interface BeforePromptBuildResult {
  prependContext?: string;
  prependSystemContext?: string;
  appendSystemContext?: string;
  systemPrompt?: string;
}

export interface OpenClawHookContext {
  runId?: string;
  agentId?: string;
  sessionKey?: string;
  sessionId?: string;
  workspaceDir?: string;
  modelProviderId?: string;
  modelId?: string;
  messageProvider?: string;
  trigger?: string;
  channelId?: string;
}

export type BeforeModelResolveHandler = (
  event: BeforeModelResolveEvent,
  context: OpenClawHookContext
) => RouteResult | null | Promise<RouteResult | null> | undefined;

export type BeforePromptBuildHandler = (
  event: BeforePromptBuildEvent,
  context: OpenClawHookContext
) => BeforePromptBuildResult | null | Promise<BeforePromptBuildResult | null> | undefined;

export interface OpenClawPluginContext {
  config: {
    polymind?: PolyMindConfig;
  };
  pluginConfig?: Record<string, unknown>;
  on(hookName: 'before_model_resolve', handler: BeforeModelResolveHandler, opts?: { priority?: number }): void;
  on(hookName: 'before_prompt_build', handler: BeforePromptBuildHandler, opts?: { priority?: number }): void;
}

export interface OpenClawSkillContext {
  readConfig(): unknown;
  writeConfig(config: unknown): void;
}
