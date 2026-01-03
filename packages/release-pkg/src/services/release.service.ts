import pc from "picocolors";
import { createReleaseConfig } from "../config/index";
import type { ReleaseOptions, ReleaseResult } from "../types/index";
import { ChangelogService, GitService, PublishService, VersionService } from "./index";

const versionService = new VersionService();
const gitService = new GitService();
const changelogService = new ChangelogService();
const publishService = new PublishService();

const validate = async (config: ReleaseOptions): Promise<void> => {
	const isGitRepo = await gitService.isGitRepository();
	if (!isGitRepo) {
		throw new Error("Not a git repository");
	}

	if (!config.noGit) {
		const hasChanges = await gitService.hasUncommittedChanges();
		if (hasChanges) {
			throw new Error(
				"Working directory has uncommitted changes. Please commit or stash them first.",
			);
		}

		const hasRemote = await gitService.hasRemote();
		if (!hasRemote) {
			throw new Error("No git remote configured");
		}
	}

	await versionService.getPackageInfo();
};

export const release = async (options: Partial<ReleaseOptions> = {}): Promise<ReleaseResult> => {
	const config = createReleaseConfig(options);
	const startTime = Date.now();

	try {
		await validate(config);

		const packageJson = await versionService.getPackageInfo();
		const currentVersion = packageJson.version;

		if (!config.type && !config.version) {
			throw new Error("Release type or version must be specified");
		}

		const versionBump = config.version
			? { from: currentVersion, to: config.version, type: "custom" as const }
			: await versionService.bumpVersion(config.type!, config.preid);

		const newVersion = versionBump.to;

		if (!config.silent) {
			console.log(
				pc.cyan(`\n📦 Releasing ${pc.bold(packageJson.name)} ${pc.bold(currentVersion)} → ${pc.bold(newVersion)}\n`),
			);
		}

		if (config.dryRun) {
			if (!config.silent) {
				console.log(pc.yellow("🔍 Dry run mode - no changes will be made\n"));
			}
			return {
				success: true,
				version: newVersion,
				previousVersion: currentVersion,
				published: false,
				duration: Date.now() - startTime,
			};
		}

		await versionService.updatePackageJson(newVersion);
		if (config.verbose) console.log(pc.green("✓ Updated package.json"));

		let changelogContent: string | undefined;
		if (!config.noChangelog) {
			const lastTag = await gitService.getLastTag();
			const commits = await gitService.getCommits(lastTag);
			changelogContent = await changelogService.generate(
				newVersion,
				commits,
			);
			await changelogService.update(changelogContent);
			if (config.verbose) console.log(pc.green("✓ Updated CHANGELOG.md"));
		}

		if (!config.noGit) {
			const message = config.message?.replace("{version}", newVersion)
				|| `chore: release v${newVersion}`;
			await gitService.commit(message);
			if (config.verbose) console.log(pc.green("✓ Committed changes"));

			const tagName = `${config.tag}${newVersion}`;
			await gitService.tag(tagName, `Release ${newVersion}`);
			if (config.verbose) console.log(pc.green(`✓ Created tag ${tagName}`));

			await gitService.push(true);
			if (config.verbose) console.log(pc.green("✓ Pushed to remote"));
		}

		let published = false;
		if (!config.noPublish) {
			const alreadyPublished = await publishService.isPublished(
				packageJson.name,
				newVersion,
			);

			if (!alreadyPublished) {
				await publishService.publish();
				published = true;
				if (config.verbose) console.log(pc.green("✓ Published to npm"));
			} else {
				if (!config.silent) {
					console.log(pc.yellow(`⚠ Version ${newVersion} already published`));
				}
			}
		}

		const duration = Date.now() - startTime;

		if (!config.silent) {
			console.log(
				pc.green(
					`\n✨ Successfully released ${pc.bold(newVersion)} in ${duration}ms\n`,
				),
			);
		}

		return {
			success: true,
			version: newVersion,
			previousVersion: currentVersion,
			changelog: changelogContent,
			tag: config.noGit ? undefined : `${config.tag}${newVersion}`,
			published,
			duration,
		};
	} catch (error) {
		if (!config.silent) {
			console.error(pc.red("\n❌ Release failed:"), error);
		}
		throw error;
	}
};
