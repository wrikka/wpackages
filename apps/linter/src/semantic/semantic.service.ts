import { Effect } from "effect";
import * as path from "path";
import * as ts from "typescript";
import { FileSystemService } from "../services/file-system.service";
import { SemanticError, SemanticLinterError, SemanticRule } from "../types/semantic";

const findTsConfig = (projectPath: string): Effect.Effect<string, SemanticLinterError> =>
	Effect.sync(() => ts.findConfigFile(projectPath, ts.sys.fileExists, "tsconfig.json"))
		.pipe(Effect.flatMap(path =>
			path
				? Effect.succeed(path)
				: Effect.fail(new SemanticLinterError({ message: "Could not find a valid 'tsconfig.json'." }))
		));

const readTsConfig = (
	configPath: string,
): Effect.Effect<{ config: any; error: ts.Diagnostic | undefined }, SemanticLinterError> =>
	Effect.tryPromise({
		try: () => Promise.resolve(ts.readConfigFile(configPath, ts.sys.readFile)),
		catch: (cause) => new SemanticLinterError({ message: `Failed to read tsconfig file at ${configPath}`, cause }),
	}).pipe(
		Effect.map(({ config, error }) => ({ config: config ?? {}, error })),
	);

const loadSemanticRules = (rulesDir: string): Effect.Effect<SemanticRule[], SemanticLinterError> =>
	FileSystemService.readdir(rulesDir).pipe(
		Effect.mapError(cause =>
			new SemanticLinterError({ message: `Failed to read rules directory: ${rulesDir}`, cause })
		),
		Effect.flatMap(files =>
			Effect.all(files.map(file =>
				Effect.try({
					try: () => {
						const ruleModule = require(path.join(rulesDir, file.name));
						return Object.values(ruleModule)[0] as SemanticRule;
					},
					catch: (cause) => new SemanticLinterError({ message: `Failed to load rule: ${file.name}`, cause }),
				})
			))
		),
	);

export const runSemanticLinter = (projectPath: string): Effect.Effect<SemanticError[], SemanticLinterError> =>
	Effect.gen(function*(_) {
		const configPath = yield* _(findTsConfig(projectPath));
		const configFile = yield* _(readTsConfig(configPath));

		if (configFile.error) {
			return yield* _(
				Effect.fail(new SemanticLinterError({ message: `Error reading tsconfig: ${configFile.error.messageText}` })),
			);
		}
		if (!configFile.config) {
			return yield* _(Effect.fail(new SemanticLinterError({ message: `Invalid tsconfig content in ${configPath}` })));
		}
		const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, projectPath);
		const program = ts.createProgram(compilerOptions.fileNames, compilerOptions.options);
		const allSourceFiles = program.getSourceFiles().filter(f => !f.isDeclarationFile);

		const rulesDir = path.join(__dirname, "rules");
		const rules = yield* _(loadSemanticRules(rulesDir));

		const allErrors: SemanticError[] = [];

		for (const sourceFile of allSourceFiles) {
			const errors: SemanticError[] = [];
			const report = (error: Omit<SemanticError, "fileName">) => {
				errors.push({ ...error, fileName: sourceFile.fileName });
			};

			for (const rule of rules) {
				const visitor = rule.create({ sourceFile, program, report });
				ts.visitNode(sourceFile, visitor);
			}
			allErrors.push(...errors);
		}

		return allErrors;
	});
