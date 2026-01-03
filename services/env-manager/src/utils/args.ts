import type { CliOptions, OutputFormat } from "../types/cli";

export const parseArgs = (argv: string[]): CliOptions => {
	let environment: string | undefined;
	const paths: string[] = [];
	let expand = true;
	let override = false;
	let output: OutputFormat = "json";

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === undefined) continue;
		if (arg === "--help" || arg === "-h") {
			throw new Error(
				[
					"env-manager usage:",
					"  bun dev -- [paths...] [options]",
					"options:",
					"  --env <name>              NODE_ENV override",
					"  --no-expand               disable variable expansion",
					"  --override                write values into process.env",
					"  --output <json|dotenv>    output format",
				].join("\n"),
			);
		}

		if (arg.startsWith("--env=")) {
			const value = arg.split("=")[1];
			if (!value) throw new Error("--env requires a value");
			environment = value;
			continue;
		}
		if (arg === "--env") {
			const value = argv[i + 1];
			if (!value) throw new Error("--env requires a value");
			environment = value;
			i++;
			continue;
		}
		if (arg === "--no-expand") {
			expand = false;
			continue;
		}
		if (arg === "--override") {
			override = true;
			continue;
		}
		if (arg.startsWith("--output=")) {
			const value = arg.split("=")[1];
			if (value === "json" || value === "dotenv") output = value;
			else throw new Error(`Invalid --output: ${value ?? ""}`);
			continue;
		}
		if (arg === "--output") {
			const value = argv[i + 1];
			if (value === "json" || value === "dotenv") output = value;
			else throw new Error(`Invalid --output: ${value ?? ""}`);
			i++;
			continue;
		}
		if (arg.startsWith("--")) {
			throw new Error(`Unknown option: ${arg}`);
		}
		paths.push(arg);
	}

	return {
		paths: paths.length === 0 ? ["."] : paths,
		...(environment !== undefined ? { environment } : {}),
		expand,
		override,
		output,
	};
};
