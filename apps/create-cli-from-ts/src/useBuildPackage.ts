import { spinner } from "@clack/prompts";
import * as fs from "fs";
import OpenAI from "openai";
import * as path from "path";
import {
	BUILTIN_MODULES,
	FILE_EXTENSIONS,
} from "./constant";
import { extractImports } from "./components/import-extractor";
import type {
	BundleState,
	BuildPCOptions,
	FileInfo,
	MainPackageJson,
	PackageStructure,
} from "./types";

// Re-export types for backward compatibility
export type { BundleState, BuildPCOptions, FileInfo, MainPackageJson, PackageStructure };

// Utility functions
export const useImportExtraction = () => {
	return extractImports;
};

export const usePathResolver = () => {
	return (importPath: string, currentFile: string): string | null => {
		if (importPath.startsWith(".")) {
			const currentDir = path.dirname(currentFile);
			const resolved = path.resolve(currentDir, importPath);

			for (const ext of FILE_EXTENSIONS) {
				const withExt = resolved + ext;
				if (fs.existsSync(withExt)) {
					return withExt;
				}
			}

			for (const ext of FILE_EXTENSIONS) {
				const indexFile = path.join(resolved, `index${ext}`);
				if (fs.existsSync(indexFile)) {
					return indexFile;
				}
			}
		}
		return null;
	};
};

export const useFileProcessor = (state: BundleState) => {
	const extractImports = useImportExtraction();
	const resolvePath = usePathResolver();

	return async (filePath: string): Promise<void> => {
		if (state.processedFiles.has(filePath) || !fs.existsSync(filePath)) {
			return;
		}

		state.processedFiles.add(filePath);
		const content = fs.readFileSync(filePath, "utf-8");
		const { imports, dependencies } = extractImports(content);

		// Add detected dependencies to state
		dependencies.forEach(dep => state.detectedDependencies.add(dep));

		const fileInfo: FileInfo = {
			path: filePath,
			content,
			imports,
		};

		state.allFiles.push(fileInfo);

		for (const importPath of imports) {
			const resolvedPath = resolvePath(importPath, filePath);
			if (resolvedPath) {
				await useFileProcessor(state)(resolvedPath);
			}
		}
	};
};

export const usePackageStructureCreator = () => {
	return (packageName: string, files: FileInfo[]): PackageStructure => {
		return {
			name: packageName,
			files,
		};
	};
};

export const usePackageFileCreator = () => {
	return async (
		packageStructure: PackageStructure,
		outputDir: string,
		detectedDeps: Set<string>,
		options?: BuildPCOptions,
	): Promise<string> => {
		const packagesDir = path.join(outputDir, packageStructure.name);
		const srcDir = path.join(packagesDir, "src");

		if (!fs.existsSync(packagesDir)) {
			fs.mkdirSync(packagesDir, { recursive: true });
		}
		if (!fs.existsSync(srcDir)) {
			fs.mkdirSync(srcDir, { recursive: true });
		}

		for (const file of packageStructure.files) {
			const fileName = path.basename(file.path);
			const destPath = path.join(srcDir, fileName);
			fs.writeFileSync(destPath, file.content);
		}

		// Read config template files
		const currentDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
		const configDir = path.join(currentDir, "config");

		// Copy and process package.json template
		const packageJsonTemplate = fs.readFileSync(path.join(configDir, "package.json"), "utf-8");

		// Get dependencies from main package.json
		const mainPackageJsonPath = path.join(outputDir, "package.json");
		let mainPackageJson: MainPackageJson = {};

		if (fs.existsSync(mainPackageJsonPath)) {
			try {
				mainPackageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, "utf-8"));
			} catch (error) {
				console.warn("⚠️ Could not read main package.json", error instanceof Error ? error.message : String(error));
			}
		}

		// Build dependencies object
		const dependencies: Record<string, string> = {};
		for (const dep of detectedDeps) {
			if (!BUILTIN_MODULES.includes(dep as typeof BUILTIN_MODULES[number])) {
				const version = mainPackageJson.dependencies?.[dep]
					|| mainPackageJson.devDependencies?.[dep]
					|| "^1.0.0";
				dependencies[dep] = version;
			}
		}

		// Replace template placeholders
		const processedPackageJson = packageJsonTemplate
			.replace(/{{PACKAGE_NAME}}/g, packageStructure.name)
			.replace(/{{DESCRIPTION}}/g, `Bundled package for ${packageStructure.name}`)
			.replace(/{{BIN_NAME}}/g, packageStructure.name)
			.replace(/{{KEYWORDS}}/g, "cli,typescript,bundler")
			.replace(/{{AUTHOR}}/g, mainPackageJson.author || "Unknown")
			.replace(/"{{DEPENDENCIES}}"/g, JSON.stringify(dependencies, null, 4).slice(1, -1));

		fs.writeFileSync(path.join(packagesDir, "package.json"), processedPackageJson);

		// Copy config files
		const configFiles = ["tsconfig.json", "biome.jsonc", "lefthook.yml"];
		for (const configFile of configFiles) {
			const configPath = path.join(configDir, configFile);
			if (fs.existsSync(configPath)) {
				fs.copyFileSync(configPath, path.join(packagesDir, configFile));
			}
		}

		// Copy .gitignore
		const gitignorePath = path.join(configDir, ".gitignore");
		if (fs.existsSync(gitignorePath)) {
			fs.copyFileSync(gitignorePath, path.join(packagesDir, ".gitignore"));
		}

		let readme = `# ${packageStructure.name}

Bundled package created by BuildPC

## Files included:
${packageStructure.files.map(f => `- ${path.basename(f.path)}`).join("\n")}

## Usage

\`\`\`bash
# Install dependencies
bun install

# Development
bun run dev

# Build
bun run build

# Lint
bun run lint

# Format
bun run format
\`\`\`
`;

		// AI-generated README and package.json enhancement
		if (options?.aiMode && options?.openaiKey) {
			try {
				const enhancedReadme = await useAIEnhancement()(readme, packageStructure, options.openaiKey);
				readme = enhancedReadme;

				// Also enhance package.json metadata
				const currentPackageJson = JSON.parse(fs.readFileSync(path.join(packagesDir, "package.json"), "utf-8"));
				const enhancedPackageJson = await useAIPackageEnhancement()(
					currentPackageJson,
					packageStructure,
					options.openaiKey,
				);
				fs.writeFileSync(path.join(packagesDir, "package.json"), JSON.stringify(enhancedPackageJson, null, 2));
			} catch (error) {
				console.warn("⚠️ AI enhancement failed, using default content", error instanceof Error ? error.message : String(error));
			}
		}

		fs.writeFileSync(path.join(packagesDir, "README.md"), readme);

		return packagesDir;
	};
};

export const useAIEnhancement = () => {
	return async (readme: string, packageStructure: PackageStructure, apiKey: string): Promise<string> => {
		const openai = new OpenAI({ apiKey });

		const prompt =
			`Enhance this README.md for a JavaScript/TypeScript package. Make it more comprehensive and professional:

${readme}

Package contains these files: ${packageStructure.files.map(f => path.basename(f.path)).join(", ")}

Add sections for:
- Better description
- Installation instructions
- API documentation
- Examples
- Contributing guidelines

Keep the existing structure but make it more detailed and professional.`;

		const completion = await openai.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "gpt-3.5-turbo",
			max_tokens: 1500,
		});

		return completion.choices[0]?.message?.content || readme;
	};
};

export const useAIPackageEnhancement = () => {
	return async (packageJson: MainPackageJson, packageStructure: PackageStructure, apiKey: string): Promise<MainPackageJson> => {
		const openai = new OpenAI({ apiKey });

		const prompt = `Enhance this package.json metadata for better discoverability and professionalism:

${JSON.stringify(packageJson, null, 2)}

Package contains these files: ${packageStructure.files.map(f => path.basename(f.path)).join(", ")}

Improve:
- description (make it more descriptive and professional)
- keywords (add relevant, searchable keywords)
- Add appropriate repository, bugs, and homepage URLs if missing
- Enhance any other metadata fields appropriately

Return only the enhanced JSON object, no explanations.`;

		const completion = await openai.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "gpt-3.5-turbo",
			max_tokens: 800,
		});

		try {
			const enhanced = JSON.parse(completion.choices[0]?.message?.content || "{}");
			return { ...packageJson, ...enhanced };
		} catch {
			return packageJson;
		}
	};
};

export const useAutoInstaller = () => {
	return async (packagesDir: string): Promise<void> => {
		const s = spinner();
		s.start("Installing dependencies...");

		try {
			await Bun.spawn(["bun", "install"], {
				cwd: packagesDir,
				stdio: ["ignore", "pipe", "pipe"],
			}).exited;
			s.stop("📦 Dependencies installed successfully");
		} catch (error) {
			s.stop("⚠️ Failed to install dependencies automatically");
			console.log("💡 Run: cd packages && bun install", error instanceof Error ? error.message : String(error));
		}
	};
};

// Main business logic function
export const buildPackageLogic = async (
	entryFile: string,
	packageName: string,
	options: BuildPCOptions,
): Promise<{
	state: BundleState;
	packageStructure: PackageStructure;
	packagesDir: string;
}> => {
	const absolutePath = path.resolve(entryFile);
	if (!fs.existsSync(absolutePath)) {
		throw new Error(`File not found: ${entryFile}`);
	}

	const state: BundleState = {
		processedFiles: new Set<string>(),
		allFiles: [],
		detectedDependencies: new Set<string>(),
	};

	const processFile = useFileProcessor(state);
	await processFile(absolutePath);

	const createPackageStructure = usePackageStructureCreator();
	const packageStructure = createPackageStructure(packageName, state.allFiles);

	const createPackageFiles = usePackageFileCreator();
	const outputDir = process.cwd();
	const packagesDir = await createPackageFiles(packageStructure, outputDir, state.detectedDependencies, options);

	// Auto-install dependencies
	const autoInstall = useAutoInstaller();
	await autoInstall(packagesDir);

	return {
		state,
		packageStructure,
		packagesDir,
	};
};
