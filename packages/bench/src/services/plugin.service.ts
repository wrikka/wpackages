import type { BenchmarkPlugin } from "../types/plugin.types";
import { ConsoleService } from "./console.service";

export class PluginManager {
	private plugins: BenchmarkPlugin[] = [];

	private validatePlugin(plugin: any): plugin is BenchmarkPlugin {
		return typeof plugin === "object" && plugin !== null && typeof plugin.name === "string";
	}

	async loadPlugins(pluginPaths: string[]): Promise<void> {
		for (const path of pluginPaths) {
			try {
				const pluginModule = await import(path);
				const plugin = pluginModule.default as unknown;

				if (this.validatePlugin(plugin)) {
					this.plugins.push(plugin);
					if (!process.argv.includes("--silent")) {
						await ConsoleService.info(`✓ Plugin loaded: ${plugin.name} v${plugin.version}`);
					}
				} else {
					await ConsoleService.warn(`✗ Plugin at ${path} is not a valid benchmark plugin.`);
				}
			} catch (error) {
				if (error instanceof Error) {
					await ConsoleService.error(`Error loading plugin from ${path}: ${error.message}`);
				}
			}
		}
	}

	async runHook<K extends keyof BenchmarkPlugin>(
		hookName: K,
		...args: Parameters<NonNullable<BenchmarkPlugin[K]>>
	): Promise<void> {
		for (const plugin of this.plugins) {
			const hook = plugin[hookName];
			if (typeof hook === "function") {
				try {
					// @ts-expect-error - TS can't infer the type of `args` here correctly
					await hook(...args);
				} catch (error) {
					if (error instanceof Error) {
						await ConsoleService.error(`Error in plugin '${plugin.name}' during hook '${hookName}': ${error.message}`);
					}
				}
			}
		}
	}
}
