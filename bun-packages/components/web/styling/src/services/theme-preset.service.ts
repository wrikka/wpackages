import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ThemePreset, ThemePresetOptions } from "../types/theme-presets";

const BUILTIN_PRESETS: Record<string, ThemePreset> = {
	"wind4": {
		name: "Wind4",
		version: "1.0.0",
		description: "Default Tailwind CSS v4 preset",
		theme: {},
	},
	"react": {
		name: "React",
		version: "1.0.0",
		description: "React-optimized preset",
		theme: {},
		shortcuts: {
			"btn-primary": "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600",
			"btn-secondary": "px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600",
			"card": "p-4 border rounded shadow",
		},
	},
	"vue": {
		name: "Vue",
		version: "1.0.0",
		description: "Vue-optimized preset",
		theme: {},
		shortcuts: {
			"btn-primary": "px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600",
			"btn-secondary": "px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600",
			"card": "p-4 border rounded shadow",
		},
	},
	"svelte": {
		name: "Svelte",
		version: "1.0.0",
		description: "Svelte-optimized preset",
		theme: {},
		shortcuts: {
			"btn-primary": "px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600",
			"btn-secondary": "px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600",
			"card": "p-4 border rounded shadow",
		},
	},
};

export async function loadThemePreset(
	presetName: string,
	options: ThemePresetOptions = {},
): Promise<ThemePreset | null> {
	if (BUILTIN_PRESETS[presetName]) {
		return BUILTIN_PRESETS[presetName];
	}

	if (options.presetPath) {
		try {
			const presetPath = join(options.presetPath, `${presetName}.json`);
			const presetContent = await readFile(presetPath, "utf-8");
			return JSON.parse(presetContent) as ThemePreset;
		} catch {
			console.warn(`[styling] Failed to load preset "${presetName}" from "${options.presetPath}"`);
		}
	}

	if (options.remotePresets) {
		try {
			const response = await fetch(`https://presets.styling.dev/${presetName}.json`);
			if (response.ok) {
				return (await response.json()) as ThemePreset;
			}
		} catch {
			console.warn(`[styling] Failed to load remote preset "${presetName}"`);
		}
	}

	return null;
}

export async function loadThemePresets(
	options: ThemePresetOptions = {},
): Promise<ThemePreset[]> {
	const presets: ThemePreset[] = [];

	const presetNames = options.presets ?? (options.preset ? [options.preset] : []);

	for (const presetName of presetNames) {
		const preset = await loadThemePreset(presetName, options);
		if (preset) {
			presets.push(preset);
		}
	}

	return presets;
}

export function mergeThemePresets(presets: ThemePreset[]): Partial<ThemePreset> {
	const merged: Partial<ThemePreset> = {
		theme: {},
		plugins: [],
		cssVariables: {},
		shortcuts: {},
		rules: [],
	};

	for (const preset of presets) {
		if (preset.theme) {
			merged.theme = { ...merged.theme, ...preset.theme };
		}

		if (preset.plugins) {
			merged.plugins = [...(merged.plugins ?? []), ...preset.plugins];
		}

		if (preset.cssVariables) {
			merged.cssVariables = { ...merged.cssVariables, ...preset.cssVariables };
		}

		if (preset.shortcuts) {
			merged.shortcuts = { ...merged.shortcuts, ...preset.shortcuts };
		}

		if (preset.rules) {
			merged.rules = [...(merged.rules ?? []), ...preset.rules];
		}
	}

	return merged;
}

export function getAvailablePresets(): string[] {
	return Object.keys(BUILTIN_PRESETS);
}
