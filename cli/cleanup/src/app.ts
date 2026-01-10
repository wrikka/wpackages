import * as p from "@clack/prompts";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import pc from "picocolors";
import { type CleanableItem, cleanup, findCleanableItems } from "./services/cleanup.service";
import { createDefaultConfig, loadConfig, type Profile } from "./services/config.service";

const execAsync = promisify(exec);

const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

const runBunLink = async ({ skipConfirmation }: { skipConfirmation: boolean }) => {
	if (skipConfirmation) return;

	const shouldRun = await p.confirm({
		message: "Do you want to run `bun link` after cleanup?",
		initialValue: true,
	});

	if (shouldRun && !p.isCancel(shouldRun)) {
		const spinner = p.spinner();
		spinner.start("Running `bun link`...");
		try {
			const { stdout, stderr } = await execAsync("bun link", {
				cwd: process.cwd(),
			});
			spinner.stop("✅ `bun link` completed successfully.");
			if (stdout) p.log.info(stdout.trim());
			if (stderr) p.log.warn(stderr.trim());
		} catch (error) {
			spinner.stop("❌ Failed to run `bun link`.");
			p.log.error(error instanceof Error ? error.message : String(error));
		}
	}
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

export const runCleanupApp = async ({
	dryRun = false,
	skipConfirmation = false,
}: { dryRun?: boolean; skipConfirmation?: boolean } = {}) => {
	console.clear();
	p.intro(pc.cyan("🧹 Welcome to computer-cleanup"));

	const config = await loadConfig();
	config.scanPaths = [process.cwd()];

	let selectedProfile: Profile;
	let selectedItems: CleanableItem[] | symbol;

	if (skipConfirmation) {
		selectedProfile = config.profiles.default;
		p.log.info("Using default profile in non-interactive mode.");
	} else {
		const selectedProfileName = await p.select({
			message: "Select a cleanup profile to use:",
			options: Object.keys(config.profiles).map((key) => ({
				value: key,
				label: key.charAt(0).toUpperCase() + key.slice(1),
			})),
		});

		if (p.isCancel(selectedProfileName)) {
			p.cancel("Operation cancelled.");
			return;
		}
		selectedProfile = config.profiles[selectedProfileName];
	}

	const searchSpinner = p.spinner();
	searchSpinner.start("Finding items to clean across specified paths...");

	const allItems: CleanableItem[] = [];
	for (const basePath of config.scanPaths) {
		p.log.info(`Scanning in: ${basePath}`);
		const itemsInPath = await findCleanableItems(
			selectedProfile.patterns,
			basePath,
			selectedProfile.excludePatterns,
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

	if (skipConfirmation) {
		selectedItems = items;
	} else {
		selectedItems = await p.multiselect({
			message: "Select items to clean up. Use space to select, enter to confirm.",
			options: items.map((item) => ({
				value: item,
				label: `${item.path} ${pc.dim(`(${formatBytes(item.size)})`)}`,
			})),
			required: false,
		});
	}

	if (
		p.isCancel(selectedItems)
		|| !Array.isArray(selectedItems)
		|| selectedItems.length === 0
	) {
		p.cancel("Operation cancelled. No files were cleaned.");
		return;
	}

	const totalSize = selectedItems.reduce(
		(acc, item) => acc + (item as CleanableItem).size,
		0,
	);
	const confirm = skipConfirmation
		? true
		: await p.confirm({
			message: `You are about to move ${selectedItems.length} items to the trash, totaling ${
				pc.yellow(
					formatBytes(totalSize),
				)
			}. Are you sure?`,
		});

	if (dryRun) {
		p.note(
			selectedItems
				.map((item) => (item as CleanableItem).path)
				.join("\n"),
			"Dry Run: The following items would be moved to the trash",
		);
		p.outro(pc.green(`Dry run complete. ${formatBytes(totalSize)} would be saved.`));
		return;
	}

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
				p.log.success(`Moved to trash: ${result.path}`);
				successCount++;
			} else {
				p.log.error(`Failed to move to trash ${result.path}: ${String(result.reason)}`);
				failCount++;
			}
		});

		const summary = [];
		if (successCount > 0) summary.push(pc.green(`${successCount} moved to trash`));
		if (failCount > 0) summary.push(pc.red(`${failCount} failed`));

		p.outro(
			`Cleanup finished. ${summary.join(", ")}. Total space saved: ${pc.green(formatBytes(totalSize))}`,
		);

		await runBunLink({ skipConfirmation });
	} catch (error) {
		cleanupSpinner.stop("An error occurred during cleanup.");
		p.log.error(error instanceof Error ? error.message : String(error));
		p.outro(pc.red("Cleanup failed."));
	}
};
