/**
 * Module graph for @wpackages/devserver
 * Tracks module dependencies and supports HMR
 */

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import type { TransformCache } from "./cache.service";

export interface ModuleNode {
	readonly id: string;
	readonly url: string;
	readonly type: "js" | "ts" | "css" | "json" | "html" | "asset";
	content?: string;
	transformed?: string;
	map?: string;
	readonly dependencies: Set<string>;
	readonly dependents: Set<string>;
	lastModified: number;
	hash: string;
	readonly isVirtual: boolean;
}

export interface ModuleGraph {
	readonly getModule: (id: string) => ModuleNode | undefined;
	readonly ensureModule: (id: string, url: string, type: ModuleNode["type"]) => Promise<ModuleNode>;
	readonly updateModule: (id: string, content: string, transformed?: string, map?: string) => void;
	readonly invalidateModule: (id: string) => void;
	readonly getDependents: (id: string) => readonly ModuleNode[];
	readonly getDependencies: (id: string) => readonly ModuleNode[];
	readonly clear: () => void;
	readonly getStats: () => { modules: number; edges: number };
}

export function createModuleGraph(transformCache: TransformCache): ModuleGraph {
	const modules = new Map<string, ModuleNode>();
	const urlToId = new Map<string, string>();

	const getModuleId = (url: string): string => {
		const existing = urlToId.get(url);
		if (existing) return existing;

		const id = createHash("md5").update(url).digest("hex").slice(0, 16);
		urlToId.set(url, id);
		return id;
	};

	const parseDependencies = (content: string, type: ModuleNode["type"]): string[] => {
		const deps: string[] = [];

		if (content) {
			// Import statements
			const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
			let match;
			while ((match = importRegex.exec(content)) !== null) {
				deps.push(match[1]!);
			}

			// Dynamic imports
			const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
			while ((match = dynamicImportRegex.exec(content)) !== null) {
				deps.push(match[1]!);
			}

			// Require calls (for CommonJS)
			const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
			while ((match = requireRegex.exec(content)) !== null) {
				deps.push(match[1]!);
			}
		} else if (type === "css") {
			// @import statements
			const importRegex = /@import\s+['"]([^'"]+)['"]/g;
			let match;
			while ((match = importRegex.exec(content)) !== null) {
				deps.push(match[1]!);
			}
		}

		return deps;
	};

	const createModuleNode = async (id: string, url: string, type: ModuleNode["type"]): Promise<ModuleNode> => {
		let content: string | undefined;
		let lastModified = Date.now();
		let hash = "";

		if (!url.startsWith("virtual:")) {
			try {
				const stats = await stat(url);
				lastModified = stats.mtimeMs;
				content = await readFile(url, "utf-8");
				hash = createHash("md5").update(content).digest("hex");
			} catch (error) {
				console.warn(`Failed to read module ${url}:`, error);
			}
		}

		const moduleNode: ModuleNode = {
			id,
			url,
			type,
			content: content ?? "",
			lastModified,
			hash,
			dependencies: new Set(),
			dependents: new Set(),
			isVirtual: url.startsWith("virtual:"),
		};

		// Parse dependencies
		if (content) {
			const deps = parseDependencies(content, type);
			for (const dep of deps) {
				// Convert relative paths to absolute URLs
				let depUrl = dep;
				if (dep.startsWith("./") || dep.startsWith("../")) {
					const baseUrl = url.substring(0, url.lastIndexOf("/"));
					depUrl = new URL(dep, `file://${baseUrl}/`).href.replace("file://", "");
				}
				moduleNode.dependencies.add(depUrl);
			}
		}

		return moduleNode;
	};

	return {
		getModule(id: string): ModuleNode | undefined {
			return modules.get(id);
		},

		async ensureModule(id: string, url: string, type: ModuleNode["type"]): Promise<ModuleNode> {
			let moduleNode = modules.get(id);
			if (!moduleNode) {
				moduleNode = await createModuleNode(id, url, type);
				modules.set(id, moduleNode);
			}
			return moduleNode;
		},

		updateModule(id: string, content: string, transformed?: string, map?: string): void {
			const moduleNode = modules.get(id);
			if (!moduleNode) return;

			moduleNode.content = content;
			moduleNode.transformed = transformed ?? undefined;
			moduleNode.map = map ?? undefined;
			moduleNode.lastModified = Date.now();
			moduleNode.hash = createHash("md5").update(content).digest("hex");

			// Update transform cache
			if (transformed) {
				void transformCache.set(id, {
					content: transformed,
					map: map ?? undefined,
					timestamp: moduleNode.lastModified,
					hash: moduleNode.hash,
				});
			}
		},

		invalidateModule(id: string): void {
			const moduleNode = modules.get(id);
			if (!moduleNode) return;

			// Invalidate dependents (modules that depend on this module)
			for (const dependentId of moduleNode.dependents) {
				const dependent = modules.get(dependentId);
				if (dependent) {
					dependent.transformed = undefined;
					dependent.map = undefined;
				}
			}

			// Clear transform cache
			void transformCache.invalidate(id);
		},

		getDependents(id: string): readonly ModuleNode[] {
			const moduleNode = modules.get(id);
			if (!moduleNode) return [];

			return Array.from(moduleNode.dependents)
				.map(depId => modules.get(depId))
				.filter(Boolean) as ModuleNode[];
		},

		getDependencies(id: string): readonly ModuleNode[] {
			const moduleNode = modules.get(id);
			if (!moduleNode) return [];

			return Array.from(moduleNode.dependencies)
				.map(depUrl => {
					const depId = getModuleId(depUrl);
					return modules.get(depId);
				})
				.filter(Boolean) as ModuleNode[];
		},

		clear(): void {
			modules.clear();
			urlToId.clear();
		},

		getStats(): { modules: number; edges: number } {
			let edges = 0;
			for (const moduleNode of modules.values()) {
				edges += moduleNode.dependencies.size + moduleNode.dependents.size;
			}
			return {
				modules: modules.size,
				edges: edges / 2, // Each edge counted twice
			};
		},
	};
}
