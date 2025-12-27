#!/usr/bin/env node
import { intro, outro, multiselect, spinner, isCancel } from "@clack/prompts";
import { Effect } from "effect";
import { runChecker } from "../app";
import type { CheckType } from "../types/index";

async function main() {
	intro(`Code Quality Checker`);

	const checkTypes = await multiselect({
		message: "Which checks would you like to run?",
		options: [
			{ value: "type", label: "TypeScript Type Checking" },
			{ value: "unused", label: "Detect Unused Code" },
			{ value: "deps", label: "Check Dependencies" },
			{ value: "depsUpdate", label: "Check for Outdated Dependencies" },
			{ value: "imports", label: "Validate Imports" },
			{ value: "circular", label: "Detect Circular Dependencies" },
			{ value: "complexity", label: "Check Code Complexity" },
			{ value: "size", label: "Check File Sizes" },
			{ value: "duplicates", label: "Find Duplicate Code" },
			{ value: "security", label: "Security Checks" },
			{ value: "typeSafe", label: "Check Type Safety Settings" },
			{ value: "sideEffect", label: "Detect Side Effects" },
		],
		initialValues: ["type", "unused", "deps"],
	});

	if (isCancel(checkTypes)) {
		outro("Cancelled");
		process.exit(0);
	}

	const s = spinner();
	s.start("Running checks...");

	const options = {
		types: checkTypes as CheckType[],
		parallel: true, // Example: you might want to make this configurable too
	};

	const program = runChecker(options);

	Effect.runPromise(program)
		.then(() => {
			s.stop("Checks completed successfully.");
			outro("All checks passed!");
			process.exit(0);
		})
		.catch((error: any) => {
			s.stop("Checks failed.");
			outro(`Error: ${error.message}`);
			process.exit(1);
		});
}

main().catch(console.error);
