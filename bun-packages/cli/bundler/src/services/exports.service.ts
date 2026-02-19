import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BuildError } from "../error";
import type { BunpackConfig } from "../types";

interface PackageJson {
	name?: string;
	main?: string;
	module?: string;
	types?: string;
	bin?: Record<string, string>;
	exports?: Record<string, unknown>;
}

export async function generateExports(cwd: string, config: BunpackConfig): Promise<void> {
	const pkgPath = path.join(cwd, "package.json");
	let pkgRaw: string;

	try {
		pkgRaw = await readFile(pkgPath, "utf8");
	} catch (cause) {
		throw new BuildError({
			code: "PKG_NOT_FOUND",
			step: "exports",
			message: `Could not read ${pkgPath}`,
			hint: "Run bunpack in a folder with package.json",
			cause,
		});
	}

	const pkg = JSON.parse(pkgRaw) as PackageJson;

	const outDir = config.outDir ?? ".output";

	const entries = Array.isArray(config.entry) ? config.entry : [config.entry];
	const mainEntry = entries[0] ?? "src/index.ts";
	const baseName = path.basename(mainEntry).replace(/\.(ts|tsx|js|jsx)$/, "");
	const entryDir = path.dirname(mainEntry);

	const esmEntry = `${outDir}/esm/${baseName}.js`;
	const cjsEntry = `${outDir}/cjs/${baseName}.js`;
	const typesEntry = `${outDir}/types/${entryDir}/${baseName}.d.ts`;

	const nextExports: Record<string, unknown> = {
		".": {
			types: `./${typesEntry}`,
			import: `./${esmEntry}`,
			require: `./${cjsEntry}`,
		},
	};

	if (config.bin) {
		for (const [name] of Object.entries(config.bin)) {
			nextExports[`./bin/${name}`] = `./${outDir}/bin/${name}.js`;
		}
	}

	pkg.main = `./${cjsEntry}`;
	pkg.module = `./${esmEntry}`;
	pkg.types = `./${typesEntry}`;

	if (config.bin) {
		pkg.bin = Object.fromEntries(
			Object.keys(config.bin).map((name) => [name, `./${outDir}/bin/${name}.js`]),
		);
	}

	pkg.exports = nextExports;

	await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}
