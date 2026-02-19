export interface PromptConfig {
	key: string;
	value: unknown;
	timestamp: number;
}

export interface ConfigExportOptions {
	includeDefaults?: boolean;
	includeHistory?: boolean;
	format?: "json" | "yaml";
}

export interface ConfigImportOptions {
	merge?: boolean;
	validate?: boolean;
	overwrite?: boolean;
}

export interface ConfigManager {
	get: <T>(key: string) => T | undefined;
	set: <T>(key: string, value: T) => void;
	delete: (key: string) => void;
	clear: () => void;
	export: (options?: ConfigExportOptions) => string;
	import: (data: string, options?: ConfigImportOptions) => void;
	save: (path?: string) => Promise<void>;
	load: (path?: string) => Promise<void>;
}
