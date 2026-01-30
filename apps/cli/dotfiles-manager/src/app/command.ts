import { Command } from "commander";
import { add } from "../cli/add";
import { init } from "../cli/init";
import { open } from "../cli/open";
import { remove } from "../cli/remove";
import { syncToLocal as syncLocal } from "../cli/sync-local";
import { syncToRemote as syncRemote } from "../cli/sync-remote";

export const runCommander = () => {
	const program = new Command();

	program
		.name("wdotfiles")
		.description("Simple dotfiles manager")
		.version("0.1.0");

	program.command("init").description("Initialize dotfiles manager").action(init);

	program
		.command("add")
		.description("Add file to dotfiles")
		.argument("<file>", "File path to add")
		.action(add);

	program
		.command("remove")
		.description("Remove file from dotfiles")
		.argument("<file>", "File path to remove")
		.action(remove);

	program
		.command("sync-local")
		.description("Sync dotfiles to local system")
		.option("--dry-run", "Simulate sync without making changes")
		.action(syncLocal);

	program
		.command("sync-remote")
		.description("Sync dotfiles to remote repository")
		.action(syncRemote);

	program.command("open").description("List managed dotfiles").action(open);

	program.parse();
};
