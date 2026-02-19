/**
 * Core shell service - manages shell execution environment
 */
import { Effect } from "effect";
import type { CommandContext, CommandResult } from "../types/command.types";
import type { PipelineData } from "../types/pipeline.types";
import { pipelineEmpty } from "../types/pipeline.types";

export class Shell {
  private cwd: string;
  private env: Map<string, string>;
  private abortController: AbortController;

  constructor(cwd = process.cwd(), env = process.env) {
    this.cwd = cwd;
    this.env = new Map(Object.entries(env));
    this.abortController = new AbortController();
  }

  // Get current working directory
  getCwd(): string {
    return this.cwd;
  }

  // Change directory
  cd(path: string): Effect.Effect<void, Error> {
    return Effect.try({
      try: () => {
        const resolved = this.resolvePath(path);
        // Verify path exists and is directory
        const stat = require("fs").statSync(resolved);
        if (!stat.isDirectory()) {
          throw new Error(`${path} is not a directory`);
        }
        this.cwd = resolved;
      },
      catch: (error) => new Error(`cd: ${error}`),
    });
  }

  // Get environment variable
  getEnv(name: string): string | undefined {
    return this.env.get(name);
  }

  // Set environment variable
  setEnv(name: string, value: string): void {
    this.env.set(name, value);
  }

  // Get all environment variables
  getAllEnv(): Map<string, string> {
    return new Map(this.env);
  }

  // Create command context
  createContext(stdin: PipelineData = pipelineEmpty()): CommandContext {
    return {
      cwd: this.cwd,
      env: new Map(this.env),
      stdin,
      signals: this.abortController.signal,
    };
  }

  // Resolve path relative to cwd
  resolvePath(path: string): string {
    if (require("path").isAbsolute(path)) {
      return path;
    }
    return require("path").join(this.cwd, path);
  }

  // Expand environment variables in string
  expandVars(input: string): string {
    return input.replace(/\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, braced, unbraced) => {
      const varName = braced || unbraced;
      return this.env.get(varName) ?? match;
    });
  }

  // Execute command with context
  async execute(fn: (ctx: CommandContext) => Promise<CommandResult> | CommandResult): Promise<CommandResult> {
    const context = this.createContext();
    const result = await fn(context);
    
    // Update cwd if changed during execution
    if (context.cwd !== this.cwd) {
      this.cwd = context.cwd;
    }
    
    return result;
  }

  // Abort all ongoing operations
  abort(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  // Create a child shell (fork)
  fork(): Shell {
    return new Shell(this.cwd, Object.fromEntries(this.env));
  }
}

// Global shell instance
let globalShell: Shell | null = null;

export function getGlobalShell(): Shell {
  if (!globalShell) {
    globalShell = new Shell();
  }
  return globalShell;
}

export function setGlobalShell(shell: Shell): void {
  globalShell = shell;
}
