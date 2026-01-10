#!/usr/bin/env bun
import { Effect } from "effect";
import { runTranslation, analyzeCode } from "../src/app";
import { printError } from "../src/components";
import { parseArgs, printHelp } from "../src/lib";

const args = process.argv.slice(2);

const main = (): Effect.Effect<void, never> => {
	return Effect.gen(function* () {
		const parsed = yield* parseArgs(args);
		const { request, analyze, help } = parsed;

		if (help) {
			printHelp();
			return;
		}

		if (analyze && request?.sourceCode) {
			yield* analyzeCode(request.sourceCode);
			return;
		}

		if (!request || !request.sourceCode || !request.sourceLanguage || !request.targetLanguage) {
			printError("Missing required arguments");
			printHelp();
			return;
		}

		yield* runTranslation(request);
	});
};

Effect.runPromise(main());
