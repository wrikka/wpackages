import { confirm, intro, log, note, outro, spinner } from "@clack/prompts";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { MESSAGES } from "../constant";
import { ensureDirectoryExists, handleCancel } from "../lib/clack-prompt";
import { ConfigService } from "../lib/config";
import { runGitCommand } from "../utils";

export const syncToRemote = async () => {
	intro(MESSAGES.TITLE_SYNC_REMOTE);

	const config = await ConfigService.load();

	if (!config.remote?.url) {
		outro(MESSAGES.ERROR_NO_REMOTE);
		note(pc.dim("Run \"init\" command to configure a remote repository"));
		process.exit(1);
	}

	if (config.files.length === 0) {
		outro(pc.yellow(MESSAGES.ERROR_NO_FILES));
		process.exit(0);
	}

	const shouldSync = await confirm({
		message: MESSAGES.PROMPT_SYNC_REMOTE(config.remote.url),
	});
	handleCancel(shouldSync);

	if (!shouldSync) {
		outro(pc.yellow("Sync cancelled."));
		process.exit(0);
	}

	const s = spinner();
	s.start("📤 Syncing files to remote repository...");

	try {
		log.step("Copying files to dotfiles directory...");
		config.files.forEach(file => {
			if (!existsSync(file.source)) {
				log.warning(`Source file not found, skipping: ${file.source}`);
				return;
			}
			const targetDir = join(file.target, "..");
			ensureDirectoryExists(targetDir);
			copyFileSync(file.source, file.target);
		});

		const gitDir = join(config.dotfilesDir, ".git");

		if (!existsSync(gitDir)) {
			log.step("Initializing new Git repository...");
			runGitCommand("git init", config.dotfilesDir);
			runGitCommand("git config --local user.name \"Dotfiles Manager\"", config.dotfilesDir);
			runGitCommand("git config --local user.email \"dotfiles@manager\"", config.dotfilesDir);
			runGitCommand(`git remote add origin ${config.remote.url}`, config.dotfilesDir);
		}

		log.step("Staging changes...");
		runGitCommand("git add .", config.dotfilesDir);

		log.step("Committing changes...");
		try {
			runGitCommand("git commit -m \"Update dotfiles via dotfile-manager\"", config.dotfilesDir);
		} catch (e) {
			if (e instanceof Error && e.message.includes("nothing to commit")) {
				log.info("No changes to commit.");
			} else {
				throw e;
			}
		}

		log.step("Pushing changes to remote...");
		runGitCommand(`git push -u origin ${config.remote.branch}`, config.dotfilesDir);

		s.stop(MESSAGES.SUCCESS_SYNC_REMOTE);
		outro(pc.green(MESSAGES.SUCCESS_SYNC_REMOTE));
	} catch (error: unknown) {
		s.stop("❌ Failed to sync");
		outro(MESSAGES.ERROR_SYNC_FAILED);
		if (error instanceof Error) {
			note(pc.red(error.message));
		}
		process.exit(1);
	}
};
