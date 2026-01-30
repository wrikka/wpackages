export type WatchOptions<T = unknown> = {
	interval?: number;
	onChange: (config: T) => Promise<void>;
	onError?: (error: Error) => void;
};

export type ConfigWatcher = {
	stop: () => void;
	close?: () => void;
};

export const watchConfigFile = <T>(
	filePath: string,
	options: WatchOptions<T>,
): ConfigWatcher => {
	const { interval = 1000, onChange, onError } = options;
	let lastContent: string | undefined;

	const checkFile = async () => {
		try {
			const fs = await import("node:fs/promises");
			const content = await fs.readFile(filePath, "utf-8");

			if (content !== lastContent) {
				lastContent = content;
				try {
					const config = JSON.parse(content) as T;
					await onChange(config);
				} catch (error) {
					if (onError) {
						onError(error as Error);
					}
				}
			}
		} catch (error) {
			if (onError) {
				onError(error as Error);
			}
		}
	};

	const intervalId = setInterval(checkFile, interval);
	checkFile();

	return {
		stop: () => clearInterval(intervalId),
		close: () => clearInterval(intervalId),
	};
};

export const watchMultipleFiles = <T>(
	paths: readonly string[],
	options: WatchOptions<T>,
): ConfigWatcher => {
	const watchers = paths.map((path) => watchConfigFile<T>(path, options));

	return {
		stop: () => {
			for (const watcher of watchers) {
				watcher.stop();
			}
		},
		close: () => {
			for (const watcher of watchers) {
				watcher.stop();
			}
		},
	};
};

export const pollRemoteConfig = <T>(
	fetchConfig: () => Promise<T>,
	options: WatchOptions<T>,
): ConfigWatcher => {
	const { interval = 60000, onChange, onError } = options;
	let lastConfig: T | undefined;

	const poll = async () => {
		try {
			const config = await fetchConfig();
			const configStr = JSON.stringify(config);
			const lastStr = lastConfig ? JSON.stringify(lastConfig) : undefined;

			if (configStr !== lastStr) {
				lastConfig = config;
				await onChange(config);
			}
		} catch (error) {
			if (onError) {
				onError(error as Error);
			}
		}
	};

	const intervalId = setInterval(poll, interval);
	poll();

	return {
		stop: () => clearInterval(intervalId),
		close: () => clearInterval(intervalId),
	};
};

export const createWatcher = (options: {
	paths: string[];
	onChange: () => Promise<void>;
}): ConfigWatcher => {
	return watchMultipleFiles(options.paths, {
		onChange: async () => {
			await options.onChange();
		},
	});
};
