import { execa } from "execa";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface PreviewOptions {
	commitHash?: string | undefined;
	prNumber?: number | undefined;
	registry?: string | undefined;
	tag?: string | undefined;
	ttl?: number | undefined; // Time to live in days
	dryRun?: boolean | undefined;
}

export interface PreviewResult {
	url: string;
	installCommand: string;
	packageName: string;
	version: string;
	commitHash: string;
	prNumber?: number | undefined;
	expiresAt?: Date | undefined;
}

export class PreviewService {
	private defaultRegistry = "https://pkg.pr.new";

	/**
	 * Publish a preview release
	 */
	async publishPreview(options: PreviewOptions = {}): Promise<PreviewResult> {
		const packageInfo = await this.getPackageInfo();
		const commitHash = options.commitHash || (await this.getCurrentCommit());
		const version = await this.generatePreviewVersion(packageInfo.version, commitHash);

		// Update package.json with preview version
		await this.updatePackageVersion(version);

		try {
			// Build the package
			await this.buildPackage();

			// Publish to preview registry
			if (!options.dryRun) {
				const registry = options.registry || this.defaultRegistry;
				await this.publishToRegistry(registry, options.tag);
			}

			const url = this.generatePreviewUrl(
				packageInfo.name,
				commitHash,
				options.prNumber,
			);

			const result: PreviewResult = {
				url,
				installCommand: this.generateInstallCommand(url),
				packageName: packageInfo.name,
				version,
				commitHash: commitHash ?? "",
				prNumber: options.prNumber,
			};

			if (options.ttl) {
				result.expiresAt = new Date(Date.now() + options.ttl * 24 * 60 * 60 * 1000);
			}

			return result;
		} finally {
			// Restore original version
			await this.updatePackageVersion(packageInfo.version);
		}
	}

	/**
	 * Generate preview version from commit hash
	 */
	private async generatePreviewVersion(
		baseVersion: string,
		commitHash: string,
	): Promise<string> {
		const timestamp = Date.now();
		const shortHash = commitHash.substring(0, 7);
		return `${baseVersion}-preview.${timestamp}.${shortHash}`;
	}

	/**
	 * Generate preview URL
	 */
	private generatePreviewUrl(
		packageName: string,
		commitHash: string,
		prNumber?: number,
	): string {
		const cleanName = packageName.startsWith("@")
			? packageName.substring(1)
			: packageName;

		if (prNumber) {
			return `${this.defaultRegistry}/${cleanName}@${prNumber}`;
		}

		return `${this.defaultRegistry}/${cleanName}@${commitHash.substring(0, 7)}`;
	}

	/**
	 * Generate install command
	 */
	private generateInstallCommand(url: string): string {
		return `npm install ${url}`;
	}

	/**
	 * Get current git commit hash
	 */
	private async getCurrentCommit(): Promise<string> {
		const result = await execa("git", ["rev-parse", "HEAD"]);
		return result.stdout.trim();
	}

	/**
	 * Get package info from package.json
	 */
	private async getPackageInfo(): Promise<{ name: string; version: string }> {
		const packageJsonPath = join(process.cwd(), "package.json");
		const content = await readFile(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(content);
		return {
			name: packageJson.name,
			version: packageJson.version || "0.0.0",
		};
	}

	/**
	 * Update package.json version
	 */
	private async updatePackageVersion(version: string): Promise<void> {
		const packageJsonPath = join(process.cwd(), "package.json");
		const content = await readFile(packageJsonPath, "utf-8");
		const packageJson = JSON.parse(content);
		packageJson.version = version;
		await writeFile(
			packageJsonPath,
			JSON.stringify(packageJson, null, 2) + "\n",
		);
	}

	/**
	 * Build the package
	 */
	private async buildPackage(): Promise<void> {
		try {
			// Try common build commands
			const packageJsonPath = join(process.cwd(), "package.json");
			const content = await readFile(packageJsonPath, "utf-8");
			const packageJson = JSON.parse(content);

			if (packageJson.scripts?.build) {
				await execa("npm", ["run", "build"], { stdio: "inherit" });
			} else if (packageJson.scripts?.prepublishOnly) {
				await execa("npm", ["run", "prepublishOnly"], { stdio: "inherit" });
			}
		} catch {
			console.warn("Build step failed or not configured");
		}
	}

	/**
	 * Publish to registry
	 */
	private async publishToRegistry(
		registry: string,
		tag = "preview",
	): Promise<void> {
		await execa(
			"npm",
			["publish", "--registry", registry, "--tag", tag, "--access", "public"],
			{ stdio: "inherit" },
		);
	}

	/**
	 * Create GitHub comment for PR
	 */
	async createPRComment(
		result: PreviewResult,
		playgroundUrl?: string,
	): Promise<string> {
		let comment = `## 📦 Preview Package Published\n\n`;
		comment += `**Package:** \`${result.packageName}@${result.version}\`\n`;
		comment += `**Commit:** \`${result.commitHash.substring(0, 7)}\`\n\n`;

		comment += `### 🚀 Install\n\`\`\`bash\n${result.installCommand}\n\`\`\`\n\n`;

		if (playgroundUrl) {
			comment += `### 🎮 Try it online\n`;
			comment += `[Open in Playground](${playgroundUrl})\n\n`;
		}

		comment += `### 📖 Usage\n\`\`\`bash\n`;
		comment += `# Using npm\n`;
		comment += `npm install ${result.url}\n\n`;
		comment += `# Using bun\n`;
		comment += `bun add ${result.url}\n\n`;
		comment += `# Using pnpm\n`;
		comment += `pnpm add ${result.url}\n`;
		comment += `\`\`\`\n\n`;

		if (result.expiresAt) {
			comment += `⏰ *This preview expires on ${result.expiresAt.toLocaleDateString()}*\n`;
		}

		return comment;
	}
}
