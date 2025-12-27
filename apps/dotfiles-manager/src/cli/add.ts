import { confirm, intro, note, outro, select, text } from "@clack/prompts";
import { copyFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, relative, resolve } from "node:path";
import pc from "picocolors";
import { DOTFILE_OPTIONS, MESSAGES } from "../constant";
import { ensureDirectoryExists, handleCancel } from "../lib/clack-prompt";
import { type Config, CONFIG_PATH, ConfigService } from "../lib/config";

export function addFile(
	sourcePath: string,
	config: Config,
): { success: boolean; config: Config } {
	sourcePath = sourcePath.replace("~", homedir());
	if (!existsSync(sourcePath)) {
		note(pc.red(`❌ File not found: ${sourcePath}`));
		return { success: false, config };
	}

	const targetRelativePath = sourcePath.startsWith(homedir())
		? relative(homedir(), sourcePath)
		: relative(process.cwd(), sourcePath);

	const targetPath = join(config.dotfilesDir, targetRelativePath);
	const targetDir = join(targetPath, "..");

	ensureDirectoryExists(targetDir);
	copyFileSync(sourcePath, targetPath);

	const newConfig = {
		...config,
		files: [...config.files, { source: sourcePath, target: targetPath }],
	};

	note(`📄 Source: ${pc.cyan(sourcePath)}\n📂 Target: ${pc.cyan(targetPath)}`);
	return { success: true, config: newConfig };
}

export const add = async (file?: string) => {
	intro(MESSAGES.TITLE_ADD);

	const config = await ConfigService.load();

	let sourcePath = "";
	if (file) {
		sourcePath = resolve(file.replace("~", homedir()));
	} else {
		const fileToAdd = await select({
			message: MESSAGES.PROMPT_SELECT_FILE_ADD,
			options: [...DOTFILE_OPTIONS],
		});
		handleCancel(fileToAdd);

		if (fileToAdd === "custom") {
			const customPath = await text({
				message: MESSAGES.PROMPT_CUSTOM_PATH,
				placeholder: "e.g., ~/.gitconfig",
			});
			handleCancel(customPath);
			sourcePath = resolve((customPath as string).replace("~", homedir()));
		} else {
			sourcePath = resolve((fileToAdd as string).replace("~", homedir()));
		}
	}

	const shouldAdd = await confirm({
		message: MESSAGES.PROMPT_CONFIRM_ADD(sourcePath),
	});
	handleCancel(shouldAdd);

	if (shouldAdd) {
		const result = addFile(sourcePath, config);
		if (result.success) {
			ConfigService.save(result.config);
			outro(pc.green(MESSAGES.SUCCESS_ADD));
			note(`⚙️  Config: ${pc.dim(CONFIG_PATH)}`);
		}
	}
};
