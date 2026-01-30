import fs from "node:fs/promises";
import path from "node:path";
import type { JsonReport, WorkspaceJsonReport } from "../components/json-reporter";
import { toJsonReport, toWorkspaceJsonReport } from "../components/json-reporter";
import type { AnalysisResult, PackageAnalysisResult, WorkspaceAnalysisResult } from "../types";

type BaselineFile = JsonReport | WorkspaceJsonReport;

type ExportKey = `${string}::${string}`;

type BaselineIndex = {
	mode: "single" | "workspace";
	unusedFiles: Set<string>;
	unusedDependencies: Set<string>;
	unusedExportKeys: Set<ExportKey>;
	packages?: Map<string, BaselineIndex>; // packageName -> index
};

function isWorkspaceBaseline(baseline: BaselineFile): baseline is WorkspaceJsonReport {
	return (baseline as WorkspaceJsonReport).mode === "workspace";
}

function createExportKey(filePath: string, exportName: string): ExportKey {
	return `${filePath}::${exportName}`;
}

function buildIndexFromJsonReport(report: JsonReport): BaselineIndex {
	const exportKeys = new Set<ExportKey>();
	for (const [filePath, exports] of Object.entries(report.unusedExports)) {
		for (const exp of exports) {
			exportKeys.add(createExportKey(filePath, exp));
		}
	}

	return {
		mode: "single",
		unusedFiles: new Set(report.unusedFiles),
		unusedDependencies: new Set(report.unusedDependencies),
		unusedExportKeys: exportKeys,
	};
}

function buildIndexFromWorkspaceReport(report: WorkspaceJsonReport): BaselineIndex {
	const packages = new Map<string, BaselineIndex>();
	for (const pkg of report.packages) {
		packages.set(pkg.packageName, buildIndexFromJsonReport(pkg.report));
	}

	return {
		mode: "workspace",
		unusedFiles: new Set(),
		unusedDependencies: new Set(),
		unusedExportKeys: new Set(),
		packages,
	};
}

function buildIndex(baseline: BaselineFile): BaselineIndex {
	return isWorkspaceBaseline(baseline)
		? buildIndexFromWorkspaceReport(baseline)
		: buildIndexFromJsonReport(baseline);
}

export async function loadBaseline(filePath: string): Promise<BaselineIndex | null> {
	try {
		const raw = await fs.readFile(filePath, "utf-8");
		const parsed = JSON.parse(raw) as BaselineFile;
		return buildIndex(parsed);
	} catch {
		return null;
	}
}

function filterSingle(result: AnalysisResult, baseline: BaselineIndex, cwd: string): AnalysisResult {
	const filteredUnusedFiles = result.unusedFiles.filter(file => {
		const rel = path.relative(cwd, file);
		return !baseline.unusedFiles.has(rel);
	});
	const filteredUnusedDependencies = result.unusedDependencies.filter(dep => !baseline.unusedDependencies.has(dep));
	const filteredUnusedExports = new Map<string, string[]>();

	for (const [filePath, exports] of result.unusedExports.entries()) {
		const keep = exports.filter(exp => !baseline.unusedExportKeys.has(createExportKey(filePath, exp)));
		if (keep.length > 0) {
			filteredUnusedExports.set(filePath, keep);
		}
	}

	return {
		unusedFiles: filteredUnusedFiles,
		unusedDependencies: filteredUnusedDependencies,
		unusedExports: filteredUnusedExports,
	};
}

export function applyBaseline(
	result: AnalysisResult | WorkspaceAnalysisResult,
	baseline: BaselineIndex,
	cwd: string,
): AnalysisResult | WorkspaceAnalysisResult {
	if (baseline.mode === "workspace") {
		if ((result as WorkspaceAnalysisResult).mode !== "workspace") {
			return result;
		}
		const wr = result as WorkspaceAnalysisResult;
		return {
			...wr,
			packages: wr.packages.map((pkg: PackageAnalysisResult) => {
				const idx = baseline.packages?.get(pkg.packageName);
				if (!idx) return pkg;
				return {
					...pkg,
					...filterSingle(pkg, idx, pkg.cwd),
				};
			}),
		};
	}

	if ((result as WorkspaceAnalysisResult).mode === "workspace") {
		// baseline is single but result is workspace => do nothing
		return result;
	}

	return filterSingle(result as AnalysisResult, baseline, cwd);
}

export async function writeBaseline(
	filePath: string,
	result: AnalysisResult | WorkspaceAnalysisResult,
	cwd: string,
): Promise<void> {
	const baseline: BaselineFile = (result as WorkspaceAnalysisResult).mode === "workspace"
		? toWorkspaceJsonReport(result as WorkspaceAnalysisResult)
		: toJsonReport(result as AnalysisResult, cwd);
	await fs.writeFile(filePath, JSON.stringify(baseline, null, 2), "utf-8");
}
