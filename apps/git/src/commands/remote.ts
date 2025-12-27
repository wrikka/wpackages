import { select, text } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

interface Remote {
	name: string;
	url: string;
}

async function listRemotes(): Promise<Remote[]> {
	try {
		const { stdout } = await execa("git", ["remote", "-v"]);
		if (!stdout) return [];

		const lines = stdout.split("\n").filter(Boolean);
		const remotes: Remote[] = [];
		const seen = new Set<string>();

		for (const line of lines) {
			const [name, url] = line.split(/\s+/);
			if (name && url && !seen.has(name)) {
				remotes.push({ name, url });
				seen.add(name);
			}
		}

		return remotes;
	} catch {
		return [];
	}
}

async function getCurrentBranch(): Promise<string> {
	try {
		const { stdout } = await execa("git", ["branch", "--show-current"]);
		return stdout.trim();
	} catch {
		return "main";
	}
}

export async function gitRemoteCommand(): Promise<void> {
	while (true) {
		const remotes = await listRemotes();

		console.log(pc.bold(pc.blue("\n🌐 Git Remote Management")));
		console.log("");

		if (remotes.length > 0) {
			console.log(pc.dim(`Remotes (${remotes.length}):`));
			remotes.forEach(remote => {
				console.log(pc.cyan(`  ${remote.name}: ${pc.dim(remote.url)}`));
			});
			console.log("");
		} else {
			console.log(pc.dim("No remotes configured"));
			console.log("");
		}

		const actionOptions = [
			{ value: "add", label: "➕ Add Remote", hint: "Add a new remote repository" },
			{ value: "pull", label: "⬇️  Pull", hint: "Fetch and merge from remote" },
			{ value: "push", label: "⬆️  Push", hint: "Push commits to remote" },
			{ value: "sync", label: "🔄 Sync", hint: "Pull then push" },
		];

		if (remotes.length > 0) {
			actionOptions.push(
				{ value: "rename", label: "✏️  Rename Remote", hint: "Rename an existing remote" },
				{ value: "remove", label: "🗑️  Remove Remote", hint: "Delete a remote" },
				{ value: "fetch", label: "📥 Fetch", hint: "Download objects from remote" },
				{ value: "show", label: "📋 Show Details", hint: "Show remote information" },
			);
		}

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
				case "add": {
					const name = await text({
						message: "Remote name:",
						placeholder: "origin",
						validate: (value) => {
							if (!value.trim()) return "Please enter a remote name";
							if (remotes.some(r => r.name === value)) return "Remote name already exists";
						},
					});

					if (typeof name === "symbol") break;

					const url = await text({
						message: "Remote URL:",
						placeholder: "https://github.com/user/repo.git",
						validate: (value) => {
							if (!value.trim()) return "Please enter a URL";
						},
					});

					if (typeof url === "symbol") break;

					await execa("git", ["remote", "add", name, url]);
					console.log(pc.green(`✓ Added remote: ${name}`));
					break;
				}

				case "rename": {
					const oldName = await select({
						message: "Select remote to rename:",
						options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
					}) as string;

					if (typeof oldName === "symbol") break;

					const newName = await text({
						message: "New remote name:",
						placeholder: "origin",
						validate: (value) => {
							if (!value.trim()) return "Please enter a remote name";
							if (remotes.some(r => r.name === value)) return "Remote name already exists";
						},
					});

					if (typeof newName === "symbol") break;

					await execa("git", ["remote", "rename", oldName, newName]);
					console.log(pc.green(`✓ Renamed remote: ${oldName} → ${newName}`));
					break;
				}

				case "remove": {
					const name = await select({
						message: "Select remote to remove:",
						options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
					}) as string;

					if (typeof name === "symbol") break;

					const confirm = await select({
						message: `Remove remote "${name}"?`,
						options: [
							{ value: "yes", label: "Yes, remove it" },
							{ value: "no", label: "No, cancel" },
						],
					});

					if (confirm === "yes") {
						await execa("git", ["remote", "remove", name]);
						console.log(pc.green(`✓ Removed remote: ${name}`));
					}
					break;
				}

				case "pull": {
					const remoteName = remotes.length === 1
						? remotes[0]!.name
						: await select({
							message: "Select remote:",
							options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
						}) as string;

					if (typeof remoteName === "symbol") break;

					const branch = await getCurrentBranch();
					console.log(pc.cyan(`Pulling from ${remoteName}/${branch}...`));

					await execa("git", ["pull", remoteName, branch]);
					console.log(pc.green(`✓ Pulled from ${remoteName}`));
					break;
				}

				case "push": {
					const remoteName = remotes.length === 1
						? remotes[0]!.name
						: await select({
							message: "Select remote:",
							options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
						}) as string;

					if (typeof remoteName === "symbol") break;

					const branch = await getCurrentBranch();
					console.log(pc.cyan(`Pushing to ${remoteName}/${branch}...`));

					await execa("git", ["push", remoteName, branch]);
					console.log(pc.green(`✓ Pushed to ${remoteName}`));
					break;
				}

				case "sync": {
					const remoteName = remotes.length === 1
						? remotes[0]!.name
						: await select({
							message: "Select remote:",
							options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
						}) as string;

					if (typeof remoteName === "symbol") break;

					const branch = await getCurrentBranch();
					console.log(pc.cyan(`Syncing with ${remoteName}/${branch}...`));

					await execa("git", ["pull", remoteName, branch]);
					console.log(pc.green(`✓ Pulled from ${remoteName}`));

					await execa("git", ["push", remoteName, branch]);
					console.log(pc.green(`✓ Pushed to ${remoteName}`));
					console.log(pc.green(`✓ Synced with ${remoteName}`));
					break;
				}

				case "fetch": {
					const remoteName = remotes.length === 1
						? remotes[0]!.name
						: await select({
							message: "Select remote:",
							options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
						}) as string;

					if (typeof remoteName === "symbol") break;

					console.log(pc.cyan(`Fetching from ${remoteName}...`));
					await execa("git", ["fetch", remoteName]);
					console.log(pc.green(`✓ Fetched from ${remoteName}`));
					break;
				}

				case "show": {
					const name = await select({
						message: "Select remote:",
						options: remotes.map(r => ({ value: r.name, label: r.name, hint: r.url })),
					}) as string;

					if (typeof name === "symbol") break;

					const { stdout } = await execa("git", ["remote", "show", name]);
					console.log(pc.cyan("Remote Details:"));
					console.log(pc.dim(stdout));
					break;
				}
			}
		} catch (error: any) {
			console.log(pc.red(`✗ Operation failed: ${error.message}`));
		}

		console.log("");
	}
}
