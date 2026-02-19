import type { I18nContext, I18nMessages, I18nOptions, Locale } from "../types/i18n";

export const createI18nContext = (options: I18nOptions): I18nContext => {
	const { defaultLocale, locales, fallbackLocale = defaultLocale, detectLocale: _detectLocale = false } = options;

	let currentLocale = defaultLocale;

	const t = (key: string, params: Record<string, string | number> = {}): string => {
		const keys = key.split(".");
		let value: I18nMessages | string = locales[currentLocale] ?? {};

		for (const k of keys) {
			if (typeof value === "object" && k in value) {
				const nextValue = (value as Record<string, unknown>)[k];
				if (nextValue !== undefined) {
					value = nextValue as string | I18nMessages;
				} else {
					value = key;
					break;
				}
			} else {
				value = key;
				break;
			}
		}

		if (typeof value !== "string") {
			value = key;
		}

		let result = value;
		for (const [paramKey, paramValue] of Object.entries(params)) {
			result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
		}

		return result;
	};

	const setLocale = (locale: Locale): void => {
		if (locales[locale]) {
			currentLocale = locale;
		} else if (locales[fallbackLocale]) {
			currentLocale = fallbackLocale;
		}
	};

	const getLocales = (): Locale[] => {
		return Object.keys(locales);
	};

	return {
		locale: currentLocale,
		t,
		setLocale,
		getLocales,
	};
};
