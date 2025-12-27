import { intro, multiselect, outro, select } from "@clack/prompts";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";
import pc from "picocolors";
import { addFile } from "../cli/add";
import { init } from "../cli/init";
import { open } from "../cli/open";
import { remove } from "../cli/remove";
import { syncToLocal } from "../cli/sync-local";
import { syncToRemote } from "../cli/sync-remote";
import { MESSAGES, SUGGESTED_DOTFILES } from "../constant";
import { buildMainMenuOptions } from "../components";
import { handleCancel } from "../lib/clack-prompt";
import { loadDotfileConfig, saveDotfileConfig } from "../lib/config";

export const runDotfilesManager = async () => {
	intro(MESSAGES.TITLE_MAIN);

	const config = await loadDotfileConfig();
	const menuOptions = buildMainMenuOptions(config);

	const command = await select({
		message: MESSAGES.PROMPT_MAIN_MENU,
		options: menuOptions,
	});
	handleCancel(command);

	switch (command) {
		case "init":
			await init();
			break;
		case "add": {
			const homeDirFiles = readdirSync(homedir());
			const availableDotfiles = SUGGESTED_DOTFILES.filter(file => homeDirFiles.includes(file));

			const filesToAdd = await multiselect({
				message: "📄 Select files to add:",
				options: availableDotfiles.map(file => ({ value: `~/${file}`, label: file })),
				required: false,
			});

			if (Array.isArray(filesToAdd)) {
				let changesMade = false;
				for (const file of filesToAdd) {
					if (addFile(file, config)) {
						changesMade = true;
					}
				}
				if (changesMade) {
					saveDotfileConfig(config);
					outro(pc.green("✅ Successfully added selected dotfiles"));
				} else {
					outro(pc.yellow("No files were added."));
				}
			}
			break;
		}
		case "remove":
			await remove();
			break;
		case "open":
			await open();
			break;
		case "sync-local":
			await syncToLocal();
			break;
		case "sync-remote":
			await syncToRemote();
			break;
	}

	outro(`
	${pc.bold("🔗 Links:")}
	- GitHub: https://github.com/your-username/dotfiles-manager
	- Website: https://your-website.com
	- X: https://twitter.com/your-username
	`);
};
