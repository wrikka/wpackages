import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";

export class DependencyService {
	private graph = new Map<string, Set<string>>(); // Key: file, Value: files that import key
	private fileImports = new Map<string, Set<string>>(); // Key: file, Value: files that key imports

	constructor(private projectRoot: string) {}

	async buildGraph() {
		const files = await glob("src/**/*.ts", { cwd: this.projectRoot, absolute: true });

		for (const file of files) {
			const content = await fs.readFile(file, "utf-8");
			const imports = this.parseImports(content, path.dirname(file));
			this.fileImports.set(file, new Set());

			for (const imp of imports) {
				const resolvedImport = await this.resolveImport(imp, path.dirname(file));
				if (resolvedImport) {
					if (!this.graph.has(resolvedImport)) {
						this.graph.set(resolvedImport, new Set());
					}
					this.graph.get(resolvedImport)!.add(file);
					this.fileImports.get(file)!.add(resolvedImport);
				}
			}
		}
	}

	getDependents(filePath: string): Set<string> {
		const dependents = new Set<string>();
		const queue = [filePath];

		while (queue.length > 0) {
			const currentFile = queue.shift()!;
			if (dependents.has(currentFile)) continue;

			dependents.add(currentFile);

			const fileDependents = this.graph.get(currentFile);
			if (fileDependents) {
				for (const dependent of fileDependents) {
					queue.push(dependent);
				}
			}
		}

		return dependents;
	}

	private parseImports(code: string, _dir: string): string[] {
		const imports: string[] = [];
		try {
			const ast = parse(code, { sourceType: "module", plugins: ["typescript"] });
			traverse(ast, {
				ImportDeclaration({ node }) {
					imports.push(node.source.value);
				},
				ExportNamedDeclaration({ node }) {
					if (node.source) {
						imports.push(node.source.value);
					}
				},
				ExportAllDeclaration({ node }) {
					if (node.source) {
						imports.push(node.source.value);
					}
				},
			});
		} catch {
			// Ignore parsing errors
		}
		return imports;
	}

	private async resolveImport(importPath: string, dir: string): Promise<string | null> {
		if (!importPath.startsWith(".")) return null; // Ignore node_modules for now

		const extensions = [".ts", ".tsx", "/index.ts", "/index.tsx"];
		const baseResolved = path.resolve(dir, importPath);

		const potentialPaths = [
			baseResolved,
			...extensions.map(ext => `${baseResolved}${ext}`),
		];

		for (const p of potentialPaths) {
			try {
				const stat = await fs.stat(p);
				if (stat.isFile()) return p;
			} catch {}
		}

		return null;
	}
}
