/**
 * Plugin System for wshell
 * Auto-discover plugins from npm/bun registry
 */
import { Effect } from "effect";
import type { ShellValue, RecordValue } from "../types/value.types";
import { record, str, list } from "../types/value.types";

// Plugin manifest type
export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  commands: string[];
  hooks?: {
    preExecute?: string;
    postExecute?: string;
    onError?: string;
  };
  config?: Record<string, unknown>;
}

// Loaded plugin
export interface LoadedPlugin {
  manifest: PluginManifest;
  module: unknown;
  loaded: boolean;
  error?: string;
}

// Plugin registry
export class PluginRegistry {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private pluginPaths: string[] = [];

  constructor() {
    this.pluginPaths = this.getDefaultPluginPaths();
  }

  // Get default plugin search paths
  private getDefaultPluginPaths(): string[] {
    const paths: string[] = [];
    
    // User plugins
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      paths.push(`${home}/.wshell/plugins`);
    }
    
    // System plugins
    paths.push("/usr/local/share/wshell/plugins");
    paths.push("/usr/share/wshell/plugins");
    
    // Node modules
    paths.push("./node_modules");
    
    return paths;
  }

  // Add plugin search path
  addPath(path: string): void {
    if (!this.pluginPaths.includes(path)) {
      this.pluginPaths.push(path);
    }
  }

  // Auto-discover plugins
  async discover(): Promise<LoadedPlugin[]> {
    const discovered: LoadedPlugin[] = [];
    
    for (const pluginPath of this.pluginPaths) {
      try {
        const plugins = await this.scanPath(pluginPath);
        discovered.push(...plugins);
      } catch {
        // Ignore errors for individual paths
      }
    }
    
    return discovered;
  }

  // Scan a specific path for plugins
  private async scanPath(pluginPath: string): Promise<LoadedPlugin[]> {
    const fs = await import("fs/promises");
    const path = await import("path");
    const discovered: LoadedPlugin[] = [];
    
    try {
      const entries = await fs.readdir(pluginPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const pluginDir = path.join(pluginPath, entry.name);
        const manifestPath = path.join(pluginDir, "wshell.plugin.json");
        const packageJsonPath = path.join(pluginDir, "package.json");
        
        try {
          // Try wshell.plugin.json first
          let manifest: PluginManifest | null = null;
          
          try {
            const manifestContent = await fs.readFile(manifestPath, "utf-8");
            manifest = JSON.parse(manifestContent) as PluginManifest;
          } catch {
            // Try package.json with wshell field
            try {
              const packageContent = await fs.readFile(packageJsonPath, "utf-8");
              const pkg = JSON.parse(packageContent);
              if (pkg.wshell) {
                manifest = {
                  name: pkg.name,
                  version: pkg.version,
                  description: pkg.description,
                  main: pkg.main || "index.js",
                  commands: pkg.wshell.commands || [],
                  hooks: pkg.wshell.hooks,
                  config: pkg.wshell.config,
                };
              }
            } catch {
              // No valid manifest found
            }
          }
          
          if (manifest) {
            const loaded = await this.loadPlugin(manifest, pluginDir);
            discovered.push(loaded);
          }
        } catch {
          // Continue to next entry
        }
      }
    } catch {
      // Path doesn't exist or can't be read
    }
    
    return discovered;
  }

  // Load a plugin from manifest
  private async loadPlugin(manifest: PluginManifest, pluginDir: string): Promise<LoadedPlugin> {
    const path = await import("path");
    const mainPath = path.join(pluginDir, manifest.main);
    
    try {
      const module = await import(mainPath);
      const loaded: LoadedPlugin = {
        manifest,
        module,
        loaded: true,
      };
      this.plugins.set(manifest.name, loaded);
      return loaded;
    } catch (error) {
      const failed: LoadedPlugin = {
        manifest,
        module: null,
        loaded: false,
        error: String(error),
      };
      this.plugins.set(manifest.name, failed);
      return failed;
    }
  }

  // Get a loaded plugin
  getPlugin(name: string): LoadedPlugin | undefined {
    return this.plugins.get(name);
  }

  // List all plugins as ShellValue
  listPlugins(): ShellValue {
    const plugins: Record<string, ShellValue> = {};
    
    for (const [name, plugin] of this.plugins) {
      plugins[name] = record({
        name: str(plugin.manifest.name),
        version: str(plugin.manifest.version),
        description: str(plugin.manifest.description),
        loaded: { _tag: "Bool", value: plugin.loaded } as const,
        commands: list(plugin.manifest.commands.map(c => str(c))),
        error: str(plugin.error || ""),
      });
    }
    
    return record(plugins);
  }

  // Unload a plugin
  unload(name: string): boolean {
    return this.plugins.delete(name);
  }

  // Clear all plugins
  clear(): void {
    this.plugins.clear();
  }
}

// Global plugin registry
let globalRegistry: PluginRegistry | null = null;

export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry();
  }
  return globalRegistry;
}

export function setPluginRegistry(registry: PluginRegistry): void {
  globalRegistry = registry;
}
