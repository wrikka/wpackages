import { confirm } from "@clack/prompts";
import pc from "picocolors";
import { runGitCommand } from "../utils/common";
import { buildFileTree, displayTree, getGitStatusDetailed } from "./status";

export async function gitStagingCommand(): Promise<void> {
	const files = await getGitStatusDetailed();
	const unstagedFiles = files.filter(f =>
		f.statusCode.includes("M") || f.statusCode === "??" || f.statusCode[1] === "M"
	);

	if (unstagedFiles.length === 0) {
		console.log(pc.green("\n✓ No files to stage"));
		return;
	}

	// แสดง status tree
	console.log(pc.bold(pc.blue("\n📦 Staging Preparation")));
	console.log("");

	console.log(pc.dim(`Files to stage: ${unstagedFiles.length}`));
	console.log("");

	const tree = buildFileTree(unstagedFiles);
	displayTree(tree);
	console.log("");

	const shouldStageAll = await confirm({
		message: "Stage all these files?",
		initialValue: true,
	});

	if (typeof shouldStageAll === "symbol") {
		return;
	}

	try {
		if (shouldStageAll) {
			await runGitCommand(["add", "."]);
			console.log(pc.green("\n✓ All files staged successfully"));
		} else {
			console.log(pc.yellow("\n→ Staging operation cancelled"));
		}
	} catch {
		console.log(pc.red("\n✗ Failed to stage files"));
	}
}
