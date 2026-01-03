import { intro, note, outro, spinner } from "@clack/prompts";
import { existsSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { ensureDirectoryExists } from "../lib/clack-prompt";
import { ConfigService } from "../lib/config";
import { ScriptRunnerService, SystemInfoService, TemplateService } from "../services";

export const syncToLocal = async (options: { dryRun?: boolean }) => {
	intro(pc.bgCyan(pc.black(" 📥 Sync to Local ")));

	const config = await ConfigService.load();

	if (config.files.length === 0) {
		outro(pc.yellow("⚠️  No files to sync"));
		process.exit(0);
	}

	if (config.scripts?.before) {
		await ScriptRunnerService.run(config.scripts.before);
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

		if (options.dryRun) {
			// Skip file operations in dry run mode
		} else if (config.mode === "symlink") {
			if (existsSync(file.source)) {
				unlinkSync(file.source);
			}
			symlinkSync(file.target, file.source);
		} else {
			const templateContent = readFileSync(file.target, "utf-8");
			const systemInfo = SystemInfoService.getSystemInfo();
			const templateData = { ...systemInfo, ...config.templateData };
			const renderedContent = TemplateService.render(
				templateContent,
				templateData,
			);
			writeFileSync(file.source, renderedContent);
		}

		syncedFiles.push(file.source);
	}

	s.stop(options.dryRun ? "✅ Dry run completed" : "✅ Sync to local completed");

	if (config.scripts?.after) {
		await ScriptRunnerService.run(config.scripts.after);
	}

	if (syncedFiles.length > 0) {
		note(syncedFiles.map(f => `  ${pc.green("✔")} ${f}`).join("\n"), "Synced files");
	}

	if (skippedFiles.length > 0) {
		note(skippedFiles.map(f => `  ${pc.yellow("✖")} ${f}`).join("\n"), "Skipped files (source not found)");
	}
	process.exit(0);
};
