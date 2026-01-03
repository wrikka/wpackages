import { createEnvManager } from "@wpackages/config-manager";
import { parseArgs } from "./args";

const toEnvValueString = (value: unknown): string => {
	if (value === null) return "null";
	if (value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "bigint") return value.toString();
	if (typeof value === "symbol") return value.description ?? value.toString();
	if (typeof value === "function") return "[function]";
	try {
		return JSON.stringify(value);
	} catch {
		return Object.prototype.toString.call(value);
	}
};

const toDotenv = (obj: Record<string, unknown>): string => {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		const raw = toEnvValueString(value);
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
