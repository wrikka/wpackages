export const isBrowser = typeof window !== "undefined"
	&& typeof window.history !== "undefined"
	&& typeof window.location !== "undefined";
