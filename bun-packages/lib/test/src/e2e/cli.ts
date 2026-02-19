import pc from "picocolors";
import { runTests } from "./runner";

function printHelp(): void {
	console.log(
		"wtest e2e <command> [options]\n\nCommands:\n  test   Run E2E tests\n  ui     Run E2E tests with browser UI\n\nOptions:\n  --cdp <ws|http-url>   Connect to an existing Chrome via CDP (faster)\n",
	);
}

export async function runE2EFromCli(args: string[]): Promise<number> {
	let command: string | undefined;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (!a) continue;
		if (a === "-h" || a === "--help") {
			printHelp();
			return 0;
		}
		if (a === "--cdp") {
			const value = args[i + 1];
			if (!value || value.startsWith("-")) {
				console.error(pc.red("Missing value for --cdp"));
				printHelp();
				return 1;
			}
			process.env["E2E_CDP_URL"] = value;
			i++;
			continue;
		}
		if (a.startsWith("-")) {
			continue;
		}
		command = a;
		break;
	}

	if (!command) {
		printHelp();
		return 0;
	}

	if (command === "test") {
		return await runTests();
	}

	if (command === "ui") {
		process.env["E2E_HEADLESS"] = "0";
		return await runTests();
	}

	console.error(pc.red(`Unknown command: ${command}`));
	printHelp();
	return 1;
}
