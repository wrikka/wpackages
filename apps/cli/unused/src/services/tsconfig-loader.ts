import path from "node:path";
import ts from "typescript";

export interface TsConfig {
	compilerOptions?: {
		baseUrl?: string;
		paths?: Record<string, string[]>;
	};
}

/**
 * Finds and parses the tsconfig.json file.
 * @param cwd The directory to start searching from.
 * @returns The parsed tsconfig.json object or null if not found.
 */
export async function loadTsConfig(cwd: string): Promise<TsConfig | null> {
	try {
		const configPath = ts.findConfigFile(cwd, ts.sys.fileExists, "tsconfig.json");
		if (!configPath) return null;

		const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
		if (configFile.error) {
			return null;
		}

		const parsed = ts.parseJsonConfigFileContent(
			configFile.config,
			ts.sys,
			path.dirname(configPath),
			undefined,
			configPath,
		);

		const compilerOptions: TsConfig["compilerOptions"] = {
			...(parsed.options.baseUrl ? { baseUrl: parsed.options.baseUrl } : {}),
			...(parsed.options.paths
				? { paths: parsed.options.paths as Record<string, string[]> }
				: {}),
		};

		return {
			compilerOptions,
		} satisfies TsConfig;
	} catch {
		return null;
	}
}

export interface ResolvedAlias {
	prefix: string;
	paths: string[];
}

/**
 * Parses tsconfig paths into a more usable format.
 * @param tsconfig The loaded tsconfig object.
 * @param cwd The project's root directory.
 * @returns An array of resolved aliases.
 */
export function getResolvedAliases(tsconfig: TsConfig | null, cwd: string): ResolvedAlias[] {
	if (!tsconfig?.compilerOptions?.paths) {
		return [];
	}

	const baseUrl = path.resolve(cwd, tsconfig.compilerOptions.baseUrl || ".");
	const aliases: ResolvedAlias[] = [];

	for (const [alias, aliasPaths] of Object.entries(tsconfig.compilerOptions.paths)) {
		const prefix = alias.replace("/*", "");
		const resolvedPaths = aliasPaths.map(p => path.resolve(baseUrl, p.replace("/*", "")));
		aliases.push({ prefix, paths: resolvedPaths });
	}

	return aliases;
}
