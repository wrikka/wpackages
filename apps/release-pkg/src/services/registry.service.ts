import { executeCommandStrict, executeCommand, isCommandSuccess } from "../utils/command";

export type Registry = "npm" | "jsr" | "github" | "verdaccio" | "custom";

export interface RegistryConfig {
	type: Registry;
	url: string;
	token?: string | undefined;
	scope?: string | undefined;
}

export interface PublishResult {
	success: boolean;
	url?: string | undefined;
	error?: string | undefined;
}

export class RegistryService {
	private readonly registries: Record<string, string> = {
		npm: "https://registry.npmjs.org",
		jsr: "https://jsr.io",
		github: "https://npm.pkg.github.com",
		"pkg.pr.new": "https://pkg.pr.new",
	};

	/**
	 * Publish to multiple registries
	 */
	async publishToRegistries(
		configs: RegistryConfig[],
	): Promise<Map<string, PublishResult>> {
		const results = new Map<string, PublishResult>();

		for (const config of configs) {
			const result = await this.publishToRegistry(config);
			results.set(config.type, result);
		}

		return results;
	}

	/**
	 * Publish to a single registry
	 */
	async publishToRegistry(config: RegistryConfig): Promise<PublishResult> {
		try {
			switch (config.type) {
				case "npm":
					return await this.publishToNPM(config);
				case "jsr":
					return await this.publishToJSR(config);
				case "github":
					return await this.publishToGitHub(config);
				default:
					return await this.publishToCustomRegistry(config);
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Publish to NPM
	 */
	private async publishToNPM(config: RegistryConfig): Promise<PublishResult> {
		const args = ["publish"];

		if (config.url && config.url !== this.registries["npm"]) {
			args.push("--registry", config.url);
		}

		args.push("--access", "public");

		if (config.token) {
			// Set NPM_TOKEN environment variable
			await executeCommandStrict("npm", args.filter(Boolean) as string[], {
				env: { ...process.env, NPM_TOKEN: config.token },
			});
		} else {
			await executeCommandStrict("npm", args.filter(Boolean) as string[]);
		}

		return {
			success: true,
			url: config.url ?? this.registries["npm"],
		};
	}

	/**
	 * Publish to JSR (JavaScript Registry)
	 */
	private async publishToJSR(_config: RegistryConfig): Promise<PublishResult> {
		await executeCommandStrict("npx", ["jsr", "publish"]);

		return {
			success: true,
			url: this.registries["jsr"],
		};
	}

	/**
	 * Publish to GitHub Packages
	 */
	private async publishToGitHub(config: RegistryConfig): Promise<PublishResult> {
		const args = [
			"publish",
			"--registry",
			this.registries["github"],
			"--access",
			"public",
		];

		if (config.token) {
			// Create .npmrc with GitHub token
			const npmrc = `${this.registries["github"]}/:_authToken=${config.token}`;
			await executeCommandStrict("npm", args.filter(Boolean) as string[], {
				env: { ...process.env, NPM_CONFIG_USERCONFIG: npmrc },
			});
		} else {
			await executeCommandStrict("npm", args.filter(Boolean) as string[]);
		}

		return {
			success: true,
			url: this.registries["github"],
		};
	}

	/**
	 * Publish to custom registry
	 */
	private async publishToCustomRegistry(
		config: RegistryConfig,
	): Promise<PublishResult> {
		const args = ["publish", "--registry", config.url, "--access", "public"];

		if (config.token) {
			await executeCommandStrict("npm", args.filter(Boolean) as string[], {
				env: { ...process.env, NPM_TOKEN: config.token },
			});
		} else {
			await executeCommandStrict("npm", args.filter(Boolean) as string[]);
		}

		return {
			success: true,
			url: config.url,
		};
	}

	/**
	 * Check if package exists in registry
	 */
	async packageExists(
		packageName: string,
		version: string,
		registry: RegistryConfig,
	): Promise<boolean> {
		const registryUrl = registry.url || this.registries[registry.type] || registry.url;

		const result = await executeCommand("npm", [
			"view",
			`${packageName}@${version}`,
			"version",
			"--registry",
			registryUrl,
		]);

		return isCommandSuccess(result.exitCode);
	}

	/**
	 * Get registry URL by type
	 */
	getRegistryUrl(type: Registry): string {
		return this.registries[type] || type;
	}
}
