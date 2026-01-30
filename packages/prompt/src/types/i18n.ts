export type Locale = string;

export interface I18nMessages {
	[key: string]: string | I18nMessages;
}

export interface I18nOptions {
	defaultLocale: Locale;
	locales: Record<Locale, I18nMessages>;
	fallbackLocale?: Locale;
	detectLocale?: boolean;
}

export interface I18nContext {
	locale: Locale;
	t: (key: string, params?: Record<string, string | number>) => string;
	setLocale: (locale: Locale) => void;
	getLocales: () => Locale[];
}
