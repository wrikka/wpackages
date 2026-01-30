/**
 * Tauri Project Generator
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
	generateBuildRs,
	generateCargoToml,
	generateIndexHtml,
	generateMainRs,
	generatePackageJson,
	generateReadme,
	generateTauriConfig,
} from "./templates";
import type { AppConfig } from "./types";
import { defaultConfig } from "./types";

/**
 * Generate Tauri project
 */
export async function generateProject(config: AppConfig): Promise<string> {
	const fullConfig = {
		...defaultConfig,
		...config,
	};

	const projectDir = join(config.outputDir || "./dist", config.name);

	// Create directories
	await mkdir(projectDir, { recursive: true });
	await mkdir(join(projectDir, "src-tauri"), { recursive: true });
	await mkdir(join(projectDir, "src-tauri", "src"), { recursive: true });
	await mkdir(join(projectDir, "dist"), { recursive: true });

	// Generate files
	const files = {
		"package.json": generatePackageJson(fullConfig),
		"README.md": generateReadme(fullConfig),
		"dist/index.html": generateIndexHtml(fullConfig),
		"src-tauri/tauri.conf.json": generateTauriConfig(fullConfig),
		"src-tauri/Cargo.toml": generateCargoToml(fullConfig),
		"src-tauri/build.rs": generateBuildRs(),
		"src-tauri/src/main.rs": generateMainRs(fullConfig),
	};

	// Write files
	for (const [path, content] of Object.entries(files)) {
		await writeFile(join(projectDir, path), content, "utf-8");
	}

	return projectDir;
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Generate app identifier
 */
export function generateIdentifier(name: string): string {
	const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
	return `com.${cleanName}.app`;
}

/**
 * Sanitize app name
 */
export function sanitizeName(name: string): string {
	return name.replace(/[^a-zA-Z0-9-_]/g, "-");
}
