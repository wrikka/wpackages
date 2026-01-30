import { describe, expect, it } from "bun:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { applyBaseline, loadBaseline, writeBaseline } from "./baseline";
import type { AnalysisResult } from "./types";

async function createTempDir(prefix: string): Promise<string> {
	return await fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

describe("baseline", () => {
	it("should write baseline and suppress matching issues (single mode)", async () => {
		const cwd = await createTempDir("wpackages-unused-baseline-");
		const baselinePath = path.join(cwd, "unused.baseline.json");

		const raw: AnalysisResult = {
			unusedFiles: [path.join(cwd, "src", "a.ts")],
			unusedDependencies: ["left-pad"],
			unusedExports: new Map([[path.join(cwd, "src", "b.ts"), ["foo"]]]),
		};

		await writeBaseline(baselinePath, raw, cwd);
		const baseline = await loadBaseline(baselinePath);
		expect(baseline).not.toBeNull();
		if (!baseline) throw new Error("baseline not loaded");

		const filtered = applyBaseline(raw, baseline, cwd) as AnalysisResult;
		expect(filtered.unusedFiles).toEqual([]);
		expect(filtered.unusedDependencies).toEqual([]);
		expect([...filtered.unusedExports.entries()]).toEqual([]);
	});

	it("should not suppress when issue is not present in baseline", async () => {
		const cwd = await createTempDir("wpackages-unused-baseline-");
		const baselinePath = path.join(cwd, "unused.baseline.json");

		const baselineResult: AnalysisResult = {
			unusedFiles: [path.join(cwd, "src", "a.ts")],
			unusedDependencies: [],
			unusedExports: new Map(),
		};
		await writeBaseline(baselinePath, baselineResult, cwd);
		const baseline = await loadBaseline(baselinePath);
		expect(baseline).not.toBeNull();
		if (!baseline) throw new Error("baseline not loaded");

		const raw: AnalysisResult = {
			unusedFiles: [path.join(cwd, "src", "c.ts")],
			unusedDependencies: ["react"],
			unusedExports: new Map([[path.join(cwd, "src", "d.ts"), ["bar"]]]),
		};

		const filtered = applyBaseline(raw, baseline, cwd) as AnalysisResult;
		expect(filtered.unusedFiles).toEqual(raw.unusedFiles);
		expect(filtered.unusedDependencies).toEqual(raw.unusedDependencies);
		expect(Object.fromEntries(filtered.unusedExports.entries())).toEqual(
			Object.fromEntries(raw.unusedExports.entries()),
		);
	});
});
