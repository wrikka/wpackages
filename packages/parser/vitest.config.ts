import path from "node:path";
import { defineProject } from "vitest/config";

export default defineProject({
	test: {
		name: "parser",
	},
	resolve: {
		alias: {
			"@w/design-pattern": path.resolve(__dirname, "../../utils/design-pattern/src"),
		},
	},
});
