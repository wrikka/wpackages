/**
 * Command types for wshell
 * Defines the structure of commands and their execution
 */
import type { PipelineData } from "./pipeline.types";
import type { ShellValue } from "./value.types";

// Token types for parsing
export type TokenType =
  | "Word"
  | "String"
  | "Number"
  | "Pipe"
  | "RedirectOut"
  | "RedirectAppend"
  | "RedirectIn"
  | "Semicolon"
  | "And"
  | "Or"
  | "LParen"
  | "RParen"
  | "LBrace"
  | "RBrace"
  | "LBracket"
  | "RBracket"
  | "Comma"
  | "Colon"
  | "Equals"
  | "Dollar"
  | "At"
  | "Eof";

export type Token = {
  readonly type: TokenType;
  readonly value: string;
  readonly position: number;
  readonly line: number;
  readonly column: number;
};

// Command argument types
export type CommandArg =
  | { readonly _tag: "Positional"; readonly value: string }
  | { readonly _tag: "Flag"; readonly name: string; readonly value?: string }
  | { readonly _tag: "Spread"; readonly values: string[] }
  | { readonly _tag: "Expression"; readonly value: ShellValue };

// Command structure
export type Command = {
  readonly name: string;
  readonly args: readonly CommandArg[];
  readonly env: Readonly<Record<string, string>>;
  readonly redirect?: {
    readonly stdout?: string;
    readonly stderr?: string;
    readonly stdin?: string;
    readonly append?: boolean;
  };
};

// Pipeline structure
export type Pipeline = {
  readonly commands: readonly Command[];
  readonly operators: readonly ("pipe" | "and" | "or")[];
};

// Parsed command with metadata
export type ParsedCommand = {
  readonly pipeline: Pipeline;
  readonly raw: string;
  readonly tokens: readonly Token[];
};

// Command execution context
export type CommandContext = {
  readonly cwd: string;
  readonly env: Map<string, string>;
  readonly stdin: PipelineData;
  readonly signals: AbortSignal;
};

// Command result
export type CommandResult = {
  readonly stdout: PipelineData;
  readonly stderr: PipelineData;
  readonly exitCode: number;
};

// Command handler type
export type CommandHandler = (
  args: readonly CommandArg[],
  context: CommandContext
) => Promise<CommandResult> | CommandResult;

// Built-in command definition
export type BuiltinCommand = {
  readonly name: string;
  readonly description: string;
  readonly category: CommandCategory;
  readonly signature: CommandSignature;
  readonly handler: CommandHandler;
  readonly examples?: readonly CommandExample[];
};

export type CommandCategory =
  | "filesystem"
  | "system"
  | "filters"
  | "strings"
  | "math"
  | "network"
  | "data"
  | "debug"
  | "shells"
  | "custom";

export type CommandSignature = {
  readonly positionalParams: readonly PositionalParam[];
  readonly namedParams: readonly NamedParam[];
  readonly inputType?: string;
  readonly outputType?: string;
  readonly isVariadic?: boolean;
};

export type PositionalParam = {
  readonly name: string;
  readonly description: string;
  readonly required: boolean;
  readonly defaultValue?: ShellValue;
};

export type NamedParam = {
  readonly name: string;
  readonly shortFlag?: string;
  readonly description: string;
  readonly type: "string" | "number" | "boolean" | "list";
  readonly required: boolean;
  readonly defaultValue?: ShellValue;
};

export type CommandExample = {
  readonly description: string;
  readonly command: string;
  readonly result?: string;
};

// Command registry
export type CommandRegistry = {
  readonly builtins: ReadonlyMap<string, BuiltinCommand>;
  readonly aliases: ReadonlyMap<string, string>;
  readonly plugins: ReadonlyMap<string, PluginCommand>;
};

export type PluginCommand = {
  readonly name: string;
  readonly plugin: string;
  readonly description: string;
};
