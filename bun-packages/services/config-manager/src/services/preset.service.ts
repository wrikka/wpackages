import type { ConfigPreset } from "../types/config";

export type PresetManager<T> = {
	register: (preset: ConfigPreset<T>) => void;
	get: (name: string) => ConfigPreset<T> | undefined;
	getAll: () => readonly ConfigPreset<T>[];
	has: (name: string) => boolean;
	remove: (name: string) => boolean;
	apply: (name: string, baseConfig?: Partial<T>) => Partial<T> | undefined;
	merge: (...names: readonly string[]) => Partial<T>;
};

export const createPreset = <T>(
	name: string,
	config: Partial<T>,
	description?: string,
): ConfigPreset<T> => {
	if (description !== undefined) {
		return { config, description, name };
	}
	return { config, name };
};

export const createPresetManager = <T>(): PresetManager<T> => {
	const presets = new Map<string, ConfigPreset<T>>();

	return {
		apply: (
			name: string,
			baseConfig: Partial<T> = {},
		): Partial<T> | undefined => {
			const preset = presets.get(name);
			if (!preset) return undefined;

			return {
				...baseConfig,
				...preset.config,
			};
		},

		get: (name: string): ConfigPreset<T> | undefined => presets.get(name),

		getAll: (): readonly ConfigPreset<T>[] => Array.from(presets.values()),

		has: (name: string): boolean => presets.has(name),

		merge: (...names: readonly string[]): Partial<T> => {
			let result: Partial<T> = {};

			for (const name of names) {
				const preset = presets.get(name);
				if (preset) {
					result = {
						...result,
						...preset.config,
					};
				}
			}

			return result;
		},
		register: (preset: ConfigPreset<T>) => {
			presets.set(preset.name, preset);
		},

		remove: (name: string): boolean => presets.delete(name),
	};
};
