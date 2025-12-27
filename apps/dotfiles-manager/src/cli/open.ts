import { intro, note, outro, select } from "@clack/prompts";
import { execSync } from "node:child_process";
import pc from "picocolors";
import { EDITOR_OPTIONS, MESSAGES } from "../constant";
import { handleCancel } from "../lib/clack-prompt";
import { ConfigService } from "../lib/config";

export const open = async () => {
	const config = await ConfigService.load();

	intro(MESSAGES.TITLE_OPEN);

	if (config.files.length === 0) {
		outro(pc.yellow(MESSAGES.ERROR_NO_FILES_MANAGED));
		note(pc.dim("Use \"Add a file\" command to start managing your dotfiles"));
		process.exit(0);
	}

	if (!config.editor) {
		const editor = await select({
			message: MESSAGES.PROMPT_SELECT_EDITOR,
			options: [...EDITOR_OPTIONS],
		});
		handleCancel(editor);
		config.editor = editor as string;
		ConfigService.save(config);
		note(MESSAGES.INFO_EDITOR_SAVED(config.editor));
	}

	const selectedFile = await select({
		message: MESSAGES.PROMPT_SELECT_FILE_OPEN,
		options: config.files.map(file => ({
			value: file.source,
			label: file.source,
			hint: pc.dim(`→ ${file.target}`),
		})),
	});
	handleCancel(selectedFile);

	const filePath = String(selectedFile);
	try {
		execSync(`${config.editor} "${filePath}"`, { stdio: "inherit" });
		outro(pc.green(MESSAGES.SUCCESS_OPEN(filePath)));
	} catch (error: unknown) {
		outro(pc.red(MESSAGES.ERROR_OPEN_FAILED));
		if (error instanceof Error && "stderr" in error) {
			const stderr = (error as { stderr: Buffer }).stderr.toString();
			if (stderr.includes("not found") || stderr.includes("is not recognized")) {
				note(
					`Editor "${config.editor}" not found. Please ensure it's installed and in your system's PATH.`,
				);
			} else {
				note(pc.dim(error.message));
			}
		} else if (error instanceof Error) {
			note(pc.dim(error.message));
		}
	}

	note(pc.dim(MESSAGES.INFO_TOTAL_FILES(config.files.length)));
	process.exit(0);
};
