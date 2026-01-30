import type { ConfigExportOptions, ConfigImportOptions, ConfigManager, PromptConfig } from "../types/config";

const configStore = new Map<string, PromptConfig>();

export const createConfigManager = (): ConfigManager => {
	const get = <T>(key: string): T | undefined => {
		return configStore.get(key)?.value as T | undefined;
	};

	const set = <T>(key: string, value: T): void => {
		configStore.set(key, {
			key,
			value,
			timestamp: Date.now(),
		});
	};

	const deleteKey = (key: string): void => {
		configStore.delete(key);
	};

	const clear = (): void => {
		configStore.clear();
	};

	const exportConfig = (options: ConfigExportOptions = {}): string => {
		const { format = "json" } = options;
		const data = Array.from(configStore.values());

		if (format === "json") {
			return JSON.stringify(data, null, 2);
		}
		return JSON.stringify(data, null, 2);
	};

	const importConfig = (data: string, options: ConfigImportOptions = {}): void => {
		const { merge = true, overwrite = false } = options;
		const parsed = JSON.parse(data) as PromptConfig[];

		if (!merge) {
			configStore.clear();
		}

		for (const item of parsed) {
			if (overwrite || !configStore.has(item.key)) {
				configStore.set(item.key, item);
			}
		}
	};

	const save = async (path?: string): Promise<void> => {
		const fs = await import("node:fs/promises");
		const data = exportConfig({ format: "json" });
		await fs.writeFile(path ?? "./prompt-config.json", data, "utf-8");
	};

	const load = async (path?: string): Promise<void> => {
		const fs = await import("node:fs/promises");
		const data = await fs.readFile(path ?? "./prompt-config.json", "utf-8");
		importConfig(data);
	};

	return {
		get,
		set,
		delete: deleteKey,
		clear,
		export: exportConfig,
		import: importConfig,
		save,
		load,
	};
};
