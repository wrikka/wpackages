/**
 * Aliases and Functions for wshell
 * User-defined command aliases and shell functions
 */
import type { ShellValue } from "../types/value.types";
import { record, str, list } from "../types/value.types";

// Alias definition
export interface Alias {
  name: string;
  command: string;
  description?: string;
}

// Function definition
export interface ShellFunction {
  name: string;
  params: string[];
  body: string;
  description?: string;
}

// Alias and Function manager
export class AliasManager {
  private aliases: Map<string, Alias> = new Map();
  private functions: Map<string, ShellFunction> = new Map();

  // Add an alias
  addAlias(name: string, command: string, description?: string): void {
    this.aliases.set(name, { name, command, description });
  }

  // Remove an alias
  removeAlias(name: string): boolean {
    return this.aliases.delete(name);
  }

  // Get an alias
  getAlias(name: string): Alias | undefined {
    return this.aliases.get(name);
  }

  // Expand alias in command
  expandAlias(input: string): string {
    const parts = input.trim().split(/\s+/);
    const firstWord = parts[0];
    
    if (!firstWord) return input;
    
    const alias = this.aliases.get(firstWord);
    if (!alias) return input;
    
    // Replace first word with alias command, keep the rest
    const rest = parts.slice(1).join(" ");
    return rest ? `${alias.command} ${rest}` : alias.command;
  }

  // List all aliases
  listAliases(): Alias[] {
    return Array.from(this.aliases.values());
  }

  // Add a function
  addFunction(name: string, params: string[], body: string, description?: string): void {
    this.functions.set(name, { name, params, body, description });
  }

  // Remove a function
  removeFunction(name: string): boolean {
    return this.functions.delete(name);
  }

  // Get a function
  getFunction(name: string): ShellFunction | undefined {
    return this.functions.get(name);
  }

  // List all functions
  listFunctions(): ShellFunction[] {
    return Array.from(this.functions.values());
  }

  // Export aliases as ShellValue
  exportAliases(): ShellValue {
    const aliases: Record<string, ShellValue> = {};
    
    for (const [name, alias] of this.aliases) {
      aliases[name] = record({
        name: str(alias.name),
        command: str(alias.command),
        description: str(alias.description || ""),
      });
    }
    
    return record(aliases);
  }

  // Export functions as ShellValue
  exportFunctions(): ShellValue {
    const functions: Record<string, ShellValue> = {};
    
    for (const [name, fn] of this.functions) {
      functions[name] = record({
        name: str(fn.name),
        params: list(fn.params.map(p => str(p))),
        body: str(fn.body),
        description: str(fn.description || ""),
      });
    }
    
    return record(functions);
  }

  // Save to JSON
  toJSON(): { aliases: Alias[]; functions: ShellFunction[] } {
    return {
      aliases: this.listAliases(),
      functions: this.listFunctions(),
    };
  }

  // Load from JSON
  fromJSON(data: { aliases?: Alias[]; functions?: ShellFunction[] }): void {
    this.aliases.clear();
    this.functions.clear();
    
    if (data.aliases) {
      for (const alias of data.aliases) {
        this.aliases.set(alias.name, alias);
      }
    }
    
    if (data.functions) {
      for (const fn of data.functions) {
        this.functions.set(fn.name, fn);
      }
    }
  }
}

// Global alias manager
let globalAliasManager: AliasManager | null = null;

export function getAliasManager(): AliasManager {
  if (!globalAliasManager) {
    globalAliasManager = new AliasManager();
  }
  return globalAliasManager;
}

export function setAliasManager(manager: AliasManager): void {
  globalAliasManager = manager;
}
