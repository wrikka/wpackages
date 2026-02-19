// Mock Bun.macro for test environment
global.Bun = {
	macro: (fn: (...args: unknown[]) => unknown) => {
		return fn as unknown;
	},
} as unknown as typeof Bun;

// Mock import.meta for test environment using proxy
const mockImportMeta = {
	dir: process.cwd() + "/src/macros",
	path: process.cwd() + "/src/macros/index.ts",
	line: 0,
};

// Create a proxy to intercept import.meta access
(global as unknown as Record<string, unknown>).import = new Proxy({}, {
	get(_target, prop) {
		if (prop === "meta") {
			return mockImportMeta;
		}
		return undefined;
	},
});
