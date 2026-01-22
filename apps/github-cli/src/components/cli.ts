import * as p from "@clack/prompts";
import pc from "picocolors";

export function intro() {
	p.intro(pc.inverse(" GitHub Sync CLI "));
}

export async function promptForRepoInfo(): Promise<{
	owner: string;
	repo: string;
}> {
	const group = await p.group(
		{
			owner: () => p.text({ message: "Enter the repository owner:" }),
			repo: () => p.text({ message: "Enter the repository name:" }),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);
	return group;
}

export async function selectFiles(files: string[]): Promise<string[]> {
	const selected = await p.multiselect({
		message: "Select files to sync:",
		options: files.map((file) => ({ value: file, label: file })),
		required: true,
	});

	if (p.isCancel(selected)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	return selected as string[];
}

export async function confirmCommit(commitMessage: string): Promise<boolean> {
	p.note(`Generated commit message:\n\n${commitMessage}`);
	const shouldCommit = await p.confirm({
		message: "Do you want to commit and push these changes?",
		initialValue: true,
	});

	if (p.isCancel(shouldCommit) || !shouldCommit) {
		p.cancel("Commit cancelled.");
		return false;
	}

	return true;
}

export function startSpinner(message: string) {
	const s = p.spinner();
	s.start(message);
	return s;
}

export function stopSpinner(
	spinner: ReturnType<typeof p.spinner>,
	message: string,
) {
	spinner.stop(message);
}

export function outro(message: string) {
	p.outro(pc.green(message));
}
