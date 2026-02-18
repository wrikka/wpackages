/**
 * Command executor service - manages built-in and external command execution
 */
import type { CommandArg, CommandContext, CommandResult, CommandHandler, BuiltinCommand } from "../types/command.types";
import { pipelineEmpty, pipelineValue } from "../types/pipeline.types";
import { str } from "../types/value.types";

/** Built-in command registry */
const builtinRegistry = new Map<string, CommandHandler>();
const builtinCommands = new Map<string, BuiltinCommand>();

/** Register a built-in command */
export function registerBuiltin(name: string, handler: CommandHandler): void {
  builtinRegistry.set(name, handler);
}

/** Register a full built-in command with metadata */
export function registerBuiltinCommand(command: BuiltinCommand): void {
  builtinCommands.set(command.name, command);
  builtinRegistry.set(command.name, command.handler);
}

/** Get a built-in command handler */
export function getBuiltin(name: string): CommandHandler | undefined {
  return builtinRegistry.get(name);
}

/** Check if a command is a built-in */
export function isBuiltin(name: string): boolean {
  return builtinRegistry.has(name);
}

/** List all built-in command names */
export function listBuiltins(): string[] {
  return Array.from(builtinRegistry.keys());
}

/** Execute a built-in command */
export async function executeBuiltin(
  name: string,
  args: readonly CommandArg[],
  context: CommandContext
): Promise<CommandResult> {
  const handler = builtinRegistry.get(name);
  if (!handler) {
    return {
      stdout: pipelineEmpty(),
      stderr: pipelineValue(str(`Command not found: ${name}`)),
      exitCode: 127,
    };
  }

  try {
    return await handler(args, context);
  } catch (error) {
    return {
      stdout: pipelineEmpty(),
      stderr: pipelineValue(str(`Error executing ${name}: ${String(error)}`)),
      exitCode: 1,
    };
  }
}

/** Clear all registered built-ins */
export function clearBuiltins(): void {
  builtinRegistry.clear();
  builtinCommands.clear();
}
