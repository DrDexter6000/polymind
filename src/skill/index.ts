type CommandResult =
  | { type: 'setup' }
  | { type: 'status' }
  | { type: 'config' }
  | { type: 'help'; text: string };

const HELP_TEXT = 'PolyMind — 智能模型路由\n\n可用命令:\n  /polymind setup\n  /polymind status\n  /polymind config';

export function handleCommand(input: string): CommandResult {
  const parts = input.trim().split(/\s+/u);
  const subcommand = parts[1];

  if (!subcommand) {
    return {
      type: 'help',
      text: HELP_TEXT
    };
  }

  if (subcommand === 'setup') {
    return { type: 'setup' };
  }

  if (subcommand === 'status') {
    return { type: 'status' };
  }

  if (subcommand === 'config') {
    return { type: 'config' };
  }

  return {
    type: 'help',
    text: `未知命令: ${subcommand}\n\n${HELP_TEXT}`
  };
}
