// Vite-compatible plugin system for Bun
export type { WdevOptions } from "./types";

export const createApp = <T extends object>(options: WdevOptions<T> = {}): any[] => {
	const plugins: any[] = [
		// Plugin implementations will be added here
	];

	return plugins.filter((p): p is any => p != null);
};

const wvite = <T extends object>(options: WdevOptions<T> = {}): any[] => {
	return createApp(options);
};

export default wvite;
