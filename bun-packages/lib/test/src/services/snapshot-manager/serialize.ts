export function serializeSnapshotValue(value: any): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return String(value);
	if (typeof value === "bigint") return `${value}n`;

	if (Array.isArray(value)) {
		return `[${value.map(item => serializeSnapshotValue(item)).join(", ")}]`;
	}

	if (typeof value === "object") {
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	return String(value);
}
