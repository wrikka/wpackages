// Mock log macro for test environment
export const log = (...args: unknown[]): string => {
	return `console.log(${JSON.stringify(args)})`;
};

log.debug = (...args: unknown[]): string => {
	return `console.debug(${JSON.stringify(args)})`;
};

log.info = (...args: unknown[]): string => {
	return `console.info(${JSON.stringify(args)})`;
};

log.warn = (...args: unknown[]): string => {
	return `console.warn(${JSON.stringify(args)})`;
};

log.error = (...args: unknown[]): string => {
	return `console.error(${JSON.stringify(args)})`;
};

log.group = (label: string, fn: () => void): void => {
	console.group(label);
	fn();
	console.groupEnd();
};
