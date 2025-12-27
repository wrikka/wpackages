import { intro, note, outro, spinner } from "@clack/prompts";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { ensureDirectoryExists } from "../lib/clack-prompt";
import { ConfigService } from "../lib/config";
import { TemplateService } from "../services";

export const syncToLocal = async () => {
	intro(pc.bgCyan(pc.black(" 📥 Sync to Local ")));

	const config = await ConfigService.load();

	if (config.files.length === 0) {
		outro(pc.yellow("⚠️  No files to sync"));
		process.exit(0);
	}

	const s = spinner();
	s.start("📥 Syncing files from dotfiles to local system...");

	const syncedFiles: string[] = [];
	const skippedFiles: string[] = [];

	for (const file of config.files) {
		if (!existsSync(file.target)) {
			skippedFiles.push(file.source);
			continue;
		}

		const sourceDir = join(file.source, "..");
		ensureDirectoryExists(sourceDir);

		const templateContent = readFileSync(file.target, "utf-8");
		const renderedContent = TemplateService.render(
			templateContent,
			config.templateData ?? {},
		);
		writeFileSync(file.source, renderedContent);

		syncedFiles.push(file.source);
	}

	s.stop(`✅ Sync to local completed`);

	if (syncedFiles.length > 0) {
		note(syncedFiles.map(f => `  ${pc.green("✔")} ${f}`).join("\n"), "Synced files");
	}

	if (skippedFiles.length > 0) {
		note(skippedFiles.map(f => `  ${pc.yellow("✖")} ${f}`).join("\n"), "Skipped files (source not found)");
	}
	process.exit(0);
};
