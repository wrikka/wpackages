// This file is used to declare global types for Tauri.
export {};

declare global {
	interface Window {
		__TAURI__?: {
			invoke: (cmd: string, args?: unknown) => Promise<any>;
			event: {
				listen: <T>(
					event: string,
					handler: (event: { payload: T }) => void,
				) => Promise<() => void>;
				emit: (event: string, payload?: unknown) => Promise<void>;
			};
		};
	}
}
