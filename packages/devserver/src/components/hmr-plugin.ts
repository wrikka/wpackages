// HMR Plugin for @wpackages/devserver (no Vite coupling)
type ReloadCallback = () => void | Promise<void>;

export interface HmrPlugin {
	readonly name: string;
	onReload: (callback: ReloadCallback) => void;
	readonly trigger: () => void;
	dispose?: () => void;
}

export const createHmrPlugin = (): HmrPlugin => {
	const callbacks: ReloadCallback[] = [];

	return {
		name: "wdev-hmr",
		onReload: (callback: ReloadCallback) => {
			callbacks.push(callback);
		},
		// Optional: expose trigger for external use
		trigger() {
			for (const cb of callbacks) {
				Promise.resolve(cb()).catch(() => {
					// ignore errors in callbacks
				});
			}
		},
	};
};
