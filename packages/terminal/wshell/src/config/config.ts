/**
 * Configuration Management for wshell
 * Config files in ~/.config/wshell/
 */
import { mkdir, readFile, writeFile, access } from "fs/promises";
import { dirname, join, resolve } from "path";
import { homedir } from "os";
import type { ShellValue } from "../types/value.types";
import { record, str, bool } from "../types/value.types";

// Config paths
export function getConfigDir(): string {
  const home = homedir();
  const xdgConfig = process.env.XDG_CONFIG_HOME;
  return xdgConfig ? join(xdgConfig, "wshell") : join(home, ".config", "wshell");
}

export function getConfigPath(filename: string): string {
  return join(getConfigDir(), filename);
}

// Default configuration
export interface WShellConfig {
  // Prompt settings
  prompt: {
    template: string;
    showGitStatus: boolean;
    showTimestamp: boolean;
    colors: boolean;
  };
  
  // History settings
  history: {
    maxSize: number;
    persist: boolean;
    ignoreDups: boolean;
  };
  
  // Editor settings
  editor: {
    default: string;
    multiLine: boolean;
    tabSize: number;
  };
  
  // Theme settings
  theme: {
    name: string;
    background: "dark" | "light";
  };
  
  // Plugin settings
  plugin: {
    autoLoad: boolean;
    paths: string[];
  };
  
  // Alias settings
  alias: {
    autoLoad: boolean;
    file: string;
  };
}

// Default config values
export const defaultConfig: WShellConfig = {
  prompt: {
    template: "{cwd} {git} {symbol} ",
    showGitStatus: true,
    showTimestamp: false,
    colors: true,
  },
  history: {
    maxSize: 1000,
    persist: true,
    ignoreDups: true,
  },
  editor: {
    default: process.env.EDITOR || "nano",
    multiLine: true,
    tabSize: 2,
  },
  theme: {
    name: "default",
    background: "dark",
  },
  plugin: {
    autoLoad: true,
    paths: [],
  },
  alias: {
    autoLoad: true,
    file: "aliases.json",
  },
};

// Config manager
export class ConfigManager {
  private config: WShellConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || getConfigPath("config.json");
    this.config = { ...defaultConfig };
  }

  // Load config from file
  async load(): Promise<WShellConfig> {
    try {
      await this.ensureConfigDir();
      const content = await readFile(this.configPath, "utf-8");
      const parsed = JSON.parse(content);
      this.config = this.mergeDeep(defaultConfig, parsed);
    } catch {
      // Use defaults if file doesn't exist or is invalid
      this.config = { ...defaultConfig };
    }
    return this.config;
  }

  // Save config to file
  async save(): Promise<void> {
    await this.ensureConfigDir();
    await writeFile(this.configPath, JSON.stringify(this.config, null, 2), "utf-8");
  }

  // Get current config
  get(): WShellConfig {
    return this.config;
  }

  // Set config value
  set<K extends keyof WShellConfig>(key: K, value: WShellConfig[K]): void {
    this.config[key] = value;
  }

  // Update nested config
  update(path: string, value: unknown): void {
    const keys = path.split(".");
    let current: Record<string, unknown> = this.config as Record<string, unknown>;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]!;
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]!] = value;
  }

  // Reset to defaults
  reset(): void {
    this.config = { ...defaultConfig };
  }

  // Export as ShellValue
  export(): ShellValue {
    return record({
      prompt: record({
        template: str(this.config.prompt.template),
        showGitStatus: { _tag: "Bool", value: this.config.prompt.showGitStatus } as const,
        showTimestamp: { _tag: "Bool", value: this.config.prompt.showTimestamp } as const,
        colors: { _tag: "Bool", value: this.config.prompt.colors } as const,
      }),
      history: record({
        maxSize: { _tag: "Int", value: BigInt(this.config.history.maxSize) } as const,
        persist: { _tag: "Bool", value: this.config.history.persist } as const,
        ignoreDups: { _tag: "Bool", value: this.config.history.ignoreDups } as const,
      }),
      theme: record({
        name: str(this.config.theme.name),
        background: str(this.config.theme.background),
      }),
    });
  }

  // Ensure config directory exists
  private async ensureConfigDir(): Promise<void> {
    const dir = dirname(this.configPath);
    try {
      await access(dir);
    } catch {
      await mkdir(dir, { recursive: true });
    }
  }

  // Deep merge objects
  private mergeDeep<T>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            (output as Record<string, unknown>)[key] = this.mergeDeep(
              (target as Record<string, unknown>)[key],
              source[key] as Record<string, unknown>
            );
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      }
    }
    
    return output;
  }

  private isObject(item: unknown): item is Record<string, unknown> {
    return item !== null && typeof item === "object" && !Array.isArray(item);
  }
}

// Global config manager
let globalConfigManager: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager();
  }
  return globalConfigManager;
}

export async function initConfig(): Promise<WShellConfig> {
  const manager = getConfigManager();
  return await manager.load();
}
