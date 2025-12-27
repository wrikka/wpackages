/**
 * Merge multiple config objects
 */
export const mergeConfigs = <T extends Record<string, unknown>>(configs: Partial<T>[]): Partial<T> => {
	return configs.reduce((acc, config) => {
		return { ...acc, ...config };
	}, {} as Partial<T>);
};
