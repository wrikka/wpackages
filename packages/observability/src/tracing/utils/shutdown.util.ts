import type { TracerProvider } from "../services/provider.service";

/**
 * Registers a graceful shutdown hook for the given TracerProvider.
 * This is only effective in a Node.js environment.
 * @param provider The TracerProvider to shut down.
 */
export function registerGracefulShutdown(provider: TracerProvider): void {
	if (typeof process?.on !== "function") {
		return; // Not in a Node.js environment
	}

	const shutdown = () => {
		provider.shutdown().then(
			() => console.log("Tracing terminated gracefully."),
			(err) => console.error("Error shutting down tracing:", err),
		).finally(() => process.exit(0));
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}
