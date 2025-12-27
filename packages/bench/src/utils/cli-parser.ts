import type { BenchmarkOptions } from "../types/cli.types";

/**
 * Parse CLI arguments into BenchmarkOptions and commands
 *
 * @param args - Array of command-line arguments
 * @returns Object containing parsed options and commands
 *
 * @example
 * ```ts
 * const { options, commands } = parseCliArgs([
 *   "--warmup", "5",
 *   "--runs", "20",
 *   "npm run test",
 *   "bun run test"
 * ]);
 * console.log(options.warmup); // 5
 * console.log(commands); // ["npm run test", "bun run test"]
 * ```
 */
export const parseCliArgs = (
	args: string[],
): { options: Partial<BenchmarkOptions>; commands: string[] } => {
	const options: Partial<BenchmarkOptions> = {};
	const commands: string[] = [];

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		switch (arg) {
			case "--warmup":
			case "-w":
				if (args[i + 1]) {
					const nextArg = args[++i];
					if (nextArg) {
						options.warmup = Number.parseInt(nextArg, 10);
					}
				}
				break;

			case "--runs":
			case "-r":
				if (args[i + 1]) {
					const nextArg = args[++i];
					if (nextArg) {
						options.runs = Number.parseInt(nextArg, 10);
					}
				}
				break;

			case "--prepare":
			case "-p":
				if (args[i + 1]) {
					const prepareCmd = args[++i];
					if (prepareCmd) {
						options.prepare = prepareCmd;
					}
				}
				break;

			case "--cleanup":
			case "-c":
				if (args[i + 1]) {
					const cleanupCmd = args[++i];
					if (cleanupCmd) {
						options.cleanup = cleanupCmd;
					}
				}
				break;

			case "--shell":
			case "-s":
				if (args[i + 1]) {
					const shellCmd = args[++i];
					if (shellCmd) {
						options.shell = shellCmd;
					}
				}
				break;

			case "--output":
			case "-o":
				if (args[i + 1]) {
					const outputFormat = args[++i];
					if (outputFormat === "json" || outputFormat === "text" || outputFormat === "table" || outputFormat === "chart") {
						options.output = outputFormat;
					}
				}
				break;

			case "--export":
			case "-e":
				if (args[i + 1]) {
					const exportFile = args[++i];
					if (exportFile) {
						options.export = exportFile;
					}
				}
				break;

			case "--verbose":
			case "-v":
				options.verbose = true;
				break;

			case "--silent":
				options.silent = true;
				break;

			default:
				if (arg && !arg.startsWith("-")) {
					commands.push(arg);
				}
		}
	}

	return { options, commands };
};
