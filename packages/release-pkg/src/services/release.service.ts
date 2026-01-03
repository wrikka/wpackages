import pc from "picocolors";
import { createReleaseConfig } from "../config/index";
import type { Plugin, ReleaseContext, ReleaseOptions, ReleaseResult } from "../types/index";
import { ChangelogService, GitService, PublishService, VersionService } from "./index";
import { PipelineService } from "./pipeline.service";

class ReleaseOrchestrator {
	private pipeline: PipelineService;
	private context: ReleaseContext;

	constructor(options: Partial<ReleaseOptions>) {
		const config = createReleaseConfig(options);
		this.pipeline = new PipelineService([...(config.plugins || []), this.createCorePlugin()]);

		this.context = {
			options: config,
			result: {},
			services: {
				version: new VersionService(),
				git: new GitService(),
				changelog: new ChangelogService(),
				publish: new PublishService(),
			},
			state: new Map(),
		};
	}

	async run(): Promise<ReleaseResult> {
		const startTime = Date.now();
		try {
			await this.pipeline.executeHook("start", this.context);

			await this.pipeline.executeHook("end", this.context);

			const duration = Date.now() - startTime;
			this.context.result.duration = duration;
			this.context.result.success = true;

			if (!this.context.options.silent) {
				console.log(pc.green(`\n✨ Successfully released ${pc.bold(this.context.result.version)} in ${duration}ms\n`));
			}

			return this.context.result as ReleaseResult;
		} catch (error) {
			if (!this.context.options.silent) {
				console.error(pc.red("\n❌ Release failed:"), error);
			}
			throw error;
		}
	}

	private createCorePlugin(): Plugin {
		return {
			name: "core-release-plugin",
			hooks: {
				start: async (ctx) => {
					await this.pipeline.executeHook("before:validate", ctx);
					await this._validate(ctx);
					await this.pipeline.executeHook("after:validate", ctx);

					await this.pipeline.executeHook("before:bumpVersion", ctx);
					await this._bumpVersion(ctx);
					await this.pipeline.executeHook("after:bumpVersion", ctx);
				},
				end: async (ctx) => {
					await this._updatePackageJson(ctx);

					await this.pipeline.executeHook("before:changelog", ctx);
					await this._generateChangelog(ctx);
					await this.pipeline.executeHook("after:changelog", ctx);

					await this.pipeline.executeHook("before:gitCommit", ctx);
					await this._gitCommit(ctx);
					await this.pipeline.executeHook("after:gitCommit", ctx);

					await this.pipeline.executeHook("before:publish", ctx);
					await this._publish(ctx);
					await this.pipeline.executeHook("after:publish", ctx);
				},
			},
		};
	}

	private async _validate(ctx: ReleaseContext) {
		const { git, version } = ctx.services;
		if (!(await git.isGitRepository())) throw new Error("Not a git repository");
		if (!ctx.options.noGit) {
			if (!ctx.options.dryRun && (await git.hasUncommittedChanges())) {
				throw new Error("Working directory has uncommitted changes.");
			}
			if (!(await git.hasRemote())) throw new Error("No git remote configured");
		}
		await version.getPackageInfo();
	}

	private async _bumpVersion(ctx: ReleaseContext) {
		const { version: versionService } = ctx.services;
		const pkg = await versionService.getPackageInfo();
		ctx.result.previousVersion = pkg.version;

		const bump = ctx.options.version
			? { from: pkg.version, to: ctx.options.version, type: "custom" as const }
			: await versionService.bumpVersion(ctx.options.type!, ctx.options.preid);

		ctx.result.version = bump.to;
		ctx.state.set("versionBump", bump);

		if (!ctx.options.silent) {
			console.log(pc.cyan(`\n📦 Releasing ${pc.bold(pkg.name)} ${pc.bold(bump.from)} → ${pc.bold(bump.to)}\n`));
		}
		if (ctx.options.dryRun && !ctx.options.silent) {
			console.log(pc.yellow("🔍 Dry run mode - no changes will be made\n"));
		}
	}

	private async _updatePackageJson(ctx: ReleaseContext) {
		if (ctx.options.dryRun) return;
		const { version: versionService } = ctx.services;
		await versionService.updatePackageJson(ctx.result.version!);
		if (ctx.options.verbose) console.log(pc.green("✓ Updated package.json"));
	}

	private async _generateChangelog(ctx: ReleaseContext) {
		if (ctx.options.noChangelog) return;
		const { changelog: changelogService, git } = ctx.services;
		const lastTag = await git.getLastTag();
		const commits = await git.getCommits(lastTag);
		const content = await changelogService.generate(ctx.result.version!, commits, ctx.options.changelog);
		ctx.result.changelog = content;

		if (ctx.options.dryRun) return;

		await changelogService.update(content);
		if (ctx.options.verbose) console.log(pc.green("✓ Updated CHANGELOG.md"));
	}

	private async _gitCommit(ctx: ReleaseContext) {
		if (ctx.options.noGit) return;
		const version = ctx.result.version!;
		const tagName = `${ctx.options.tag}${version}`;
		ctx.result.tag = tagName;

		if (ctx.options.dryRun) return;

		const { git } = ctx.services;
		const message = ctx.options.message?.replace("{version}", version) || `chore: release v${version}`;
		await git.commit(message);
		if (ctx.options.verbose) console.log(pc.green("✓ Committed changes"));

		await git.tag(tagName, `Release ${version}`);
		if (ctx.options.verbose) console.log(pc.green(`✓ Created tag ${tagName}`));

		await git.push(true);
		if (ctx.options.verbose) console.log(pc.green("✓ Pushed to remote"));
	}

	private async _publish(ctx: ReleaseContext) {
		ctx.result.published = false;
		if (ctx.options.noPublish) return;

		const { publish: publishService, version: versionService } = ctx.services;
		const pkg = await versionService.getPackageInfo();
		const version = ctx.result.version!;
		const isAlreadyPublished = await publishService.isPublished(pkg.name, version);

		if (isAlreadyPublished) {
			if (!ctx.options.silent) {
				console.log(pc.yellow(`⚠ Version ${version} already published`));
			}
			return;
		}

		if (ctx.options.dryRun) return;

		await publishService.publish();
		ctx.result.published = true;
		if (ctx.options.verbose) console.log(pc.green("✓ Published to npm"));
	}
}

export const release = async (options: Partial<ReleaseOptions> = {}): Promise<ReleaseResult> => {
	const orchestrator = new ReleaseOrchestrator(options);
	return orchestrator.run();
};
