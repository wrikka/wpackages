/**
 * Module resolver for @wpackages/devserver
 * Handles module resolution with monorepo workspace support
 */

import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface ResolveOptions {
	readonly root: string;
	readonly alias?: Record<string, string>;
	readonly extensions?: readonly string[];
	readonly mainFields?: readonly string[];
	readonly tryIndex?: boolean;
}

export interface Resolver {
	readonly resolve: (id: string, importer?: string) => Promise<string | null>;
	readonly load: (id: string) => Promise<string | null>;
}

export function createResolver(options: ResolveOptions): Resolver {
	const {
		root,
		alias = {},
		extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
		mainFields = ["main", "module", "browser", "exports"],
		tryIndex = true,
	} = options;

	// Monorepo workspace resolver
	const resolveWorkspacePackage = async (id: string): Promise<string | null> => {
		// Handle @workspace/package format
		if (id.startsWith("@workspace/")) {
			const packageName = id.replace("@workspace/", "");
			const packagePath = join(root, "packages", packageName);

			if (existsSync(packagePath)) {
				const packageJsonPath = join(packagePath, "package.json");
				if (existsSync(packageJsonPath)) {
					try {
						const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
						const mainField = mainFields.find(field => packageJson[field]);
						if (mainField) {
							return join(packagePath, packageJson[mainField]);
						}
						// Default to index.js
						return join(packagePath, "index.js");
					} catch {
						// Fall back to index.js
						return join(packagePath, "index.js");
					}
				}
			}
		}
		return null;
	};

	// Handle alias resolution
	const resolveAlias = (id: string): string | null => {
		for (const [key, value] of Object.entries(alias)) {
			if (id === key || id.startsWith(key + "/")) {
				const replacement = id.replace(key, value);
				return replacement;
			}
		}
		return null;
	};

	// Try different extensions
	const tryExtensions = (basePath: string): string | null => {
		for (const ext of extensions) {
			const fullPath = basePath + ext;
			if (existsSync(fullPath)) {
				return fullPath;
			}
		}
		return null;
	};

	// Try index files
	const tryIndexFiles = (dirPath: string): string | null => {
		if (!tryIndex) return null;

		for (const ext of extensions) {
			const indexPath = join(dirPath, `index${ext}`);
			if (existsSync(indexPath)) {
				return indexPath;
			}
		}
		return null;
	};

	// Resolve relative paths
	const resolveRelative = (id: string, importer: string): string | null => {
		if (!importer) return null;

		if (id.startsWith("./") || id.startsWith("../")) {
			const importerDir = importer.substring(0, importer.lastIndexOf("/"));
			const resolvedPath = resolve(importerDir, id);

			// Try as file
			const withExt = tryExtensions(resolvedPath);
			if (withExt) return withExt;

			// Try as directory
			const indexFile = tryIndexFiles(resolvedPath);
			if (indexFile) return indexFile;
		}

		return null;
	};

	// Resolve node_modules
	const resolveNodeModules = async (id: string, startDir: string): Promise<string | null> => {
		let currentDir = startDir;

		while (currentDir !== resolve(currentDir, "..")) {
			const nodeModulesPath = join(currentDir, "node_modules", id);

			// Try as file
			const withExt = tryExtensions(nodeModulesPath);
			if (withExt) return withExt;

			// Try package.json main field
			const packageJsonPath = join(nodeModulesPath, "package.json");
			if (existsSync(packageJsonPath)) {
				try {
					const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
					for (const field of mainFields) {
						if (packageJson[field]) {
							const mainPath = join(nodeModulesPath, packageJson[field]);
							if (existsSync(mainPath)) {
								return mainPath;
							}
						}
					}
				} catch {
					// Ignore
				}
			}

			// Try index file
			const indexFile = tryIndexFiles(nodeModulesPath);
			if (indexFile) return indexFile;

			currentDir = resolve(currentDir, "..");
		}

		return null;
	};

	return {
		async resolve(id: string, importer?: string): Promise<string | null> {
			// 1. Handle workspace packages
			const workspaceResolved = await resolveWorkspacePackage(id);
			if (workspaceResolved) {
				return workspaceResolved;
			}

			// 2. Handle alias
			const aliasResolved = resolveAlias(id);
			if (aliasResolved) {
				return aliasResolved;
			}

			// 3. Handle relative imports
			if (importer) {
				const relativeResolved = resolveRelative(id, importer);
				if (relativeResolved) {
					return relativeResolved;
				}
			}

			// 4. Handle absolute paths
			if (id.startsWith("/") || /^[a-zA-Z]:/.test(id)) {
				if (existsSync(id)) {
					return id;
				}
				const withExt = tryExtensions(id);
				if (withExt) return withExt;
			}

			// 5. Handle node_modules
			const startDir = importer ? importer.substring(0, importer.lastIndexOf("/")) : root;
			const nodeResolved = await resolveNodeModules(id, startDir);
			if (nodeResolved) {
				return nodeResolved;
			}

			return null;
		},

		async load(id: string): Promise<string | null> {
			try {
				const stats = await stat(id);
				if (stats.isFile()) {
					return await readFile(id, "utf-8");
				}
			} catch {
				// File doesn't exist
			}
			return null;
		},
	};
}
