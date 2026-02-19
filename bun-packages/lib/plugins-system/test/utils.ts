import type { Plugin } from "../src/types";

export const createTestPlugin = (
	id: string,
	dependencies?: Array<{ id: string; version: string }>,
): Plugin => ({
	metadata: {
		id,
		name: `Test Plugin ${id}`,
		version: "1.0.0",
		description: "Test plugin",
		author: "Test",
	},
	dependencies,
	init: async () => {},
});
