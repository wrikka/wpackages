import type { BunpackConfig } from "../types";

export type BuildStep =
	| "clean"
	| "native"
	| "wasm"
	| "ts"
	| "dts"
	| "bin";

export interface BuildPlan {
	steps: BuildStep[];
	artifacts: string[];
}

export function createPlan(config: BunpackConfig): BuildPlan {
	const steps: BuildStep[] = [];

	if (config.clean && config.outDir) steps.push("clean");
	if (config.native?.napi && !config.native.napi.skip) steps.push("native");
	if (config.native?.wasm && !config.native.wasm.skip) steps.push("wasm");

	const entries = Array.isArray(config.entry) ? config.entry : [config.entry];
	if (entries.length > 0) steps.push("ts");
	if (config.dts) steps.push("dts");
	if (config.bin && Object.keys(config.bin).length > 0) steps.push("bin");

	const artifacts: string[] = [];
	if (config.outDir) {
		for (const f of config.format ?? ["esm"]) {
			artifacts.push(`${config.outDir}/${f}/`);
		}
		if (config.dts) artifacts.push(`${config.outDir}/types/`);
		if (config.bin && Object.keys(config.bin).length > 0) artifacts.push(`${config.outDir}/bin/`);
		if (config.native?.napi && !config.native.napi.skip) {
			const outFile = config.native.napi.outFile ?? config.name ?? "addon";
			artifacts.push(`${config.outDir}/${outFile}.node`);
		}
	}

	return { steps, artifacts };
}
