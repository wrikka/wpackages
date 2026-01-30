/**
 * Web to App Types
 * เหมือน Pake - แปลง website เป็น desktop app
 */

/**
 * App configuration
 */
export interface AppConfig {
	/**
	 * App name
	 */
	name: string;

	/**
	 * Website URL
	 */
	url: string;

	/**
	 * App identifier (reverse domain notation)
	 */
	identifier?: string | undefined;

	/**
	 * App version
	 */
	version?: string | undefined;

	/**
	 * Window width
	 */
	width?: number | undefined;

	/**
	 * Window height
	 */
	height?: number | undefined;

	/**
	 * Resizable
	 */
	resizable?: boolean | undefined;

	/**
	 * Fullscreen
	 */
	fullscreen?: boolean | undefined;

	/**
	 * Transparent window
	 */
	transparent?: boolean | undefined;

	/**
	 * Hide menu bar
	 */
	hideMenuBar?: boolean | undefined;

	/**
	 * Icon path
	 */
	icon?: string | undefined;

	/**
	 * User agent
	 */
	userAgent?: string | undefined;

	/**
	 * Inject CSS
	 */
	injectCss?: string | undefined;

	/**
	 * Inject JS
	 */
	injectJs?: string | undefined;

	/**
	 * Output directory
	 */
	outputDir?: string | undefined;
}

/**
 * Build options
 */
export interface BuildOptions {
	/**
	 * Target platform
	 */
	target?: "windows" | "macos" | "linux" | "all";

	/**
	 * Debug mode
	 */
	debug?: boolean;

	/**
	 * Bundle identifier
	 */
	bundleIdentifier?: string;

	/**
	 * Code signing
	 */
	sign?: boolean;

	/**
	 * Notarize (macOS)
	 */
	notarize?: boolean;
}

/**
 * Template type
 */
export type TemplateType = "minimal" | "standard" | "full";

/**
 * Default configuration
 */
export const defaultConfig: Required<Omit<AppConfig, "name" | "url" | "icon" | "injectCss" | "injectJs">> = {
	identifier: "com.example.app",
	version: "1.0.0",
	width: 1200,
	height: 800,
	resizable: true,
	fullscreen: false,
	transparent: false,
	hideMenuBar: false,
	userAgent: "",
	outputDir: "./dist",
};
