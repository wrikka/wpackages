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

export const toDotenv = (obj: Record<string, unknown>): string => {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		const raw = toEnvValueString(value);
		const escaped = raw.includes("\n") || raw.includes(" ") || raw.includes('"')
			? `"${raw.replaceAll('"', '\\"')}"`
			: raw;
		lines.push(`${key}=${escaped}`);
	}
	return lines.join("\n");
};
