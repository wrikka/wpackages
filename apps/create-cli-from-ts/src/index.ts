#!/usr/bin/env node

import { confirm, intro, note, outro, spinner, text } from "@clack/prompts";
import * as path from "path";
import { buildPackageLogic, type BuildPCOptions } from "./useBuildPackage";
import { renderDependencies, renderFileTree } from "./components/file-tree-renderer";
import { HELP_TEXT, SPINNER_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES } from "./constant";

const useBuildPackage = () => {
	return async (entryFile: string): Promise<void> => {
		intro("🚀 BuildPC - Bundle imported files into packages");

		// Ask for package name
		const packageName = await text({
			message: "What should your package be called?",
			placeholder: path.basename(entryFile, path.extname(entryFile)),
			defaultValue: path.basename(entryFile, path.extname(entryFile)),
		});

		if (!packageName || typeof packageName === "symbol") {
			console.log(ERROR_MESSAGES.PACKAGE_NAME_REQUIRED);
			process.exit(1);
		}

		// Ask for AI assistance
		const useAI = await confirm({
			message: "Would you like AI assistance for README and package.json enhancement?",
			initialValue: false,
		});

		let openaiKey: string | undefined;
		if (useAI) {
			const apiKey = await text({
				message: "Enter your OpenAI API key:",
				placeholder: "sk-...",
			});

			if (apiKey && typeof apiKey === "string") {
				openaiKey = apiKey;
			} else {
				console.log(ERROR_MESSAGES.NO_API_KEY);
			}
		}

		const options: BuildPCOptions = {
			aiMode: useAI && !!openaiKey,
			openaiKey: openaiKey || undefined,
		};

		const s = spinner();
		s.start(SPINNER_MESSAGES.ANALYZING);

		try {
			const result = await buildPackageLogic(entryFile, packageName as string, options);
			const { state, packagesDir } = result;

			s.stop(SPINNER_MESSAGES.ANALYSIS_COMPLETE);

			note(
				renderFileTree(state.allFiles, process.cwd()),
				`Found ${state.allFiles.length} files`,
			);

			if (state.detectedDependencies.size > 0) {
				note(
					renderDependencies(state.detectedDependencies),
					`Detected ${state.detectedDependencies.size} dependencies`,
				);
			}

			note(
				[
					`${SUCCESS_MESSAGES.LOCATION} ${path.relative(process.cwd(), packagesDir)}`,
					SUCCESS_MESSAGES.DEPENDENCIES,
					SUCCESS_MESSAGES.BUILD_TOOL,
					SUCCESS_MESSAGES.CODE_QUALITY,
					SUCCESS_MESSAGES.GIT_HOOKS,
				].join("\n"),
				SUCCESS_MESSAGES.PACKAGE_CREATED,
			);

			// Ask user for next actions
			const shouldCommit = await confirm({
				message: "Would you like to commit changes to GitHub?",
				initialValue: false,
			});

			if (shouldCommit) {
				const s3 = spinner();
				s3.start(SPINNER_MESSAGES.COMMITTING);
				// TODO: Implement git commit logic
				s3.stop(SPINNER_MESSAGES.COMMITTED);
			}

			const shouldPublish = await confirm({
				message: "Would you like to publish to npm?",
				initialValue: false,
			});

			if (shouldPublish) {
				const s4 = spinner();
				s4.start(SPINNER_MESSAGES.PUBLISHING);
				// TODO: Implement npm publish logic
				s4.stop(SPINNER_MESSAGES.PUBLISHED);
			}

			outro(SUCCESS_MESSAGES.COMPLETED);
		} catch (error) {
			console.error(`${ERROR_MESSAGES.BUNDLING_ERROR}`, error);
			process.exit(1);
		}
	};
};

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(HELP_TEXT);
		return;
	}

	const entryFile = args[0]!;
	const buildPackage = useBuildPackage();
	await buildPackage(entryFile);
}

if (import.meta.main) {
	main().catch(console.error);
}
