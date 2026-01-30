/**
 * Logger utility for dev-server
 * Pure function for logging
 */

export interface Logger {
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	debug(message: string): void;
}

export const createLogger = (prefix: string): Logger => {
	const timestamp = () => new Date().toISOString();

	return {
		info: (message: string) => {
			console.log(`[${timestamp()}] [${prefix}] ℹ️  ${message}`);
		},
		warn: (message: string) => {
			console.warn(`[${timestamp()}] [${prefix}] ⚠️  ${message}`);
		},
		error: (message: string) => {
			console.error(`[${timestamp()}] [${prefix}] ❌ ${message}`);
		},
		debug: (message: string) => {
			if (process.env["DEBUG"]) {
				console.log(`[${timestamp()}] [${prefix}] 🐛 ${message}`);
			}
		},
	};
};
