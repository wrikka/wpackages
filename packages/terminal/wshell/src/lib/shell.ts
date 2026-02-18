/**
 * Shell template literal API - inspired by Bun shell
 * Usage: await $`echo hello` or await $`ls -la | grep foo`
 */
import { $ as bunShell, type ShellPromise } from "bun";
import { Effect } from "effect";
import type { PipelineData } from "../types/pipeline.types";
import type { CommandResult } from "../types/command.types";
import { binary, str, int } from "../types/value.types";
import { pipelineValue } from "../types/pipeline.types";

// Shell options
export interface ShellOptions {
  cwd?: string;
  env?: Record<string, string>;
  stdin?: PipelineData | string | Uint8Array;
  quiet?: boolean;
  nothrow?: boolean;
  timeout?: number;
}

// Extended ShellPromise with wshell features
export interface WShellPromise extends ShellPromise {
  json<T = unknown>(): Promise<T>;
  lines(): Promise<string[]>;
  table(): Promise<Record<string, string>[]>;
}

// Template literal handler
export function $(
  strings: TemplateStringsArray,
  ...values: unknown[]
): WShellPromise {
  // Build command string with safe interpolation
  let command = "";
  for (let i = 0; i < strings.length; i++) {
    command += strings[i];
    if (i < values.length) {
      const val = values[i];
      // Escape and interpolate value
      if (typeof val === "string") {
        command += escapeShellArg(val);
      } else if (typeof val === "number") {
        command += val.toString();
      } else if (val instanceof Uint8Array || val instanceof ArrayBuffer) {
        // Handle binary data
        command += new TextDecoder().decode(val);
      } else if (val && typeof val === "object" && "toString" in val) {
        command += val.toString();
      } else {
        command += String(val);
      }
    }
  }

  // Execute using Bun shell with wshell enhancements
  const promise = bunShell`bash -c ${command}` as WShellPromise;

  // Add wshell-specific methods
  promise.json = async function <T>(): Promise<T> {
    const text = await promise.text();
    return JSON.parse(text) as T;
  };

  promise.lines = async function (): Promise<string[]> {
    const text = await promise.text();
    return text.split("\n").filter(line => line.length > 0);
  };

  promise.table = async function (): Promise<Record<string, string>[]> {
    const lines = await promise.lines();
    if (lines.length === 0) return [];

    // Parse as table (TSV/CSV detection)
    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(delimiter).map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim() ?? "";
      });
      return row;
    });
  };

  return promise;
}

// Escape shell argument to prevent injection
function escapeShellArg(arg: string): string {
  // Use single quotes and escape any single quotes
  if (/[^a-zA-Z0-9_\-\/.]/.test(arg)) {
    return `"${arg.replace(/"/g, '\\"')}"`;
  }
  return arg;
}

// Create shell with options
export function createShell(options: ShellOptions = {}) {
  return {
    run: async (strings: TemplateStringsArray, ...values: unknown[]): Promise<CommandResult> => {
      const promise = $(strings, ...values);
      
      try {
        const stdout = await promise.quiet().text();
        const result: CommandResult = {
          stdout: pipelineValue(str(stdout)),
          stderr: pipelineValue(str("")),
          exitCode: 0,
        };
        return result;
      } catch (error) {
        const shellError = error as { exitCode: number; stdout: string; stderr: string };
        const result: CommandResult = {
          stdout: pipelineValue(str(shellError?.stdout ?? "")),
          stderr: pipelineValue(str(shellError?.stderr ?? "")),
          exitCode: shellError?.exitCode ?? 1,
        };
        if (!options.nothrow) {
          throw result;
        }
        return result;
      }
    },

    // Run command and return structured data
    runStructured: async <T>(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): Promise<T> => {
      const promise = $(strings, ...values);
      return promise.json<T>();
    },

    // Run command as a stream
    stream: (
      strings: TemplateStringsArray,
      ...values: unknown[]
    ): ReadableStream<Uint8Array> => {
      const promise = $(strings, ...values);
      return promise;
    },
  };
}

// Global shell configuration
let globalShellOptions: ShellOptions = {
  quiet: false,
  nothrow: false,
};

export function configureShell(options: Partial<ShellOptions>): void {
  globalShellOptions = { ...globalShellOptions, ...options };
}

export function getShellOptions(): ShellOptions {
  return { ...globalShellOptions };
}
