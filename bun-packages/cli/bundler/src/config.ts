import { lilconfig } from "lilconfig";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { presets } from "./presets";
import { validateConfig } from "./services";
import type { BunpackConfig, NapiConfig } from "./types";

async function findAndParseCargoToml(): Promise<Partial<NapiConfig> | null> {
	const searchPaths = [
		path.resolve("Cargo.toml"),
		path.resolve("native", "Cargo.toml"),
		path.resolve("rust", "Cargo.toml"),
	];

	for (const p of searchPaths) {
		try {
			await stat(p); // Check if file exists
			const content = await readFile(p, "utf-8");
			const match = content.match(/^name\s*=\s*"([^"]+)"/m);
			if (match && match[1]) {
				return {
					crateDir: path.dirname(p),
					outFile: match[1].replace(/-/g, "_"), // Cargo names use hyphens, rust identifiers use underscores
				};
			}
		} catch {
			// File not found, continue to the next path
		}
	}
	return null;
}

const DEFAULT_CONFIG: Partial<BunpackConfig> = {
	outDir: ".output",
	clean: true,
	format: ["esm"],
	target: "bun",
	sourcemap: false,
	minify: true,
	dts: true,
};

const COMPAT_DEFAULTS: Partial<BunpackConfig> = {
	outDir: "dist",
	clean: true,
	format: ["cjs", "esm"],
	target: "node",
	sourcemap: false,
	minify: true,
	dts: true,
};

async function loadConfigFromFile(configFile?: string): Promise<BunpackConfig | null> {
	const explorer = lilconfig("bunpack", {
		searchPlaces: ["bunpack.config.ts", "bunpack.config.js"],
		loaders: {
			".ts": async (filepath) => {
				const { default: config } = await import(filepath);
				return config;
			},
		},
	});

	const result = configFile
		? await explorer.load(path.resolve(configFile))
		: await explorer.search();

	if (!result) {
		return null;
	}

	return result.config.default ?? result.config;
}

export async function resolveConfig(inlineConfig: Partial<BunpackConfig> = {}): Promise<BunpackConfig> {
	const autoDetectedNativeConfig = await findAndParseCargoToml();
	const loadedConfig = await loadConfigFromFile(inlineConfig.configFile as string | undefined);

	const presetName = inlineConfig.preset ?? loadedConfig?.preset;
	const presetLoader = presetName ? presets[presetName] : undefined;
	const presetConfig = presetLoader ? await presetLoader() : {};

	const baseDefaults = inlineConfig.compat ? COMPAT_DEFAULTS : DEFAULT_CONFIG;

	const config = {
		...baseDefaults,
		...presetConfig,
		...loadedConfig,
		...inlineConfig,
	};

	// Handle deep merging for specific keys
	if (presetConfig?.bunPlugins || loadedConfig?.bunPlugins || inlineConfig.bunPlugins) {
		config.bunPlugins = [
			...(presetConfig?.bunPlugins ?? []),
			...(loadedConfig?.bunPlugins ?? []),
			...(inlineConfig.bunPlugins ?? []),
		];
	}

	// Handle deep merging for native config, with auto-detection as the base
	const userNativeConfig = {
		...presetConfig?.native,
		...loadedConfig?.native,
		...inlineConfig.native,
	};

	const userNapiConfig = {
		...presetConfig?.native?.napi,
		...loadedConfig?.native?.napi,
		...inlineConfig.native?.napi,
	};

	if (autoDetectedNativeConfig || Object.keys(userNapiConfig).length > 0) {
		config.native = {
			...userNativeConfig,
			napi: {
				...autoDetectedNativeConfig,
				...userNapiConfig,
			},
		};
	}

	if (!config.entry) {
		config.entry = ["src/index.ts"];
	}

	config.entry = Array.isArray(config.entry) ? config.entry : [config.entry];

	validateConfig(config as BunpackConfig);

	return config as BunpackConfig;
}
