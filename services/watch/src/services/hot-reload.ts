import type { WatchEvent } from "../types";
import { createDebouncer } from "../utils/debounce";

/**
 * Hot reload service for development workflows
 */
export class HotReloadService {
	private callbacks: Array<(event: WatchEvent) => void | Promise<void>> = [];
	private debouncedReload: ReturnType<typeof createDebouncer>;
	private isReloading: boolean = false;

	constructor(debounceMs: number = 100) {
		this.debouncedReload = createDebouncer(this.executeReload.bind(this), debounceMs);
	}

	/**
	 * Register a callback to be called on reload
	 */
	public onReload(callback: (event: WatchEvent) => void | Promise<void>): void {
		this.callbacks.push(callback);
	}

	/**
	 * Trigger a reload with debouncing
	 */
	public triggerReload(event: WatchEvent): void {
		this.debouncedReload(event);
	}

	/**
	 * Execute the actual reload process
	 */
	private async executeReload(event: WatchEvent): Promise<void> {
		if (this.isReloading) return;

		this.isReloading = true;

		try {
			// Execute all callbacks
			for (const callback of this.callbacks) {
				try {
					await Promise.resolve(callback(event));
				} catch (error) {
					console.error("Hot reload callback error:", error);
				}
			}
		} finally {
			this.isReloading = false;
		}
	}

	/**
	 * Clear all registered callbacks
	 */
	public clearCallbacks(): void {
		this.callbacks = [];
	}

	/**
	 * Check if currently reloading
	 */
	public isReloadingNow(): boolean {
		return this.isReloading;
	}
}
