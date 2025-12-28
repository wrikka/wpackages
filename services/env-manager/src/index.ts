import { createEnvManager } from "@wts/config-manager";
import { parseArgs } from "./args";

const toDotenv = (obj: Record<string, unknown>): string => {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		const raw = String(value);
		const escaped = raw.includes("\n") || raw.includes(" ") || raw.includes("\"")
			? `"${raw.replaceAll("\\\"", "\\\\\"")}"`
			: raw;
		lines.push(`${key}=${escaped}`);
	}
	return lines.join("\n");
};

export const runEnvManagerApp = async () => {
	const opts = parseArgs(process.argv.slice(2));
	const manager = createEnvManager({
		paths: opts.paths,
		...(opts.environment !== undefined ? { environment: opts.environment } : {}),
		expand: opts.expand,
		override: opts.override,
	});

	const result = manager.load();
	if (result._tag === "Failure") {
		throw (result as unknown as { readonly error: Error }).error;
	}

	const all = manager.getAll() as Record<string, unknown>;
	if (opts.output === "dotenv") {
		process.stdout.write(`${toDotenv(all)}\n`);
		return;
	}

	process.stdout.write(`${JSON.stringify(all, null, 2)}\n`);
};
