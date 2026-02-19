import type { ServerConfig } from "./server";

export type { ServerConfig } from "./server";

export interface BuildConfig {
	outDir: string;
	assetsDir: string;
	minify?: boolean | "terser" | "esbuild";
	sourcemap?: boolean | "inline" | "hidden";
	manifest?: boolean;
	ssrManifest?: boolean;
	ssr?: boolean;
	emptyOutDir?: boolean;
}

export interface RolldownConfigOutput {
	format?: "esm" | "cjs" | "iife";
	dir?: string;
	file?: string;
}

export interface RolldownConfig {
	input?: string | string[] | Record<string, string>;
	output?: RolldownConfigOutput;
	treeshake?: boolean;
	plugins?: unknown[];
}

export interface VitextPlugin {
	name: string;
	enforce?: "pre" | "post";
	apply?: "build" | "serve" | "all";
	rolldown?: {
		plugins?: unknown[];
	};
}

export interface VitextConfig {
	server: ServerConfig;
	root: string;
	base: string;
	build: BuildConfig;
	define?: Record<string, unknown>;
	mode?: "development" | "production" | "test" | (string & {});
	plugins: unknown[];
	rolldown: RolldownConfig;
}
