import type { Config } from "../types";

/**
 * Menu option type
 */
export interface MenuOption {
	value: string;
	label: string;
	hint: string;
}

/**
 * Build main menu options based on config state
 */
export const buildMainMenuOptions = (config: Config): MenuOption[] => {
	const options: MenuOption[] = [];

	if (!config.initialized) {
		options.push({
			value: "init",
			label: "🚀 Initialize",
			hint: "Set up dotfiles manager",
		});
	}

	options.push(
		{
			value: "add",
			label: "📁 Add a file",
			hint: "Add file to dotfiles",
		},
		{
			value: "remove",
			label: "🗑️  Remove a file",
			hint: "Remove file from dotfiles",
		},
		{
			value: "open",
			label: "📖 Open managed files",
			hint: "View and open files",
		},
		{
			value: "sync-local",
			label: "📥 Sync to local",
			hint: "Update local files from dotfiles",
		},
		{
			value: "sync-remote",
			label: "📤 Sync to remote",
			hint: "Push dotfiles to Git repository",
		},
	);

	return options;
};

/**
 * Build file list options for selection
 */
export const buildFileListOptions = (
	files: Array<{ source: string; target: string }>,
) => {
	return files.map((file) => ({
		value: file.source,
		label: file.source,
		hint: `→ ${file.target}`,
	}));
};
