import { readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

/**
 * Internationalization macro for build-time i18n.
 * Loads translation files and creates a translation function.
 *
 * @param pattern - Glob pattern for translation files
 * @param options - i18n options
 * @returns Translation function and available locales
 * @throws Error if translation files cannot be read
 *
 * @example
 * // const { t, locales } = i18n("./locales/*.json", { defaultLocale: "en" })
 * // console.log(t("welcome"))
 */
export const i18n = Bun.macro((
	_pattern: string,
	options: I18nOptions = {},
) => {
	const baseDir = resolve(import.meta.dir, "..");
	const translations: Record<string, Record<string, string>> = {};

	try {
		const files = readdirSync(baseDir);

		for (const file of files) {
			if (file.endsWith(".json")) {
				const locale = file.replace(".json", "");
				const filePath = join(baseDir, file);
				const content = readFileSync(filePath, "utf-8");
				translations[locale] = JSON.parse(content);
			}
		}

		const defaultLocale = options.defaultLocale || "en";
		const availableLocales = Object.keys(translations);

		return JSON.stringify({
			t: `function(key, locale = "${defaultLocale}") { return ${JSON.stringify(translations)}[locale]?.[key] || key }`,
			locales: availableLocales,
			defaultLocale,
		});
	} catch (error) {
		throw new Error(
			"Failed to load i18n files: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * i18n options.
 */
interface I18nOptions {
	defaultLocale?: string;
	fallbackLocale?: string;
}

/**
 * Get translation for a specific key and locale at build time.
 *
 * @param key - Translation key
 * @param locale - Locale code
 * @param pattern - Glob pattern for translation files
 * @returns Translated string or key if not found
 *
 * @example
 * // const message = t("welcome", "en", "./locales/*.json")
 */
export const t = Bun.macro((
	key: string,
	locale: string,
	_pattern: string,
) => {
	const baseDir = resolve(import.meta.dir, "..");

	try {
		const filePath = join(baseDir, `${locale}.json`);
		const content = readFileSync(filePath, "utf-8");
		const translations = JSON.parse(content);

		const value = getNestedValue(translations, key);
		return JSON.stringify(value || key);
	} catch (_error) {
		return JSON.stringify(key);
	}
});

/**
 * Get nested value from object using dot notation.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
	const keys = path.split(".");
	let value: unknown = obj;

	for (const key of keys) {
		if (value && typeof value === "object" && key in value) {
			value = (value as Record<string, unknown>)[key];
		} else {
			return path;
		}
	}

	return typeof value === "string" ? value : path;
}
