import { cancel, confirm, intro, multiselect, note, outro } from "@clack/prompts";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import pc from "picocolors";
import { MESSAGES } from "../constant";
import { handleCancel } from "../lib/clack-prompt";
import { CONFIG_PATH, ConfigService } from "../lib/config";

export const remove = async (file?: string) => {
	intro(MESSAGES.TITLE_REMOVE);

	const config = await ConfigService.load();

	if (config.files.length === 0) {
		outro(pc.yellow(MESSAGES.ERROR_NO_FILES));
		process.exit(0);
	}

	let sourcePaths: string[];
	if (!file) {
		const selected = await multiselect({
			message: MESSAGES.PROMPT_SELECT_FILES_REMOVE,
			options: config.files.map(f => ({
				value: f.source,
				label: f.source,
				hint: pc.dim(`→ ${f.target}`),
			})),
			required: true,
		});
		handleCancel(selected);
		sourcePaths = selected as string[];

		if (sourcePaths.length === 0) {
			cancel("No files selected");
			process.exit(0);
		}
	} else {
		sourcePaths = [resolve(file)];
	}

	const confirmResult = await confirm({
		message: MESSAGES.PROMPT_CONFIRM_REMOVE(sourcePaths.length),
		initialValue: false,
	});
	handleCancel(confirmResult);

	if (!confirmResult) {
		cancel("Operation cancelled");
		process.exit(0);
	}

	for (const sourcePath of sourcePaths) {
		const index = config.files.findIndex(f => f.source === sourcePath);
		if (index === -1) continue;

		const targetPath = config.files[index]?.target;
		if (targetPath && existsSync(targetPath)) rmSync(targetPath);

		config.files.splice(index, 1);
	}

	ConfigService.save(config);

	outro(pc.green(MESSAGES.SUCCESS_REMOVE(sourcePaths.length)));
	note(`📊 ${MESSAGES.INFO_REMAINING_FILES(config.files.length)}\n⚙️  Config: ${pc.dim(CONFIG_PATH)}`);
	process.exit(0);
};
