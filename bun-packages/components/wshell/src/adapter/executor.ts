/**
 * Executor service - executes parsed commands
 */
import { Effect } from "effect";
import type { Command, CommandArg, CommandContext, CommandResult, Pipeline } from "../types/command.types";
import type { PipelineData } from "../types/pipeline.types";
import { pipelineValue, pipelineEmpty } from "../types/pipeline.types";
import { str, binary, int } from "../types/value.types";
import { $ } from "bun";

export class ExecuteError extends Error {
  constructor(
    message: string,
    public command: string,
    public exitCode: number = 1
  ) {
    super(message);
    this.name = "ExecuteError";
  }
}

// Execute a single command
export async function executeCommand(
  command: Command,
  context: CommandContext,
  input: PipelineData = pipelineEmpty()
): Promise<CommandResult> {
  // Handle built-in commands
  const builtIn = getBuiltinCommand(command.name);
  if (builtIn) {
    return builtIn(command.args, context);
  }

  // Handle external commands using Bun shell
  const args = command.args
    .filter((a): a is { _tag: "Positional" | "Flag"; name?: string; value?: string } => 
      a._tag === "Positional" || a._tag === "Flag"
    )
    .map(a => {
      if (a._tag === "Positional") return a.value;
      return a.value ? `--${a.name}=${a.value}` : `--${a.name}`;
    })
    .join(" ");

  const cmd = args ? `${command.name} ${args}` : command.name;

  try {
    const result = await $`bash -c ${cmd}`
      .cwd(context.cwd)
      .env(Object.fromEntries(context.env))
      .quiet();

    const stdout = await result.text();

    return {
      stdout: pipelineValue(str(stdout)),
      stderr: pipelineValue(str("")),
      exitCode: result.exitCode,
    };
  } catch (error) {
    const shellError = error as { exitCode: number; stdout: string; stderr: string };
    return {
      stdout: pipelineValue(str(shellError?.stdout ?? "")),
      stderr: pipelineValue(str(shellError?.stderr ?? String(error))),
      exitCode: shellError?.exitCode ?? 1,
    };
  }
}

// Execute a pipeline of commands
export function executePipeline(
  pipeline: Pipeline,
  context: CommandContext
): Effect.Effect<CommandResult, ExecuteError> {
  return Effect.tryPromise({
    try: async () => {
      let currentInput: PipelineData = context.stdin;
      let lastResult: CommandResult = {
        stdout: pipelineEmpty(),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };

      for (let i = 0; i < pipeline.commands.length; i++) {
        const command = pipeline.commands[i];
        const operator = pipeline.operators[i - 1];

        // Check conditional execution
        if (operator === "and" && lastResult.exitCode !== 0) {
          break;
        }
        if (operator === "or" && lastResult.exitCode === 0) {
          break;
        }

        const result = await executeCommand(command, context, currentInput);
        lastResult = result;

        // Pass stdout to next command if piped
        if (operator === "pipe" && i < pipeline.commands.length - 1) {
          currentInput = result.stdout;
        }
      }

      return lastResult;
    },
    catch: (error) => {
      if (error instanceof ExecuteError) {
        return error;
      }
      return new ExecuteError(String(error), "pipeline");
    },
  });
}

// Built-in command registry
const builtinRegistry = new Map<string, (args: readonly CommandArg[], ctx: CommandContext) => Promise<CommandResult>>();

export function registerBuiltin(
  name: string,
  handler: (args: readonly CommandArg[], ctx: CommandContext) => Promise<CommandResult>
): void {
  builtinRegistry.set(name, handler);
}

function getBuiltinCommand(name: string): ((args: readonly CommandArg[], ctx: CommandContext) => Promise<CommandResult>) | undefined {
  return builtinRegistry.get(name);
}

// Initialize built-in commands
export function initializeBuiltins(): void {
  // echo - print arguments
  registerBuiltin("echo", async (args) => {
    const output = args
      .filter((a): a is { _tag: "Positional" } => a._tag === "Positional")
      .map(a => a.value)
      .join(" ");
    
    return {
      stdout: pipelineValue(str(output + "\n")),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  // pwd - print working directory
  registerBuiltin("pwd", async (_, ctx) => {
    return {
      stdout: pipelineValue(str(ctx.cwd + "\n")),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  // cd - change directory
  registerBuiltin("cd", async (args, ctx) => {
    const path = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value ?? "~";
    const expanded = path.replace(/^~/, process.env.HOME ?? "~");
    const resolved = require("path").resolve(ctx.cwd, expanded);
    
    try {
      const stat = require("fs").statSync(resolved);
      if (!stat.isDirectory()) {
        throw new Error(`${path} is not a directory`);
      }
      ctx.cwd = resolved;
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } catch (error) {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineValue(str(`cd: ${error}\n`)),
        exitCode: 1,
      };
    }
  });

  // cat - concatenate files
  registerBuiltin("cat", async (args, ctx) => {
    const paths = args
      .filter((a): a is { _tag: "Positional" } => a._tag === "Positional")
      .map(a => a.value);

    if (paths.length === 0) {
      // Read from stdin
      const { collectToValue } = await import("../types/pipeline.types");
      const value = await collectToValue(ctx.stdin);
      return {
        stdout: pipelineValue(value),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    }

    const fs = require("fs");
    const results: Uint8Array[] = [];

    for (const path of paths) {
      try {
        const resolved = require("path").resolve(ctx.cwd, path);
        const data = fs.readFileSync(resolved);
        results.push(new Uint8Array(data));
      } catch (error) {
        return {
          stdout: pipelineEmpty(),
          stderr: pipelineValue(str(`cat: ${path}: ${error}\n`)),
          exitCode: 1,
        };
      }
    }

    // Concatenate all files
    const totalSize = results.reduce((sum, buf) => sum + buf.length, 0);
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const buf of results) {
      combined.set(buf, offset);
      offset += buf.length;
    }

    return {
      stdout: pipelineValue(binary(combined)),
      stderr: pipelineEmpty(),
      exitCode: 0,
    };
  });

  // ls - list directory
  registerBuiltin("ls", async (args, ctx) => {
    const fs = require("fs");
    const path = require("path");
    
    const targetPath = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value ?? ".";
    const resolved = path.resolve(ctx.cwd, targetPath);

    try {
      const entries = fs.readdirSync(resolved, { withFileTypes: true });
      const { record, list, str, table } = await import("../types/value.types");

      const rows = entries.map(entry => {
        const stats = fs.statSync(path.join(resolved, entry.name));
        return record({
          name: str(entry.name),
          type: str(entry.isDirectory() ? "dir" : entry.isFile() ? "file" : "other"),
          size: { _tag: "Int", value: BigInt(stats.size) } as const,
          modified: { _tag: "Date", value: stats.mtime } as const,
        });
      });

      return {
        stdout: pipelineValue(table(["name", "type", "size", "modified"], rows)),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } catch (error) {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineValue(str(`ls: ${error}\n`)),
        exitCode: 1,
      };
    }
  });

  // exit - exit shell
  registerBuiltin("exit", async (args) => {
    const code = args.find((a): a is { _tag: "Expression"; value: { _tag: "Int" } } => 
      a._tag === "Expression" && a.value._tag === "Int"
    )?.value.value ?? 0n;
    
    process.exit(Number(code));
  });

  // which - find command path
  registerBuiltin("which", async (args) => {
    const command = args.find((a): a is { _tag: "Positional" } => a._tag === "Positional")?.value;
    
    if (!command) {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineValue(str("which: command not specified\n")),
        exitCode: 1,
      };
    }

    try {
      const result = await $`which ${command}`.quiet();
      const path = await result.text();
      return {
        stdout: pipelineValue(str(path.trim())),
        stderr: pipelineEmpty(),
        exitCode: 0,
      };
    } catch {
      return {
        stdout: pipelineEmpty(),
        stderr: pipelineValue(str(`${command} not found\n`)),
        exitCode: 1,
      };
    }
  });
}
