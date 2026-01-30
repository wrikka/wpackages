export function deepMerge<T extends object, U extends object>(
	target: T,
	source: U,
): T & U {
	const output = { ...target } as T & U;

	for (const key in source) {
		if (Object.hasOwn(source, key)) {
			const targetValue = (target as Record<string, unknown>)[key];
			const sourceValue = (source as Record<string, unknown>)[key];

			if (isObject(targetValue) && isObject(sourceValue)) {
				(output as Record<string, unknown>)[key] = deepMerge(
					targetValue,
					sourceValue,
				);
			} else {
				(output as Record<string, unknown>)[key] = sourceValue;
			}
		}
	}

	return output;
}

function isObject(item: unknown): item is object {
	return item !== null && typeof item === "object" && !Array.isArray(item);
}
