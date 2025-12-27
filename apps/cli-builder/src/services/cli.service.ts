import { Effect, Console } from 'effect';
import { parseArguments } from '../utils';
import type { CliConfig, Command, Hook } from '../types';
import { runPromptMode } from './prompt.service';
import { generateHelp } from '../components';

const handleCliError = (error: unknown) =>
  Console.error(error instanceof Error ? error.message : 'An unknown error occurred').pipe(
    Effect.flatMap(() => Effect.fail(process.exit(1)))
  );

export const createCli = (config: CliConfig) => {
  if (process.argv.length <= 2) {
    return runPromptMode(config.commands);
  }

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    return Console.log(generateHelp(config));
  }

  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    return Console.log(config.version);
  }

  return Effect.try({
    try: () => parseArguments(process.argv, config),
    catch: handleCliError,
  }).pipe(
    Effect.flatMap(({ command, args }: { command: Command; args: Record<string, any> }) => {
      const runHook = (hook?: Hook) => hook ? Effect.tryPromise(() => Promise.resolve(hook(args))) : Effect.succeed(undefined);

      if (command.action) {
        return Effect.gen(function* () {
          yield* runHook(config.before);
          yield* runHook(command.before);

          yield* Effect.try({
            try: () => command.action!(args),
            catch: handleCliError,
          });

          yield* runHook(command.after);
          yield* runHook(config.after);
        });
      }
      // If no action, show help for this command context
      return Console.log(generateHelp({ ...config, commands: command.subCommands || [] }));
    })
  );
};
