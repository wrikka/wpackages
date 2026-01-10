import type {
	SandboxContext,
	SandboxManager,
	SandboxOptions,
	SandboxResult,
} from "../types/sandbox.types";

export const createSandboxManager = (): SandboxManager => {
	const contexts: Map<string, SandboxContext> = new Map();

	const create = async (pluginId: string, options: SandboxOptions): Promise<SandboxContext> => {
		const context: SandboxContext = {
			pluginId,
			sandboxType: options.type,
			createdAt: new Date(),
			isActive: true,
		};

		contexts.set(pluginId, context);
		return context;
	};

	const execute = async <T>(
		context: SandboxContext,
		fn: () => T | Promise<T>,
	): Promise<SandboxResult<T>> => {
		const startTime = Date.now();

		try {
			const value = await fn();
			const executionTime = Date.now() - startTime;

			return {
				success: true,
				value,
				executionTime,
				memoryUsage: process.memoryUsage().heapUsed,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error : new Error(String(error)),
				executionTime: Date.now() - startTime,
			};
		}
	};

	const destroy = async (context: SandboxContext): Promise<void> => {
		const existing = contexts.get(context.pluginId);
		if (existing) {
			contexts.set(context.pluginId, {
				...existing,
				isActive: false,
			});
		}
	};

	const isActive = (context: SandboxContext): boolean => {
		const existing = contexts.get(context.pluginId);
		return existing?.isActive ?? false;
	};

	const getResourceUsage = (_context: SandboxContext): { readonly memory?: number; readonly cpu?: number } => {
		return {
			memory: process.memoryUsage().heapUsed,
		};
	};

	return Object.freeze({
		create,
		execute,
		destroy,
		isActive,
		getResourceUsage,
	});
};
