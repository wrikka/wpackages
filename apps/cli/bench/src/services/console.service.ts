import * as pc from "picocolors";

/**
 * Console service - Simple async functions
 */
export const ConsoleService = {
	log: async (message: string): Promise<void> => {
		console.log(message);
	},

	error: async (message: string): Promise<void> => {
		console.error(pc.red(message));
	},

	success: async (message: string): Promise<void> => {
		console.log(pc.green(message));
	},

	warn: async (message: string): Promise<void> => {
		console.warn(pc.yellow(message));
	},

	info: async (message: string): Promise<void> => {
		console.info(pc.blue(message));
	},

	table: async (data: unknown): Promise<void> => {
		console.table(data);
	},
} as const;

/**
 * Legacy alias for backward compatibility
 */
export const ConsoleServiceLive: typeof ConsoleService = ConsoleService;
