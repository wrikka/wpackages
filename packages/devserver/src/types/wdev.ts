import type { HighlighterCoreOptions } from "shiki";
import type { UserConfig as UnoCSSUserConfig } from "unocss";
import type { Options as IconsOptions } from "unplugin-icons/types";

export type CommandOptions = {
	readonly scripts: string;
	readonly config?: boolean | string;
	readonly useDefaultConfig?: boolean;
};

export type WdevOptions<T extends object = object> = {
	readonly check?: Record<string, CommandOptions>;
	readonly deps?: CommandOptions;
	readonly format?: Record<string, CommandOptions>;
	readonly lint?: Record<string, CommandOptions>;
	readonly prepare?: Record<string, CommandOptions>;

	readonly icon?: string[] | Partial<IconsOptions>;
	readonly style?: UnoCSSUserConfig;
	readonly markdown?: boolean | Partial<HighlighterCoreOptions>;
	readonly devtools?: boolean;

	readonly render?: T;
	readonly styles?: {
		readonly unocss?: UnoCSSUserConfig;
	};
};
