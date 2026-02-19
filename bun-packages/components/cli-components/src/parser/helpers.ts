export const parseOptionFlags = (flags: string): { short?: string; long?: string } => {
	const parts = flags
		.split(",")
		.map((p) => p.trim())
		.filter((p) => p.length > 0);

	let short: string | undefined;
	let long: string | undefined;

	for (const part of parts) {
		if (part.startsWith("--")) {
			const name = part.slice(2).split(/[\s=[]/, 1)[0];
			if (name) long = name;
			continue;
		}

		if (part.startsWith("-")) {
			const name = part.slice(1).split(/[\s=[]/, 1)[0];
			if (name) short = name;
		}
	}

	return { long, short };
};

export const matchOptionArg = (
	arg: string,
	nextArg: string | undefined,
	flags: { short?: string; long?: string },
): { matched: boolean; rawValue: unknown } => {
	const { short, long } = flags;

	if (long && arg.startsWith(`--${long}`)) {
		if (arg.includes("=")) {
			return { matched: true, rawValue: arg.split("=")[1] };
		}
		if (nextArg && !nextArg.startsWith("-")) {
			return { matched: true, rawValue: nextArg };
		}
		return { matched: true, rawValue: true };
	}

	if (short && arg === `-${short}`) {
		if (nextArg && !nextArg.startsWith("-")) {
			return { matched: true, rawValue: nextArg };
		}
		return { matched: true, rawValue: true };
	}

	return { matched: false, rawValue: true };
};

export const autoCoerceValue = (value: unknown): unknown => {
	if (value === true) return true;
	if (typeof value !== "string") return value;
	if (value.trim() === "") return value;
	const asNumber = Number(value);
	if (!Number.isNaN(asNumber)) return asNumber;
	return value;
};
