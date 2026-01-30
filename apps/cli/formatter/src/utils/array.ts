export const ensureArray = <T>(value: T | readonly T[]): readonly T[] => {
	return Array.isArray(value) ? value : [value];
};
