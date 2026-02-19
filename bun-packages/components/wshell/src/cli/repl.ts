/**
 * REPL (Read-Eval-Print Loop) for wshell
 * Interactive shell with completions, history, and syntax highlighting
 */
import * as readline from "node:readline";
import { createInterface, type Interface as ReadlineInterface } from "node:readline";
import { Effect } from "effect";
import { tokenize, parse } from "../lib/parser";
import { executePipeline, initializeBuiltins } from "../adapter/executor";
import { registerFilterCommands } from "../services/filters.register";
import { Shell } from "../services/shell.service";
import { pipelineEmpty, collectToValue } from "../types/pipeline.types";
import { toString } from "../types/value.types";
import type { CommandResult } from "../types/command.types";
import { isTable, isList, isRecord } from "../types/value.types";

// REPL configuration
interface REPLConfig {
  prompt: string;
  multilinePrompt: string;
  historyFile?: string;
  maxHistory: number;
  colors: boolean;
}

const defaultConfig: REPLConfig = {
  prompt: "wshell> ",
  multilinePrompt: "     > ",
  maxHistory: 1000,
  colors: true,
};

// REPL state
interface REPLState {
  shell: Shell;
  history: string[];
  historyIndex: number;
  inputBuffer: string;
  isMultiline: boolean;
  config: REPLConfig;
}

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Create colored prompt
function colorizePrompt(config: REPLConfig, cwd: string): string {
  if (!config.colors) return `${cwd} ${config.prompt}`;
  return `${colors.cyan}${cwd}${colors.reset} ${colors.green}${config.prompt}${colors.reset}`;
}

// Create REPL
export function createREPL(config: Partial<REPLConfig> = {}): ReadlineInterface {
  const mergedConfig = { ...defaultConfig, ...config };
  const state: REPLState = {
    shell: new Shell(),
    history: [],
    historyIndex: -1,
    inputBuffer: "",
    isMultiline: false,
    config: mergedConfig,
  };

  // Initialize builtins
  initializeBuiltins();
  registerFilterCommands();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colorizePrompt(mergedConfig, state.shell.getCwd()),
    historySize: mergedConfig.maxHistory,
    completer: (line: string) => completer(line, state),
  });

  // Handle line input
  rl.on("line", async (input) => {
    const trimmed = input.trim();

    // Handle multiline input
    if (state.isMultiline) {
      state.inputBuffer += "\n" + trimmed;

      // Check if we should exit multiline mode
      if (trimmed === "" || isBalanced(state.inputBuffer)) {
        await processInput(state.inputBuffer, state, rl);
        state.isMultiline = false;
        state.inputBuffer = "";
        rl.setPrompt(colorizePrompt(mergedConfig, state.shell.getCwd()));
      } else {
        rl.setPrompt(mergedConfig.multilinePrompt);
      }
    } else {
      if (trimmed === "") {
        rl.prompt();
        return;
      }

      // Check if we need to enter multiline mode
      if (!isBalanced(trimmed)) {
        state.isMultiline = true;
        state.inputBuffer = trimmed;
        rl.setPrompt(mergedConfig.multilinePrompt);
        rl.prompt();
        return;
      }

      await processInput(trimmed, state, rl);
    }

    rl.prompt();
  });

  // Handle Ctrl+C
  rl.on("SIGINT", () => {
    if (state.isMultiline) {
      state.isMultiline = false;
      state.inputBuffer = "";
      console.log("^C");
      rl.setPrompt(colorizePrompt(mergedConfig, state.shell.getCwd()));
      rl.prompt();
    } else {
      console.log("\nUse 'exit' to quit");
      rl.prompt();
    }
  });

  // Handle Ctrl+D (EOF)
  rl.on("close", () => {
    console.log("\nGoodbye!");
    process.exit(0);
  });

  return rl;
}

// Check if brackets are balanced
function isBalanced(input: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const closing = new Set([")", "]", "}"]);

  // Ignore brackets in strings
  let inString = false;
  let stringChar = "";

  for (const char of input) {
    if (!inString && (char === '"' || char === "'" || char === "`")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar) {
      inString = false;
      stringChar = "";
    } else if (!inString) {
      if (pairs[char]) {
        stack.push(char);
      } else if (closing.has(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          return false;
        }
      }
    }
  }

  return stack.length === 0;
}

// Process input and execute
async function processInput(
  input: string,
  state: REPLState,
  rl: ReadlineInterface
): Promise<void> {
  // Add to history
  if (input.trim() && !state.history.includes(input)) {
    state.history.push(input);
    if (state.history.length > state.config.maxHistory) {
      state.history.shift();
    }
  }

  // Parse and execute
  const parseResult = await Effect.runPromise(tokenize(input));

  if (parseResult.length === 0) {
    return;
  }

  const commandResult = await Effect.runPromise(parse(parseResult));

  if (commandResult) {
    try {
      const execResult = await Effect.runPromise(
        executePipeline(commandResult.pipeline, state.shell.createContext())
      );
      await printResult(execResult, state.config);
    } catch (error) {
      console.error(`${colors.red}Error: ${error}${colors.reset}`);
    }
  }
}

// Print command result with formatting
async function printResult(result: CommandResult, config: REPLConfig): Promise<void> {
  const value = await collectToValue(result.stdout);

  // Print stdout
  if (value._tag !== "Null") {
    const output = formatOutput(value, config);
    console.log(output);
  }

  // Print stderr if any
  const stderrValue = await collectToValue(result.stderr);
  if (stderrValue._tag !== "Null" && stderrValue._tag !== "String" ? true : stderrValue.value !== "") {
    const stderrStr = toString(stderrValue);
    if (stderrStr.trim()) {
      console.error(`${colors.red}${stderrStr}${colors.reset}`);
    }
  }

  // Show exit code if non-zero
  if (result.exitCode !== 0) {
    console.error(`${colors.red}[Exit code: ${result.exitCode}]${colors.reset}`);
  }
}

// Format output based on type
function formatOutput(
  value: import("../types/value.types").ShellValue,
  config: REPLConfig
): string {
  if (!config.colors) {
    return toString(value);
  }

  // Format tables
  if (isTable(value)) {
    return formatTable(value);
  }

  // Format lists
  if (isList(value)) {
    const items = value.items.map(item => "  " + formatOutput(item, config));
    return `[\n${items.join(",\n")}\n]`;
  }

  // Format records
  if (isRecord(value)) {
    const fields = value.fieldNames.map(key => {
      const val = formatOutput(value.fields[key]!, config);
      return `  ${colors.yellow}${key}${colors.reset}: ${val}`;
    });
    return `{\n${fields.join(",\n")}\n}`;
  }

  // Default formatting
  switch (value._tag) {
    case "Int":
    case "Float":
      return `${colors.cyan}${toString(value)}${colors.reset}`;
    case "String":
      return `${colors.green}"${value.value}"${colors.reset}`;
    case "Bool":
      return `${colors.magenta}${value.value}${colors.reset}`;
    case "Null":
      return `${colors.dim}null${colors.reset}`;
    default:
      return toString(value);
  }
}

// Format table output
function formatTable(
  table: import("../types/value.types").TableValue
): string {
  if (table.rows.length === 0) {
    return "(empty table)";
  }

  // Calculate column widths
  const widths: number[] = table.headers.map((h, i) => {
    const headerWidth = h.length;
    const maxDataWidth = table.rows.reduce((max, row) => {
      const val = toString(row.fields[h] ?? { _tag: "String", value: "" });
      return Math.max(max, val.length);
    }, 0);
    return Math.max(headerWidth, maxDataWidth, 3);
  });

  // Build separator line
  const separator = "+" + widths.map(w => "-".repeat(w + 2)).join("+") + "+";

  // Build header
  const header = "| " + table.headers.map((h, i) =>
    `${colors.bright}${colors.yellow}${h.padEnd(widths[i]!)}${colors.reset}`
  ).join(" | ") + " |";

  // Build rows
  const rows = table.rows.map(row => {
    return "| " + table.headers.map((h, i) => {
      const val = toString(row.fields[h] ?? { _tag: "String", value: "" });
      return val.padEnd(widths[i]!);
    }).join(" | ") + " |";
  });

  return [separator, header, separator, ...rows, separator].join("\n");
}

// Tab completion
function completer(line: string, state: REPLState): [string[], string] {
  const completions: string[] = [];
  const builtins = [
    "cd", "echo", "ls", "pwd", "cat", "exit", "which",
    "where", "select", "get", "each", "sort", "sort-by",
    "group-by", "length", "count", "first", "last",
    "flatten", "unique", "reverse", "table",
    "from-json", "from-csv", "to-json", "to-csv",
  ];

  // Complete builtins
  const hits = builtins.filter(cmd => cmd.startsWith(line));
  completions.push(...hits);

  // Complete file paths
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = path.dirname(line) || ".";
    const prefix = path.basename(line);

    if (fs.existsSync(dir)) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = entries
        .filter(e => e.name.startsWith(prefix))
        .map(e => path.join(dir, e.name) + (e.isDirectory() ? "/" : ""));
      completions.push(...files);
    }
  } catch {
    // Ignore errors
  }

  return [completions, line];
}

// Start REPL
export async function startREPL(config: Partial<REPLConfig> = {}): Promise<void> {
  const rl = createREPL(config);

  console.log(`${colors.bright}wshell - A modern shell with structured data${colors.reset}`);
  console.log(`${colors.dim}Type 'exit' to quit, Ctrl+C for new prompt${colors.reset}\n`);

  rl.prompt();
}
