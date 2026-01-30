import type { Config } from "tailwindcss";
import type { FontOptions } from "./fonts";
import type { CssVariableOptions } from "./css-variables";
import type { ThemePresetOptions } from "./theme-presets";
import type { CssOptimizerOptions } from "../services/generator/css-optimizer";

// A custom rule can be a RegExp and a function that returns the CSS, or just the CSS string.
export type RuleHandler = (match: RegExpExecArray) => string | Record<string, string>;
export type StylingRule = [RegExp, RuleHandler | string];

export interface UserOptions {
	/**
	 * The base preset to use.
	 * @default 'wind4'
	 */
	preset?: "wind4" | "react" | "vue" | "svelte";

	/**
	 * Enable icon sets from Iconify.
	 * Provide the prefix of the icon set.
	 * @example ['mdi', 'fa-solid']
	 */
	icons?: string[];

	/**
	 * Define custom fonts.
	 */
	fonts?: FontOptions[];

	/**
	 * Backward compatible field name.
	 */
	font?: any[];

	/**
	 * Optional content paths/globs for scanning classes.
	 */
	content?: string[];

	/**
	 * Root directory (cwd) for content scanning.
	 */
	root?: string;

	cache?: {
		enabled?: boolean;
		dir?: string;
	};

	minify?: boolean;

	stylingPlugins?: Array<{
		transformClasses?: (
			classes: ReadonlySet<string>,
			options: Readonly<UserOptions>,
		) => Promise<Set<string>> | Set<string>;
		transformCss?: (css: string, options: Readonly<UserOptions>) => Promise<string> | string;
	}>;

	/**
	 * Enable different modes.
	 * @default ['class']
	 */
	mode?: ("class" | "attributify")[];

	/**
	 * Strategy for dark mode.
	 * @default 'media'
	 */
	darkMode?: "class" | "media" | false;

	/**
	 * Extend or override the default theme.
	 */
	theme?: Config["theme"];

	/**
	 * Define custom utility rules.
	 */
	rules?: StylingRule[];

	/**
	 * Define shortcuts for commonly used utilities.
	 * @example { 'btn': 'p-2 rounded bg-blue-500 text-white' }
	 */
	shortcuts?: Record<string, string>;

	/**
	 * Add custom plugins.
	 */
	plugins?: NonNullable<Config["plugins"]>;

	/**
	 * Define CSS variables.
	 */
	cssVariables?: CssVariableOptions;

	/**
	 * Load theme presets.
	 */
	themePreset?: ThemePresetOptions;

	/**
	 * CSS optimization options.
	 */
	optimizer?: CssOptimizerOptions;
}
