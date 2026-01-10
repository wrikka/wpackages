import type {
	HotReloadEvent,
	HotReloadManager,
	HotReloadOptions,
	HotReloadResult,
	HotReloadState,
} from "../types/hot-reload.types";
import type { PluginManager } from "./plugin-manager.service";

export const createHotReloadManager = (
	pluginManager: PluginManager,
	options: HotReloadOptions = { strategy: "watch" },
): HotReloadManager => {
	let state: HotReloadState = "idle";
	let watchers: Map<string, () => void> = new Map();
	const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

	const emitEvent = (event: HotReloadEvent): void => {
		void pluginManager.events.emit({
			pluginId: event.pluginId,
			timestamp: event.timestamp,
			type: `custom:${event.type}` as const,
			data: event,
		});
	};

	const reloadPlugin = async (pluginId: string): Promise<HotReloadResult> => {
		const _startTime = Date.now();
		state = "reloading";

		try {
			const pluginState = pluginManager.get(pluginId);
			if (!pluginState) {
				return {
					success: false,
					pluginId,
					reloadedAt: new Date(),
					error: new Error(`Plugin ${pluginId} not found`),
				};
			}

			if (pluginState.status === "enabled") {
				await pluginManager.disable(pluginId);
			}

			await pluginManager.enable(pluginId);

			emitEvent({
				type: "hot-reload:success",
				pluginId,
				timestamp: new Date(),
			});

			return {
				success: true,
				pluginId,
				reloadedAt: new Date(),
			};
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));

			if (options.rollbackOnError) {
				try {
					await pluginManager.disable(pluginId);
					await pluginManager.enable(pluginId);
					emitEvent({
						type: "hot-reload:rollback",
						pluginId,
						timestamp: new Date(),
						error: err,
					});
				} catch {
				}
			}

			emitEvent({
				type: "hot-reload:error",
				pluginId,
				timestamp: new Date(),
				error: err,
			});

			return {
				success: false,
				pluginId,
				reloadedAt: new Date(),
				error: err,
				rolledBack: options.rollbackOnError,
			};
		} finally {
			state = "watching";
		}
	};

	const start = async (): Promise<void> => {
		if (state === "watching") return;

		state = "watching";
		emitEvent({
			type: "hot-reload:start",
			pluginId: "system",
			timestamp: new Date(),
		});
	};

	const stop = async (): Promise<void> => {
		state = "idle";
		watchers.forEach((stop) => stop());
		watchers.clear();
		debounceTimers.forEach((timer) => clearTimeout(timer));
		debounceTimers.clear();
	};

	return Object.freeze({
		start,
		stop,
		reloadPlugin,
		getState: () => state,
		isWatching: () => state === "watching",
	});
};
