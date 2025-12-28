import * as p from "@clack/prompts";
import pc from "picocolors";
import {
	cleanup,
	findCleanableItems,
	type CleanableItem,
} from "./services/cleanup.service";
import { loadConfig, createDefaultConfig } from "./services/config.service";

const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const handleInit = async () => {
	p.intro(pc.cyan("🚀 Initializing computer-cleanup config"));
	const spinner = p.spinner();
	spinner.start("Creating default configuration file...");
	try {
		const configPath = await createDefaultConfig();
		spinner.stop(`✅ Default configuration created at: ${configPath}`);
		p.outro(pc.green("You can now customize the patterns in this file."));
	} catch (error) {
		spinner.stop("Failed to create configuration file.");
		p.log.error(error instanceof Error ? error.message : String(error));
	}
};

export const runCleanupApp = async () => {
	console.clear();
	p.intro(pc.cyan("🧹 Welcome to computer-cleanup"));

	const config = await loadConfig();
	const searchSpinner = p.spinner();
	searchSpinner.start("Finding items to clean across specified paths...");

	const allItems: CleanableItem[] = [];
	for (const basePath of config.scanPaths) {
		p.log.info(`Scanning in: ${basePath}`);
		const itemsInPath = await findCleanableItems(
			config.patterns,
			basePath,
			config.excludePatterns,
		);
		allItems.push(...itemsInPath);
	}

	// Remove duplicates that might occur if scanPaths overlap
	const uniqueItems = Array.from(
		new Map(allItems.map((item) => [item.path, item])).values(),
	);

	const items = uniqueItems;

	searchSpinner.stop("Found items to clean!");

	if (items.length === 0) {
		p.outro(pc.green("✅ No items to clean. Your workspace is tidy!"));
		return;
	}

	const selectedItems = await p.multiselect({
		message: "Select items to clean up. Use space to select, enter to confirm.",
		options: items.map((item) => ({
			value: item,
			label: `${item.path} ${pc.dim(`(${formatBytes(item.size)})`)}`,
		})),
		required: false,
	});

	if (
		p.isCancel(selectedItems) ||
		!Array.isArray(selectedItems) ||
		selectedItems.length === 0
	) {
		p.cancel("Operation cancelled. No files were cleaned.");
		return;
	}

	const totalSize = selectedItems.reduce(
		(acc, item) => acc + (item as CleanableItem).size,
		0,
	);
	const confirm = await p.confirm({
		message: `You are about to delete ${selectedItems.length} items, totaling ${pc.yellow(formatBytes(totalSize))}. Are you sure?`,
	});

	if (!confirm || p.isCancel(confirm)) {
		p.cancel("Operation cancelled. No files were cleaned.");
		return;
	}

	const cleanupSpinner = p.spinner();
	cleanupSpinner.start(`Cleaning up ${selectedItems.length} items...`);

	try {
		const pathsToClean = selectedItems.map(
			(item) => (item as CleanableItem).path,
		);
		const results = await cleanup(pathsToClean);
		cleanupSpinner.stop("✨ Cleanup complete!");

		let successCount = 0;
		let failCount = 0;

		results.forEach((result) => {
			if (result.status === "fulfilled") {
				p.log.success(`Deleted: ${result.path}`);
				successCount++;
			} else {
				p.log.error(`Failed to delete ${result.path}: ${result.reason}`);
				failCount++;
			}
		});

		const summary = [];
		if (successCount > 0) summary.push(pc.green(`${successCount} deleted`));
		if (failCount > 0) summary.push(pc.red(`${failCount} failed`));

		p.outro(
			`Cleanup finished. ${summary.join(", ")}. Total space saved: ${pc.green(formatBytes(totalSize))}`,
		);
	} catch (error) {
		cleanupSpinner.stop("An error occurred during cleanup.");
		p.log.error(error instanceof Error ? error.message : String(error));
		p.outro(pc.red("Cleanup failed."));
	}
};
