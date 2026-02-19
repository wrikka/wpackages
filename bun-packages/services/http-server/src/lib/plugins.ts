import type { H3App } from "../types";

export interface Plugin {
  name: string;
  install: (app: H3App) => void | Promise<void>;
  uninstall?: (app: H3App) => void | Promise<void>;
}

export interface PluginManager {
  plugins: Map<string, Plugin>;
  installed: Set<string>;

  use(plugin: Plugin): void;
  remove(name: string): void;
  list(): string[];
  install(app: H3App): Promise<void>;
}

export function createPluginManager(): PluginManager {
  const plugins = new Map<string, Plugin>();
  const installed = new Set<string>();

  return {
    plugins,
    installed,

    use(plugin: Plugin) {
      if (installed.has(plugin.name)) {
        console.warn(`Plugin ${plugin.name} is already installed`);
        return;
      }

      plugins.set(plugin.name, plugin);
      console.log(`Plugin ${plugin.name} registered`);
    },

    remove(name: string) {
      if (installed.has(name)) {
        const plugin = plugins.get(name);
        if (plugin?.uninstall) {
          // Note: This would need app reference for proper cleanup
          console.warn(`Plugin ${name} uninstall not implemented`);
        }
        plugins.delete(name);
        installed.delete(name);
        console.log(`Plugin ${name} removed`);
      }
    },

    list(): string[] {
      return Array.from(plugins.keys());
    },

    async install(app: H3App): Promise<void> {
      for (const [name, plugin] of plugins) {
        if (!installed.has(name)) {
          try {
            await plugin.install(app);
            installed.add(name);
            console.log(`Plugin ${name} installed successfully`);
          } catch (error) {
            console.error(`Failed to install plugin ${name}:`, error);
          }
        }
      }
    }
  };
}

// Built-in plugins
export const corsPlugin: Plugin = {
  name: "cors",
  install: async (_app) => {
    // CORS plugin implementation
  },
};

export const rateLimitPlugin: Plugin = {
  name: "rateLimit",
  install: async (_app) => {
    // Rate limiting plugin implementation
  },
};

export const loggingPlugin: Plugin = {
  name: "logging",
  install: async (_app) => {
    // Logging plugin implementation
  },
};
