import type { TestReport, TestResult } from "../types";

export interface WTestPlugin {
	name: string;
	version: string;
	apply(context: PluginContext): void | Promise<void>;
}

export interface PluginContext {
	// Hooks
	beforeAll?(fn: BeforeAllFn): void;
	afterAll?(fn: AfterAllFn): void;
	beforeEach?(fn: BeforeEachFn): void;
	afterEach?(fn: AfterEachFn): void;

	// Reporters
	addReporter(reporter: Reporter): void;
	removeReporter(name: string): void;

	// Matchers
	addMatcher(name: string, matcher: Matcher): void;

	// Transformers
	addTransformer(transformer: Transformer): void;

	// Config
	getConfig(): PluginConfig;
}

export interface PluginConfig {
	coverage: boolean;
	watch: boolean;
	timeout: number;
	retries: number;
	testNamePattern?: string;
	shard?: string;
}

export type BeforeAllFn = () => void | Promise<void>;
export type AfterAllFn = () => void | Promise<void>;
export type BeforeEachFn = () => void | Promise<void>;
export type AfterEachFn = () => void | Promise<void>;

export interface Reporter {
	name: string;
	onTestStart?(result: TestResult): void | Promise<void>;
	onTestEnd?(result: TestResult): void | Promise<void>;
	onSuiteStart?(name: string): void | Promise<void>;
	onSuiteEnd?(name: string): void | Promise<void>;
	onRunStart?(): void | Promise<void>;
	onRunEnd?(report: TestReport): void | Promise<void>;
}

export interface Matcher {
	name: string;
	handler(actual: unknown, expected: unknown, options?: MatcherOptions): boolean | Promise<boolean>;
	factory?(actual: unknown): MatcherFactory;
}

export interface MatcherFactory {
	[customMatcher: string]: (expected: unknown, options?: MatcherOptions) => void;
}

export interface MatcherOptions {
	message?: string;
	// Additional options can be added here
}

export interface Transformer {
	name: string;
	transform(code: string, filename: string): string | Promise<string>;
}

class PluginManager {
	private plugins: Map<string, WTestPlugin> = new Map();
	private reporters: Map<string, Reporter> = new Map();
	private matchers: Map<string, Matcher> = new Map();
	private transformers: Map<string, Transformer> = new Map();
	private hooks: {
		beforeAll: BeforeAllFn[];
		afterAll: AfterAllFn[];
		beforeEach: BeforeEachFn[];
		afterEach: AfterEachFn[];
	} = {
		beforeAll: [],
		afterAll: [],
		beforeEach: [],
		afterEach: [],
	};

	async loadPlugin(plugin: WTestPlugin): Promise<void> {
		if (this.plugins.has(plugin.name)) {
			throw new Error(`Plugin ${plugin.name} is already loaded`);
		}

		const context: PluginContext = {
			beforeAll: (fn: BeforeAllFn) => this.hooks.beforeAll.push(fn),
			afterAll: (fn: AfterAllFn) => this.hooks.afterAll.push(fn),
			beforeEach: (fn: BeforeEachFn) => this.hooks.beforeEach.push(fn),
			afterEach: (fn: AfterEachFn) => this.hooks.afterEach.push(fn),
			addReporter: (reporter: Reporter) => this.reporters.set(reporter.name, reporter),
			removeReporter: (name: string) => this.reporters.delete(name),
			addMatcher: (name: string, matcher: Matcher) => this.matchers.set(name, matcher),
			addTransformer: (transformer: Transformer) => this.transformers.set(transformer.name, transformer),
			getConfig: () => ({
				coverage: false,
				watch: false,
				timeout: 5000,
				retries: 0,
			}),
		};

		await plugin.apply(context);
		this.plugins.set(plugin.name, plugin);
	}

	unloadPlugin(name: string): void {
		const plugin = this.plugins.get(name);
		if (!plugin) return;

		// Remove reporters, matchers, and transformers added by this plugin
		// Note: We would need to track which plugin added which components
		// For now, we'll remove all components (simplification)
		this.plugins.delete(name);
	}

	getHooks() {
		return this.hooks;
	}

	getReporters(): Reporter[] {
		return Array.from(this.reporters.values());
	}

	getMatchers(): Matcher[] {
		return Array.from(this.matchers.values());
	}

	getTransformers(): Transformer[] {
		return Array.from(this.transformers.values());
	}

	async executeHook<T extends keyof typeof this.hooks>(
		hookName: T,
		...args: Parameters<NonNullable<typeof this.hooks[T]>[number]>
	): Promise<void> {
		const hooks = this.hooks[hookName];
		for (const hook of hooks) {
			await hook(...args);
		}
	}
}

export const pluginManager = new PluginManager();
export { PluginManager };
