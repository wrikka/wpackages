import type { Plugin, ReleaseContext, ReleaseHook, HookFn } from "../types/plugin";

/**
 * Manages the execution of plugins and their hooks within the release lifecycle.
 */
export class PipelineService {
  private hooks: Map<ReleaseHook, HookFn[]> = new Map();

  /**
   * @param plugins An array of plugins to register.
   */
  constructor(plugins: Plugin[] = []) {
    this.registerPlugins(plugins);
  }

  /**
   * Registers hooks from a list of plugins.
   * @param plugins The plugins to register.
   */
  private registerPlugins(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      for (const [hook, fn] of Object.entries(plugin.hooks)) {
        const hookName = hook as ReleaseHook;
        const functions = Array.isArray(fn) ? fn : [fn];
        const existing = this.hooks.get(hookName) || [];
        this.hooks.set(hookName, [...existing, ...functions]);
      }
    }
  }

  /**
   * Executes all registered hook functions for a given lifecycle event.
   * @param hook The lifecycle hook to execute.
   * @param context The current release context.
   */
  async executeHook(hook: ReleaseHook, context: ReleaseContext): Promise<void> {
    const fns = this.hooks.get(hook) || [];
    for (const fn of fns) {
      await Promise.resolve(fn(context));
    }
  }
}
