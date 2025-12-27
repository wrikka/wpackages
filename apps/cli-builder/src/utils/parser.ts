import type { CliConfig, Command } from '../types';

const findCommand = (commands: Command[], commandName: string): Command | undefined => {
  for (const cmd of commands) {
    if (cmd.name === commandName) {
      return cmd;
    }
    if (cmd.subCommands) {
      const found = findCommand(cmd.subCommands, commandName);
      if (found) return found;
    }
  }
  return undefined;
};

export const parseArguments = (
  argv: string[],
  config: CliConfig,
): { command: Command; args: Record<string, any> } => {
  let commands = config.commands;
  let command: Command | undefined;
  let argIndex = 2;

  while (argIndex < argv.length) {
    const currentArg = argv[argIndex];
    const foundCommand = commands.find(c => c.name === currentArg);

    if (foundCommand) {
      command = foundCommand;
      if (foundCommand.subCommands) {
        commands = foundCommand.subCommands;
        argIndex++;
      } else {
        argIndex++;
        break;
      }
    } else {
      break;
    }
  }

  if (!command) {
    throw new Error(`Command not found: ${argv.slice(2).join(' ')}`);
  }
  
  if (!command.action) {
    throw new Error(`Command "${command.name}" is a container for sub-commands and has no action.`);
  }

  const args: Record<string, any> = {};
  const commandArgs = argv.slice(argIndex);

  command.options?.forEach(opt => {
    if (opt.defaultValue !== undefined) {
      const key = opt.name.replace(/^--/, '');
      args[key] = opt.defaultValue;
    }
  });

  for (let i = 0; i < commandArgs.length; i++) {
    const arg = commandArgs[i];
    const option = command.options?.find(
      o => o.name === arg || o.shorthand === arg,
    );

    if (option) {
      const key = option.name.replace(/^--/, '');
      const nextArg = commandArgs[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  command.options?.forEach(opt => {
    const key = opt.name.replace(/^--/, '');
    if (opt.required && args[key] === undefined) {
      throw new Error(`Missing required option: ${opt.name}`);
    }
  });

  return { command, args };
};
