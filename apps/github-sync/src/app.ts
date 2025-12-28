import { cli } from "@/components";
import {
	getRepoFiles,
	commitAndPushFiles,
	generateCommitMessage,
} from "@/services";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
	cli.intro();

	const { owner, repo } = await cli.promptForRepoInfo();

	const fetchSpinner = cli.startSpinner("Fetching repository files...");
	const repoFiles = await getRepoFiles(owner, repo);
	cli.stopSpinner(fetchSpinner, "Repository files fetched.");

	if (repoFiles.length === 0) {
		cli.outro("No files found in the repository.");
		return;
	}

	const selectedFiles = await cli.selectFiles(repoFiles);

	const filesToCommit = await Promise.all(
		selectedFiles.map(async (filePath) => {
			try {
				// Assuming the files exist locally at the same path relative to the project root
				const content = await fs.readFile(
					path.resolve(process.cwd(), filePath),
					"utf-8",
				);
				return { path: filePath, content };
			} catch (error) {
				console.error(`Error reading file ${filePath}:`, error);
				// Returning null for files that can't be read, will be filtered out later
				return null;
			}
		}),
	);

	const validFiles = filesToCommit.filter((f) => f !== null) as {
		path: string;
		content: string;
	}[];

	if (validFiles.length === 0) {
		cli.outro("No valid files selected or files could not be read.");
		return;
	}

	const diff = validFiles
		.map((f) => `--- a/${f.path}\n+++ b/${f.path}\n${f.content}`)
		.join("\n");

	const genSpinner = cli.startSpinner("Generating commit message with AI...");
	const commitMessage = await generateCommitMessage(diff);
	cli.stopSpinner(genSpinner, "Commit message generated.");

	const shouldCommit = await cli.confirmCommit(commitMessage);

	if (shouldCommit) {
		const commitSpinner = cli.startSpinner("Committing and pushing files...");
		try {
			const commitSha = await commitAndPushFiles(
				owner,
				repo,
				validFiles,
				commitMessage,
			);
			cli.stopSpinner(
				commitSpinner,
				`Successfully committed and pushed. Commit SHA: ${commitSha}`,
			);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			cli.stopSpinner(
				commitSpinner,
				`Failed to commit and push files: ${message}`,
			);
		}
	}

	cli.outro("GitHub Sync process finished.");
}

main().catch(console.error);
