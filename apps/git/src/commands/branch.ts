import { select, text } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

interface Branch {
	name: string;
	current: boolean;
	remote: string | undefined;
}

async function listBranches(): Promise<Branch[]> {
	try {
		const { stdout } = await execa("git", ["branch", "-a"]);
		if (!stdout) return [];

		return stdout.split("\n").filter(Boolean).map(line => {
			const current = line.startsWith("*");
			const name = line.replace("*", "").trim();
			const isRemote = name.startsWith("remotes/");
			const parts = name.split("/");

			return {
				name: isRemote ? name.replace("remotes/", "") : name,
				current,
				remote: isRemote ? parts[1] : undefined,
			};
		});
	} catch {
		return [];
	}
}

async function getCurrentBranch(): Promise<string> {
	try {
		const { stdout } = await execa("git", ["branch", "--show-current"]);
		return stdout.trim();
	} catch {
		return "";
	}
}

export async function gitBranchCommand(): Promise<void> {
	while (true) {
		const branches = await listBranches();
		const currentBranch = await getCurrentBranch();
		const localBranches = branches.filter(b => !b.remote);

		console.log(pc.bold(pc.blue("\n🌿 Git Branch Management")));
		console.log("");

		if (currentBranch) {
			console.log(pc.green(`Current branch: ${currentBranch}`));
			console.log("");
		}

		if (localBranches.length > 0) {
			console.log(pc.dim(`Local branches (${localBranches.length}):`));
			localBranches.forEach(branch => {
				const display = branch.current
					? pc.bold(pc.green(`  * ${branch.name}`))
					: pc.dim(`    ${branch.name}`);
				console.log(display);
			});
			console.log("");
		}

		const actionOptions = [
			{ value: "create", label: "➕ Create Branch", hint: "Create a new branch" },
			{ value: "switch", label: "🔀 Switch Branch", hint: "Change to another branch" },
			{ value: "rename", label: "✏️  Rename Branch", hint: "Rename current branch" },
			{ value: "delete", label: "🗑️  Delete Branch", hint: "Delete a branch" },
			{ value: "merge", label: "🔗 Merge Branch", hint: "Merge a branch into current" },
		];

		const action = await select({
			message: "Choose an action:",
			options: actionOptions,
		}) as string;

		if (typeof action === "symbol") {
			return;
		}

		console.log("");

		try {
			switch (action) {
				case "create": {
					const branchName = await text({
						message: "New branch name:",
						placeholder: "feature/my-feature",
						validate: (value) => {
							if (!value.trim()) return "Please enter a branch name";
							if (localBranches.some(b => b.name === value)) return "Branch already exists";
						},
					});

					if (typeof branchName === "symbol") break;

					const switchTo = await select({
						message: "Switch to new branch?",
						options: [
							{ value: "yes", label: "Yes, switch now" },
							{ value: "no", label: "No, stay here" },
						],
					});

					if (switchTo === "yes") {
						await execa("git", ["checkout", "-b", branchName]);
						console.log(pc.green(`✓ Created and switched to: ${branchName}`));
					} else {
						await execa("git", ["branch", branchName]);
						console.log(pc.green(`✓ Created branch: ${branchName}`));
					}
					break;
				}

				case "switch": {
					const branchName = await select({
						message: "Select branch to switch to:",
						options: localBranches
							.filter(b => !b.current)
							.map(b => ({ value: b.name, label: b.name })),
					}) as string;

					if (typeof branchName === "symbol") break;

					await execa("git", ["checkout", branchName]);
					console.log(pc.green(`✓ Switched to: ${branchName}`));
					break;
				}

				case "rename": {
					const newName = await text({
						message: `Rename "${currentBranch}" to:`,
						placeholder: "new-branch-name",
						validate: (value) => {
							if (!value.trim()) return "Please enter a branch name";
							if (localBranches.some(b => b.name === value)) return "Branch already exists";
						},
					});

					if (typeof newName === "symbol") break;

					await execa("git", ["branch", "-m", newName]);
					console.log(pc.green(`✓ Renamed to: ${newName}`));
					break;
				}

				case "delete": {
					const branchName = await select({
						message: "Select branch to delete:",
						options: localBranches
							.filter(b => !b.current)
							.map(b => ({ value: b.name, label: b.name })),
					}) as string;

					if (typeof branchName === "symbol") break;

					const forceDelete = await select({
						message: `Delete "${branchName}"?`,
						options: [
							{ value: "safe", label: "Safe delete", hint: "Only if merged" },
							{ value: "force", label: "Force delete", hint: "Delete even if not merged" },
							{ value: "cancel", label: "Cancel" },
						],
					});

					if (forceDelete === "safe") {
						await execa("git", ["branch", "-d", branchName]);
						console.log(pc.green(`✓ Deleted branch: ${branchName}`));
					} else if (forceDelete === "force") {
						await execa("git", ["branch", "-D", branchName]);
						console.log(pc.green(`✓ Force deleted branch: ${branchName}`));
					}
					break;
				}

				case "merge": {
					const branchName = await select({
						message: `Merge into "${currentBranch}":`,
						options: localBranches
							.filter(b => !b.current)
							.map(b => ({ value: b.name, label: b.name })),
					}) as string;

					if (typeof branchName === "symbol") break;

					await execa("git", ["merge", branchName]);
					console.log(pc.green(`✓ Merged ${branchName} into ${currentBranch}`));
					break;
				}
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.log(pc.red(`✗ Operation failed: ${message}`));
		}

		console.log("");
	}
}
