export const safeStringify = (value: unknown, space: number = 2): string => {
	const seen = new WeakSet<object>();

	return JSON.stringify(
		value,
		(_key, v) => {
			if (typeof v === "object" && v !== null) {
				if (seen.has(v)) {
					return "[Circular]";
				}
				seen.add(v);
			}
			return v;
		},
		space,
	);
};
