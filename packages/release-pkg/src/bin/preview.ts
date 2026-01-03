#!/usr/bin/env node

import pc from "picocolors";
import { GitHubService } from "../services/github.service";
import { MonorepoService } from "../services/monorepo.service";
import { PreviewService } from "../services/preview.service";

interface PreviewCliOptions {
	commit?: string;
	pr?: number;
	registry?: string;
	tag?: string;
	ttl?: number;
	comment?: boolean;
	packages?: string[];
}

async function parseArgs(): Promise<PreviewCliOptions> {
	const args = process.argv.slice(2);
	const options: PreviewCliOptions = {
		comment: true, // Default to posting comment
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--commit" && args[i + 1]) {
			options.commit = args[++i] ?? "";
		} else if (arg === "--pr" && args[i + 1]) {
			options.pr = Number.parseInt(args[++i] ?? "0", 10);
		} else if (arg === "--registry" && args[i + 1]) {
			options.registry = args[++i] ?? "";
		} else if (arg === "--tag" && args[i + 1]) {
			options.tag = args[++i] ?? "";
		} else if (arg === "--ttl" && args[i + 1]) {
			options.ttl = Number.parseInt(args[++i] ?? "0", 10);
		} else if (arg === "--no-comment") {
			options.comment = false;
		} else if (arg === "--packages" && args[i + 1]) {
			options.packages = (args[++i] ?? "").split(",");
		}
	}

	return options;
}

async function main() {
	console.log(pc.cyan(pc.bold("\n📦 release - Preview Publisher\n")));

	try {
		const options = await parseArgs();
		const previewService = new PreviewService();
		const githubService = new GitHubService();
		const monorepoService = new MonorepoService();

		// Check if in monorepo
		const isMonorepo = await monorepoService.isMonorepo();

		if (isMonorepo) {
			console.log(pc.yellow("🔍 Detected monorepo"));

			const packages = options.packages
				? await monorepoService
					.getPackages()
					.then((pkgs) => pkgs.filter((pkg) => options.packages?.includes(pkg.name)))
				: await monorepoService.getChangedPackages();

			if (packages.length === 0) {
				console.log(pc.yellow("⚠️  No packages to publish"));
				return;
			}

			console.log(
				pc.cyan(`📦 Publishing ${packages.length} package(s)...`),
			);

			for (const pkg of packages) {
				if (pkg.private) {
					console.log(pc.gray(`⏭️  Skipping private package: ${pkg.name}`));
					continue;
				}

				console.log(pc.cyan(`\n📦 Publishing ${pkg.name}...`));

				// Change to package directory
				process.chdir(pkg.path);

				const result = await previewService.publishPreview({
					commitHash: options.commit,
					prNumber: options.pr,
					registry: options.registry,
					tag: options.tag,
					ttl: options.ttl,
				});

				console.log(pc.green(`✓ Published: ${result.url}`));
				console.log(pc.gray(`  Install: ${result.installCommand}`));
			}
		} else {
			// Single package
			console.log(pc.cyan("📦 Publishing preview..."));

			// Get PR info if available
			let prNumber = options.pr;
			if (!prNumber) {
				const prInfo = await githubService.getCurrentPR();
				if (prInfo) {
					prNumber = prInfo.number;
					console.log(pc.cyan(`🔗 Detected PR #${prNumber}`));
				}
			}

			const result = await previewService.publishPreview({
				commitHash: options.commit,
				prNumber,
				registry: options.registry,
				tag: options.tag,
				ttl: options.ttl,
			});

			console.log(pc.green(`\n✓ Preview published successfully!`));
			console.log(pc.cyan(`\n📦 Package: ${result.packageName}@${result.version}`));
			console.log(pc.cyan(`🔗 URL: ${result.url}`));
			console.log(pc.cyan(`📥 Install: ${result.installCommand}`));

			if (result.expiresAt) {
				console.log(
					pc.yellow(`\n⏰ Expires: ${result.expiresAt.toLocaleString()}`),
				);
			}

			// Post GitHub comment if enabled
			if (options.comment && prNumber) {
				const ghInstalled = await githubService.isGHInstalled();
				const ghAuthenticated = await githubService.isAuthenticated();

				if (ghInstalled && ghAuthenticated) {
					console.log(pc.cyan("\n💬 Posting comment to PR..."));

					const repoInfo = await githubService.getRepoInfo();
					if (repoInfo) {
						const comment = await previewService.createPRComment(result);

						await githubService.postPRComment({
							owner: repoInfo.owner,
							repo: repoInfo.repo,
							prNumber,
							body: comment,
							token: process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"] || "",
						});

						console.log(pc.green("✓ Comment posted successfully!"));
					}
				} else {
					console.log(
						pc.yellow(
							"\n⚠️  GitHub CLI not available, skipping comment",
						),
					);
				}
			}
		}

		console.log(pc.green(pc.bold("\n✨ Done!\n")));
	} catch (error) {
		console.error(pc.red("\n❌ Preview publish failed:"));
		console.error(
			pc.red(error instanceof Error ? error.message : String(error)),
		);
		process.exit(1);
	}
}

main();
