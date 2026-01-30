import type { LogMeta } from "../types";

const redact = (meta: LogMeta | undefined, keys: ReadonlyArray<string>): LogMeta | undefined => {
	if (!meta) return undefined;
	if (keys.length === 0) return meta;
	const out: Record<string, unknown> = { ...meta };
	for (const k of keys) {
		if (k in out) out[k] = "[REDACTED]";
	}
	return out;
};

export const redactMeta = (
	meta: LogMeta | undefined,
	keys: ReadonlyArray<string>,
): LogMeta | undefined => redact(meta, keys);
