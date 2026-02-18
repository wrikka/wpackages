/**
 * Tab Completion System for wshell
 * Smart completions for commands, files, env vars, and history
 */
import type { ShellValue } from "../types/value.types";
import { record, str, list } from "../types/value.types";

// Completion item type
export interface CompletionItem {
  value: string;
  display?: string;
  description?: string;
  category: "command" | "file" | "directory" | "env" | "history" | "flag";
}

// Completion context
export interface CompletionContext {
  input: string;
  cursorPosition: number;
  cwd: string;
  env: Map<string, string>;
}

// Completion engine
export class CompletionEngine {
  private commands: Set<string> = new Set();
  private flags: Map<string, string[]> = new Map();

  constructor() {
    this.initializeBuiltins();
  }

  // Initialize built-in completions
  private initializeBuiltins(): void {
    const builtins = [
      "cd", "ls", "pwd", "echo", "cat", "exit", "which",
      "where", "select", "get", "each", "sort", "sort-by",
      "group-by", "length", "count", "first", "last",
      "flatten", "unique", "reverse", "table",
      "from-json", "from-csv", "to-json", "to-csv",
    ];
    builtins.forEach(cmd => this.commands.add(cmd));
  }

  // Register command for completion
  registerCommand(command: string, flags?: string[]): void {
    this.commands.add(command);
    if (flags) {
      this.flags.set(command, flags);
    }
  }

  // Get completions for input
  async getCompletions(context: CompletionContext): Promise<CompletionItem[]> {
    const { input, cursorPosition, cwd, env } = context;
    
    // Determine what we're completing
    const beforeCursor = input.slice(0, cursorPosition);
    const words = beforeCursor.trim().split(/\s+/);
    const currentWord = words[words.length - 1] || "";
    
    // First word = command completion
    if (words.length === 1 && !beforeCursor.endsWith(" ")) {
      return this.completeCommand(currentWord);
    }
    
    // Check if completing a flag
    if (currentWord.startsWith("-")) {
      const command = words[0];
      if (command) {
        return this.completeFlag(command, currentWord);
      }
    }
    
    // Check if completing environment variable
    if (currentWord.startsWith("$")) {
      return this.completeEnvVar(currentWord.slice(1), env);
    }
    
    // File/directory completion
    return await this.completeFile(currentWord, cwd);
  }

  // Complete command names
  private completeCommand(prefix: string): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const lowerPrefix = prefix.toLowerCase();
    
    for (const cmd of this.commands) {
      if (cmd.toLowerCase().startsWith(lowerPrefix)) {
        completions.push({
          value: cmd,
          category: "command",
        });
      }
    }
    
    return completions.sort((a, b) => a.value.localeCompare(b.value));
  }

  // Complete flags for a command
  private completeFlag(command: string, prefix: string): CompletionItem[] {
    const flags = this.flags.get(command);
    if (!flags) return [];
    
    return flags
      .filter(f => f.startsWith(prefix))
      .map(f => ({
        value: f,
        category: "flag" as const,
      }));
  }

  // Complete environment variables
  private completeEnvVar(prefix: string, env: Map<string, string>): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const lowerPrefix = prefix.toLowerCase();
    
    for (const [name, value] of env) {
      if (name.toLowerCase().startsWith(lowerPrefix)) {
        completions.push({
          value: `$${name}`,
          display: `$${name}`,
          description: value.slice(0, 50),
          category: "env",
        });
      }
    }
    
    return completions;
  }

  // Complete files and directories
  private async completeFile(prefix: string, cwd: string): Promise<CompletionItem[]> {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const completions: CompletionItem[] = [];
    
    // Determine directory to search
    let searchDir = cwd;
    let filePrefix = prefix;
    
    if (prefix.includes("/") || prefix.includes("\\")) {
      const dirPart = path.dirname(prefix);
      if (dirPart !== ".") {
        searchDir = path.resolve(cwd, dirPart);
      }
      filePrefix = path.basename(prefix);
    }
    
    try {
      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const name = entry.name;
        if (name.toLowerCase().startsWith(filePrefix.toLowerCase())) {
          const isDir = entry.isDirectory();
          const value = prefix.includes("/") || prefix.includes("\\")
            ? path.join(path.dirname(prefix), name) + (isDir ? "/" : "")
            : name + (isDir ? "/" : "");
          
          completions.push({
            value,
            display: name,
            category: isDir ? "directory" : "file",
          });
        }
      }
    } catch {
      // Ignore errors
    }
    
    return completions.sort((a, b) => {
      // Directories first
      if (a.category === "directory" && b.category !== "directory") return -1;
      if (a.category !== "directory" && b.category === "directory") return 1;
      return a.value.localeCompare(b.value);
    });
  }

  // Export completions as ShellValue
  exportCompletions(completions: CompletionItem[]): ShellValue {
    return list(
      completions.map(c => record({
        value: str(c.value),
        display: str(c.display || c.value),
        description: str(c.description || ""),
        category: str(c.category),
      }))
    );
  }
}

// Global completion engine
let globalCompletionEngine: CompletionEngine | null = null;

export function getCompletionEngine(): CompletionEngine {
  if (!globalCompletionEngine) {
    globalCompletionEngine = new CompletionEngine();
  }
  return globalCompletionEngine;
}

export function setCompletionEngine(engine: CompletionEngine): void {
  globalCompletionEngine = engine;
}
