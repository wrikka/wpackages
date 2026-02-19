import { describe, expect, it } from "@wpackages/test";
import { createPlan } from "./plan.service";

describe("createPlan", () => {
	it("includes steps and artifacts", () => {
		const plan = createPlan({
			entry: ["src/index.ts"],
			outDir: ".output",
			clean: true,
			dts: true,
			format: ["esm", "cjs"],
			bin: { bunpack: "src/cli.ts" },
		} as any);

		expect(plan.steps.includes("clean")).toBe(true);
		expect(plan.steps.includes("ts")).toBe(true);
		expect(plan.steps.includes("dts")).toBe(true);
		expect(plan.steps.includes("bin")).toBe(true);
		expect(plan.artifacts.length > 0).toBe(true);
	});
});
