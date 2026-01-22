import * as p from "@clack/prompts";
import { getConfig, listConfig, setConfig } from "../lib/config";
import { getOutputMode, isQuiet, printOutput } from "../lib/output";

export async function runConfigCommand(
	args: { get?: string; set?: string; value?: string; scope?: "repo" | "global" },
): Promise<void> {
	if (args.get) {
		const value = getConfig(args.get as any);
		printOutput({ [args.get]: value }, { output: "json" });
		return;
	}

	if (args.set && args.value !== undefined) {
		setConfig(args.set as any, args.value, args.scope);
		if (!isQuiet()) {
			console.log(`✓ Set ${args.set} = ${args.value} (${args.scope || "repo"})`);
		}
		return;
	}

	// List all config
	const cfg = listConfig();
	const mode = getOutputMode();
	if (mode === "json") {
		printOutput(cfg, { output: "json" });
	} else {
		console.log("GitHub CLI Configuration:");
		console.log("");
		for (const [key, value] of Object.entries(cfg)) {
			const display = value === undefined ? "(not set)" : String(value);
			console.log(`  ${key}: ${display}`);
		}
	}
}

export async function runInteractiveConfig(): Promise<void> {
	const action = await p.select<"get" | "set" | "list">({
		message: "Config action:",
		options: [
			{ value: "list", label: "List all configuration" },
			{ value: "get", label: "Get a value" },
			{ value: "set", label: "Set a value" },
		],
	});

	if (p.isCancel(action)) return;

	switch (action) {
		case "list": {
			await runConfigCommand({});
			break;
		}
		case "get": {
			const key = await p.text({
				message: "Config key:",
				placeholder: "githubToken",
			});
			if (p.isCancel(key)) return;
			await runConfigCommand({ get: String(key).trim() });
			break;
		}
		case "set": {
			const key = await p.text({
				message: "Config key:",
				placeholder: "defaultOwner",
			});
			if (p.isCancel(key)) return;

			const value = await p.text({
				message: "Value:",
				placeholder: "myusername",
			});
			if (p.isCancel(value)) return;

			const scope = await p.select<"repo" | "global">({
				message: "Scope:",
				options: [
					{ value: "repo", label: "Repository (local)" },
					{ value: "global", label: "Global" },
				],
			});
			if (p.isCancel(scope)) return;

			await runConfigCommand({ set: String(key).trim(), value: String(value).trim(), scope });
			break;
		}
	}
}
