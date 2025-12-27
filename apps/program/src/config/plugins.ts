/**
 * Plugin Manager
 *
 * จัดการ plugins สำหรับ Effect system
 */

import type { EffectConfig, EffectPlugin, PluginContext, PluginHooks } from "./types";

/**
 * Plugin Manager
 */
export class EffectPluginManager {
	private plugins: Map<string, EffectPlugin> = new Map();
	private hooks: Map<
		keyof PluginHooks,
		Array<NonNullable<PluginHooks[keyof PluginHooks]>>
	> = new Map();

	constructor(private readonly config: EffectConfig) {}

	/**
	 * Register a plugin
	 */
	async register(plugin: EffectPlugin): Promise<void> {
		if (this.plugins.has(plugin.name)) {
			throw new Error(`Plugin ${plugin.name} is already registered`);
		}

		this.plugins.set(plugin.name, plugin);

		// Register hooks
		if (plugin.hooks) {
			for (const [hookName, handler] of Object.entries(plugin.hooks)) {
				if (handler) {
					this.registerHook(hookName as keyof PluginHooks, handler as any);
				}
			}
		}

		// Run setup
		if (plugin.setup) {
			const context: PluginContext = {
				config: this.config,
				registerHook: (name, handler) => this.registerHook(name, handler),
			};
			await plugin.setup(context);
		}
	}

	/**
	 * Register multiple plugins
	 */
	async registerAll(plugins: ReadonlyArray<EffectPlugin>): Promise<void> {
		for (const plugin of plugins) {
			await this.register(plugin);
		}
	}

	/**
	 * Get registered plugin
	 */
	getPlugin(name: string): EffectPlugin | undefined {
		return this.plugins.get(name);
	}

	/**
	 * Get all registered plugins
	 */
	getPlugins(): ReadonlyArray<EffectPlugin> {
		return Array.from(this.plugins.values());
	}

	/**
	 * Register hook
	 */
	private registerHook<K extends keyof PluginHooks>(
		name: K,
		handler: NonNullable<PluginHooks[K]>,
	): void {
		const handlers = this.hooks.get(name) ?? [];
		handlers.push(handler as any);
		this.hooks.set(name, handlers);
	}

	/**
	 * Run hook
	 */
	async runHook<K extends keyof PluginHooks>(
		name: K,
		...args: Parameters<NonNullable<PluginHooks[K]>>
	): Promise<void> {
		const handlers = this.hooks.get(name) ?? [];
		for (const handler of handlers) {
			await (handler as any)(...args);
		}
	}

	/**
	 * Unregister plugin
	 */
	unregister(name: string): boolean {
		return this.plugins.delete(name);
	}

	/**
	 * Clear all plugins
	 */
	clear(): void {
		this.plugins.clear();
		this.hooks.clear();
	}
}

/**
 * Create plugin manager
 */
export const createPluginManager = (
	config: EffectConfig,
): EffectPluginManager => {
	return new EffectPluginManager(config);
};
