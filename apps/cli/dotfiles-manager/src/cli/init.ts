import { intro, note, outro, text } from "@clack/prompts";
import { homedir } from "node:os";
import { join } from "node:path";
import pc from "picocolors";
import { MESSAGES } from "../constant";
import { ensureDirectoryExists, handleCancel } from "../lib/clack-prompt";
import { type Config, CONFIG_PATH, ConfigService } from "../lib/config";

export const init = async () => {
	intro(MESSAGES.TITLE_INIT);

	const dotfilesDir = await text({
		message: MESSAGES.PROMPT_DOTFILES_DIR,
		placeholder: join(homedir(), ".dotfiles"),
		defaultValue: join(homedir(), ".dotfiles"),
		validate: (value) => {
			if (!value || value.trim() === "") return "Directory path is required";
		},
	});
	handleCancel(dotfilesDir);

	const remoteUrl = await text({
		message: MESSAGES.PROMPT_GIT_URL,
		placeholder: "https://github.com/user/dotfiles.git",
		validate: (value) => {
			if (value && typeof value === "string" && value.trim() !== "" && !value.startsWith("http")) {
				return "URL must start with http:// or https://";
			}
		},
	});
	handleCancel(remoteUrl);

	const pkg = await import("../../package.json");
	const repoUrl = pkg.repository.url.replace(".git", "");
	const schemaUrl = `${repoUrl}/blob/main/public/schema.json`;

	const config: Config = {
		$schema: schemaUrl,
		dotfilesDir: dotfilesDir as string,
		files: [],
		initialized: true,
		remote: remoteUrl ? { url: remoteUrl as string, branch: "main" } : undefined,
		mode: "copy",
	};

	ensureDirectoryExists(config.dotfilesDir);
	ConfigService.save(config);

	outro(pc.green(MESSAGES.SUCCESS_INIT));

	note(
		`📂 Dotfiles directory: ${pc.cyan(config.dotfilesDir)}${
			config.remote ? `\n🔗 Remote URL: ${pc.cyan(config.remote.url)}` : ""
		}\n⚙️  Config saved to: ${pc.dim(CONFIG_PATH)}`,
		"Next steps",
	);

	const nextSteps = `
		1. ${pc.cyan("wdotfiles add")} - Add files to your dotfiles directory.
		2. ${pc.cyan("wdotfiles sync-remote")} - Sync your dotfiles to the remote repository.
		3. ${pc.cyan("wdotfiles")} - See all available commands.
	`;
	note(nextSteps);

	process.exit(0);
};
