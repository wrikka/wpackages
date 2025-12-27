import type { Logger } from "../utils/logger";

export type HotReloadService = {
	readonly onReload: (callback: () => void | Promise<void>) => void;
	readonly triggerReload: () => Promise<void>;
	readonly addWatchedFile: (filePath: string) => void;
	readonly removeWatchedFile: (filePath: string) => void;
};

export const createHotReloadService = (logger: Logger): HotReloadService => {
	const callbacks: Array<() => void | Promise<void>> = [];
	const watchedFiles = new Set<string>();

	const onReload = (callback: () => void | Promise<void>): void => {
		callbacks.push(callback);
	};

	const triggerReload = async (): Promise<void> => {
		logger.info("Triggering hot reload...");

		try {
			// Execute all callbacks
			for (const callback of callbacks) {
				try {
					await Promise.resolve(callback());
				} catch (error) {
					logger.error(
						`Error in reload callback: ${error instanceof Error ? error.message : "Unknown error"}`,
					);
				}
			}

			logger.info("Hot reload completed");
		} catch (error) {
			logger.error(
				`Failed to trigger hot reload: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
			throw error instanceof Error ? error : new Error("Unknown error");
		}
	};

	const addWatchedFile = (filePath: string): void => {
		watchedFiles.add(filePath);
		logger.debug(`Added watched file: ${filePath}`);
	};

	const removeWatchedFile = (filePath: string): void => {
		watchedFiles.delete(filePath);
		logger.debug(`Removed watched file: ${filePath}`);
	};

	return {
		onReload,
		triggerReload,
		addWatchedFile,
		removeWatchedFile,
	};
};
