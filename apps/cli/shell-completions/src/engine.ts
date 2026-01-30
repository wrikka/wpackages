import { CompletionSpec } from "./schema";

// This will be responsible for loading specs from the filesystem.
export function loadSpec(command: string): CompletionSpec | undefined {
	// In the future, this will read from a spec file.
	// For now, return a dummy spec.
	if (command === "git") {
		return {
			name: "git",
			description: "The stupid content tracker",
			subcommands: [
				{
					name: "add",
					description: "Add file contents to the index",
					args: [{ name: "path", isVariadic: true, generators: { template: "filepaths" } }],
				},
				{ name: "commit", description: "Record changes to the repository" },
				{
					name: "push",
					description: "Update remote refs along with associated objects",
				},
			],
		};
	}
	return undefined;
}
