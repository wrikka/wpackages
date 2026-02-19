// Mock env macro for test environment
export const env = <T extends string | number | boolean>(key: string, defaultValue?: string): T => {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value as T;
};

export const envTyped = (key: string, type: string, defaultValue?: string): unknown => {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
};

export const envRequired = (key: string): string => {
	const value = process.env[key];
	if (value === undefined) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
};
