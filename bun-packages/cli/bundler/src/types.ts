export type Format = "esm" | "cjs";
export type Target = "bun" | "node";
export type Preset = "library" | "app" | "cli" | "react" | "vue" | "svelte" | "rust" | "wasm";

export type BinConfig = Record<string, string>;

export interface DtsConfig {
	entry?: string;
	outFile?: string;
	mergeNative?: boolean;
}

export interface NapiConfig {
	skip?: boolean;
	crateDir?: string;
	outFile?: string;
	release?: boolean;
	watch?: boolean;
	symbols?: "auto" | "all" | "none";
	platforms?: "current" | "all";
	features?: string[];
	env?: Record<string, string>;
}

export interface WasmConfig {
	skip?: boolean;
	crateDir?: string;
	outDir?: string;
	outName?: string;
	target?: "bundler" | "nodejs" | "web" | "no-install";
	release?: boolean;
	scope?: string;
}

export interface BuildContext {
	resolvedConfig: BunpackConfig;
}

export type BuildStep =
	| "config"
	| "clean"
	| "native"
	| "wasm"
	| "ts"
	| "dts"
	| "bin"
	| "exports";

export interface Hooks {
	configResolved?: (config: BunpackConfig) => void | Promise<void>;
	beforeBuild?: (ctx: BuildContext) => void | Promise<void>;
	afterBuild?: (ctx: BuildContext) => void | Promise<void>;
	beforeStep?: (step: BuildStep, ctx: BuildContext) => void | Promise<void>;
	afterStep?: (step: BuildStep, ctx: BuildContext) => void | Promise<void>;
	onError?: (step: BuildStep, error: unknown, ctx: BuildContext) => void | Promise<void>;
}

export interface CleanPolicy {
	enabled?: boolean;
	steps?: BuildStep[];
	formats?: Format[];
}

export interface CacheConfig {
	enabled?: boolean;
	dir?: string;
}

export interface Plugin {
	name: string;
	setup(ctx: BuildContext): void | Promise<void>;
}

export function defineConfig(config: BunpackConfig): BunpackConfig {
	return config;
}

export interface BunpackConfig {
	/* core */
	entry?: string | string[];
	outDir?: string;
	name?: string;
	format?: Format | Format[];
	target?: Target | Target[];
	clean?: boolean;
	sourcemap?: boolean | "inline" | "external";
	minify?: boolean;
	dts?: boolean | DtsConfig;
	bin?: BinConfig;
	bunPlugins?: any[];
	preset?: Preset;
	watch?: boolean;
	external?: string[];
	env?: Record<string, string>;
	define?: Record<string, string>;
	hooks?: Hooks;
	cleanPolicy?: CleanPolicy;
	cache?: CacheConfig;
	compat?: boolean;
	native?: {
		napi?: NapiConfig;
		wasm?: WasmConfig;
	};
	/* plugins */
	plugins?: Plugin[];
	// Internal use for CLI
	configFile?: string;
}
