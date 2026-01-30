import { Context, Effect, Layer } from "effect";
import type { CheckResult } from "../types";
import { analyzeProject } from "../utils/analyzer";

const runTypeAnalysis = (dir: string): Effect.Effect<CheckResult, Error> =>
	Effect.tryPromise({
		try: async () => {
			const startTime = Date.now();
			const fileInfos = await analyzeProject(dir);
			const duration = Date.now() - startTime;

			const issues = fileInfos.flatMap((info) =>
				info.variables.map((variable) => ({
					severity: "info" as const,
					message: `${variable.kind} '${variable.name}' has type: ${variable.type}`,
					file: info.path,
					line: variable.line,
				}))
			);

			return {
				name: "Type Analysis",
				status: "passed" as const,
				duration,
				issues,
				summary: `Analyzed ${fileInfos.length} files and found ${issues.length} typed declarations.`,
			} as CheckResult;
		},
		catch: (unknown) => new Error(`Type analysis failed: ${String(unknown)}`),
	});

export class TypeAnalyzerService extends Context.Tag("TypeAnalyzerService")<TypeAnalyzerService, {
	readonly analyze: (dir: string) => Effect.Effect<CheckResult, Error>;
	readonly check: () => Effect.Effect<CheckResult, Error>;
}>() {}

export const TypeAnalyzerLive = Layer.succeed(
	TypeAnalyzerService,
	TypeAnalyzerService.of({
		analyze: (dir: string) => runTypeAnalysis(dir),
		check: () => runTypeAnalysis(process.cwd()),
	}),
);
