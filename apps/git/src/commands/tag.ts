import { select, text } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

interface Tag {
	name: string;
	message?: string;
}

async function listTags(): Promise<Tag[]> {
	try {
		const { stdout } = await execa("git", ["tag", "-l"]);
		if (!stdout) return [];

		return stdout.split("\n").filter(Boolean).map(name => ({ name }));
	} catch {
		return [];
	}
}

export async function gitTagCommand(): Promise<void> {
	while (true) {
		const tags = await listTags();

		console.log(pc.bold(pc.blue("\n🏷️  Git Tag Management")));
		console.log("");

		if (tags.length > 0) {
			console.log(pc.dim(`Tags (${tags.length}):`));
			tags.forEach(tag => {
				console.log(pc.cyan(`  ${tag.name}`));
			});
			console.log("");
		} else {
			console.log(pc.dim("No tags found"));
			console.log("");
		}

		const actionOptions = [
			{ value: "create", label: "➕ Create Tag", hint: "Create a new tag" },
			{ value: "delete", label: "🗑️  Delete Tag", hint: "Delete a tag" },
			{ value: "show", label: "📋 Show Tag", hint: "Show tag details" },
			{ value: "push", label: "⬆️  Push Tags", hint: "Push tags to remote" },
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
					const tagName = await text({
						message: "Tag name:",
						placeholder: "v1.0.0",
						validate: (value) => {
							if (!value.trim()) return "Please enter a tag name";
							if (tags.some(t => t.name === value)) return "Tag already exists";
						},
					});

					if (typeof tagName === "symbol") break;

					const tagType = await select({
						message: "Tag type:",
						options: [
							{ value: "lightweight", label: "Lightweight", hint: "Simple tag" },
							{ value: "annotated", label: "Annotated", hint: "Tag with message" },
						],
					});

					if (tagType === "annotated") {
						const message = await text({
							message: "Tag message:",
							placeholder: "Release version 1.0.0",
							validate: (value) => {
								if (!value.trim()) return "Please enter a message";
							},
						});

						if (typeof message === "symbol") break;

						await execa("git", ["tag", "-a", tagName, "-m", message]);
						console.log(pc.green(`✓ Created annotated tag: ${tagName}`));
					} else {
						await execa("git", ["tag", tagName]);
						console.log(pc.green(`✓ Created tag: ${tagName}`));
					}
					break;
				}

				case "delete": {
					if (tags.length === 0) {
						console.log(pc.yellow("No tags to delete"));
						break;
					}

					const tagName = await select({
						message: "Select tag to delete:",
						options: tags.map(t => ({ value: t.name, label: t.name })),
					}) as string;

					if (typeof tagName === "symbol") break;

					const confirm = await select({
						message: `Delete tag "${tagName}"?`,
						options: [
							{ value: "local", label: "Delete locally only" },
							{ value: "both", label: "Delete locally and from remote" },
							{ value: "cancel", label: "Cancel" },
						],
					});

					if (confirm === "local") {
						await execa("git", ["tag", "-d", tagName]);
						console.log(pc.green(`✓ Deleted tag: ${tagName}`));
					} else if (confirm === "both") {
						await execa("git", ["tag", "-d", tagName]);
						try {
							await execa("git", ["push", "origin", `:refs/tags/${tagName}`]);
							console.log(pc.green(`✓ Deleted tag locally and from remote: ${tagName}`));
						} catch {
							console.log(pc.yellow(`✓ Deleted locally (remote delete failed): ${tagName}`));
						}
					}
					break;
				}

				case "show": {
					if (tags.length === 0) {
						console.log(pc.yellow("No tags to show"));
						break;
					}

					const tagName = await select({
						message: "Select tag to show:",
						options: tags.map(t => ({ value: t.name, label: t.name })),
					}) as string;

					if (typeof tagName === "symbol") break;

					const { stdout } = await execa("git", ["show", tagName]);
					console.log(pc.cyan("Tag Details:"));
					console.log(pc.dim(stdout));
					break;
				}

				case "push": {
					const pushOption = await select({
						message: "Push tags to remote:",
						options: [
							{ value: "all", label: "Push all tags", hint: "Push all local tags" },
							{ value: "one", label: "Push one tag", hint: "Push a specific tag" },
						],
					});

					if (pushOption === "all") {
						await execa("git", ["push", "origin", "--tags"]);
						console.log(pc.green("✓ Pushed all tags to origin"));
					} else if (pushOption === "one") {
						if (tags.length === 0) {
							console.log(pc.yellow("No tags to push"));
							break;
						}

						const tagName = await select({
							message: "Select tag to push:",
							options: tags.map(t => ({ value: t.name, label: t.name })),
						}) as string;

						if (typeof tagName === "symbol") break;

						await execa("git", ["push", "origin", tagName]);
						console.log(pc.green(`✓ Pushed tag: ${tagName}`));
					}
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
