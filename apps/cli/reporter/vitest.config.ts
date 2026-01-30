import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "reporter",
		pool: "forks",
		maxWorkers: 1,
	},
});
