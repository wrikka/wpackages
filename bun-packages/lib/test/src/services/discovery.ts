import { glob } from "glob";
import fs from "node:fs/promises";
import path from "node:path";

interface TestFile {
	path: string;
	relativePath: string;
	size: number;
	modified: Date;
	type: "test" | "spec" | "integration" | "unit" | "e2e";
	priority: number;
}

interface DiscoveryOptions {
	patterns?: string[];
	exclude?: string[];
	include?: string[];
	maxDepth?: number;
	followSymlinks?: boolean;
	cache?: boolean;
}

class TestDiscovery {
	private cache = new Map<string, TestFile[]>();
	private cacheTimestamps = new Map<string, number>();
	private readonly CACHE_TTL = 30000; // 30 seconds

	async discoverTests(
		cwd: string,
		options: DiscoveryOptions = {},
	): Promise<TestFile[]> {
		const cacheKey = this.getCacheKey(cwd, options);

		// Check cache first
		if (options.cache && this.isCacheValid(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		const {
			patterns = [
				"**/*.test.{ts,js,mjs,cjs}",
				"**/*.spec.{ts,js,mjs,cjs}",
				"**/test.{ts,js,mjs,cjs}",
				"**/tests/**/*.{ts,js,mjs,cjs}",
			],
			exclude = [
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"**/coverage/**",
				"**/.git/**",
				"**/.*/**",
			],
			include,
			maxDepth = 10,
			followSymlinks = false,
		} = options;

		// Build glob patterns
		const globPatterns = include ? include : patterns;

		// Discover files
		const files = await this.globFiles(cwd, globPatterns, {
			exclude,
			maxDepth,
			followSymlinks,
		});

		// Process and categorize files
		const testFiles = await this.processFiles(files, cwd);

		// Sort by priority and modification time
		testFiles.sort((a, b) => {
			if (a.priority !== b.priority) {
				return b.priority - a.priority; // Higher priority first
			}
			return b.modified.getTime() - a.modified.getTime(); // More recent first
		});

		// Cache results
		if (options.cache) {
			this.cache.set(cacheKey, testFiles);
			this.cacheTimestamps.set(cacheKey, Date.now());
		}

		return testFiles;
	}

	private getCacheKey(cwd: string, options: DiscoveryOptions): string {
		return JSON.stringify({ cwd, options });
	}

	private isCacheValid(key: string): boolean {
		const timestamp = this.cacheTimestamps.get(key);
		return timestamp ? Date.now() - timestamp < this.CACHE_TTL : false;
	}

	private async globFiles(
		cwd: string,
		patterns: string[],
		options: {
			exclude: string[];
			maxDepth: number;
			followSymlinks: boolean;
		},
	): Promise<string[]> {
		const allFiles: string[] = [];

		for (const pattern of patterns) {
			try {
				const files = await glob(pattern, {
					cwd,
					absolute: true,
					dot: false,
					ignore: options.exclude,
					maxDepth: options.maxDepth,
					follow: options.followSymlinks,
				});
				allFiles.push(...files);
			} catch (error: any) {
				console.warn(`Failed to glob pattern ${pattern}:`, error.message);
			}
		}

		// Remove duplicates
		return [...new Set(allFiles)];
	}

	private async processFiles(files: string[], cwd: string): Promise<TestFile[]> {
		const testFiles: TestFile[] = [];

		for (const file of files) {
			try {
				const stats = await fs.stat(file);
				const relativePath = path.relative(cwd, file);
				const type = this.determineTestType(file, relativePath);
				const priority = this.calculatePriority(file, relativePath, type);

				testFiles.push({
					path: file,
					relativePath,
					size: stats.size,
					modified: stats.mtime,
					type,
					priority,
				});
			} catch (error: any) {
				console.warn(`Failed to stat file ${file}:`, error.message);
			}
		}

		return testFiles;
	}

	private determineTestType(file: string, relativePath: string): TestFile["type"] {
		const lowerPath = file.toLowerCase();
		const lowerRelative = relativePath.toLowerCase();

		// Integration tests
		if (lowerPath.includes("integration") || lowerRelative.includes("integration")) {
			return "integration";
		}

		// E2E tests
		if (lowerPath.includes("e2e") || lowerRelative.includes("e2e")) {
			return "e2e";
		}

		// Unit tests (explicit)
		if (lowerPath.includes("unit") || lowerRelative.includes("unit")) {
			return "unit";
		}

		// Default: test or spec
		return lowerPath.includes(".test.") ? "test" : "spec";
	}

	private calculatePriority(
		file: string,
		relativePath: string,
		type: TestFile["type"],
	): number {
		let priority = 100; // Base priority

		// Type-based priority
		switch (type) {
			case "unit":
				priority += 50;
				break;
			case "test":
				priority += 40;
				break;
			case "spec":
				priority += 30;
				break;
			case "integration":
				priority += 20;
				break;
			case "e2e":
				priority += 10;
				break;
		}

		// Path-based priority adjustments
		if (relativePath.includes("core") || relativePath.includes("essential")) {
			priority += 25;
		}

		if (relativePath.includes("slow") || relativePath.includes("performance")) {
			priority -= 20;
		}

		// File size consideration (smaller files are usually faster)
		if (file.includes(".test.") || file.includes(".spec.")) {
			// No size penalty for standard test files
		} else {
			// Penalize larger files
			const sizePenalty = Math.min(20, Math.floor(file.length / 1000));
			priority -= sizePenalty;
		}

		return Math.max(0, priority);
	}

	async getChangedFiles(
		cwd: string,
		since: Date,
		options: DiscoveryOptions = {},
	): Promise<TestFile[]> {
		const allFiles = await this.discoverTests(cwd, options);

		return allFiles.filter(file => file.modified > since);
	}

	async getTestsByType(
		cwd: string,
		type: TestFile["type"],
		options: DiscoveryOptions = {},
	): Promise<TestFile[]> {
		const allFiles = await this.discoverTests(cwd, options);

		return allFiles.filter(file => file.type === type);
	}

	async getTestsByPattern(
		cwd: string,
		pattern: RegExp,
		options: DiscoveryOptions = {},
	): Promise<TestFile[]> {
		const allFiles = await this.discoverTests(cwd, options);

		return allFiles.filter(file => pattern.test(file.relativePath));
	}

	clearCache(): void {
		this.cache.clear();
		this.cacheTimestamps.clear();
	}

	getCacheStats(): {
		size: number;
		keys: string[];
		ttl: number;
	} {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
			ttl: this.CACHE_TTL,
		};
	}
}

export const testDiscovery = new TestDiscovery();
export { type DiscoveryOptions, TestDiscovery, type TestFile };
