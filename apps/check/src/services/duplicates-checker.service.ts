import { Context, Effect, Layer } from "effect";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { collectFiles } from "../components/index";
import { CHECK_NAMES } from "../constant/index";
import type { CheckIssue, CheckResult } from "../types/index";

export class DuplicatesCheckerService extends Context.Tag(
	"DuplicatesCheckerService",
)<
	DuplicatesCheckerService,
	{
		check: (
			patterns: string[],
			minLines?: number,
		) => Effect.Effect<CheckResult, Error>;
	}
>() {}

type CodeBlock = {
	file: string;
	startLine: number;
	endLine: number;
	hash: string;
	content: string;
};

export const makeDuplicatesCheckerService = () => {
	const check = (
		patterns: string[],
		minLines = 5,
	): Effect.Effect<CheckResult, Error> =>
		Effect.gen(function*() {
			const startTime = Date.now();
			const issues: CheckIssue[] = [];

			try {
				const hashMap = new Map<string, CodeBlock[]>();

				// Collect all files matching patterns
				const files = yield* Effect.promise(() => collectFiles(patterns));

				// Extract code blocks from files
				for (const file of files) {
					try {
						const content = yield* Effect.promise(() => readFile(file, "utf-8"));
						const lines = content.split("\n");

						// Create sliding window of code blocks
						for (let i = 0; i <= lines.length - minLines; i++) {
							const blockLines = lines.slice(i, i + minLines);
							const blockContent = blockLines.join("\n").trim();

							// Skip empty or very short blocks
							if (blockContent.length < 50) continue;

							// Create hash of normalized content (remove whitespace variations)
							const normalized = blockContent.replace(/\s+/g, " ");
							const blockHash = createHash("md5")
								.update(normalized)
								.digest("hex");

							const block: CodeBlock = {
								content: blockContent,
								endLine: i + minLines,
								file,
								hash: blockHash,
								startLine: i + 1,
							};

							if (!hashMap.has(blockHash)) {
								hashMap.set(blockHash, []);
							}
							const existing = hashMap.get(blockHash);
							if (existing) {
								existing.push(block);
							}
						}
						// eslint-disable-next-line no-unused-vars
					} catch (_) {
						// Ignore file parsing errors - some files might have syntax issues
					}
				}

				// Find duplicates
				for (const [, blocks] of hashMap.entries()) {
					if (blocks.length > 1) {
						// Group by file to avoid reporting duplicates within same file too aggressively
						const fileGroups = new Map<string, CodeBlock[]>();

						for (const block of blocks) {
							if (!fileGroups.has(block.file)) {
								fileGroups.set(block.file, []);
							}
							const group = fileGroups.get(block.file);
							if (group) {
								group.push(block);
							}
						}

						// Only report if duplicates exist across different files
						if (fileGroups.size > 1 && blocks[0]) {
							const locations = blocks
								.map((b) => `${b.file}:${b.startLine}-${b.endLine}`)
								.slice(0, 3) // Limit to first 3 occurrences
								.join(", ");

							issues.push({
								file: blocks[0].file,
								line: blocks[0].startLine,
								message: `Duplicate code block found in ${blocks.length} locations`,
								severity: "warning",
								suggestion: `Consider extracting to a shared function. Found in: ${locations}`,
							});
						}
					}
				}

				return {
					duration: Date.now() - startTime,
					issues,
					name: CHECK_NAMES.duplicates,
					status: issues.length > 0 ? ("failed" as const) : ("passed" as const),
					summary: `Checked ${files.length} files, found ${issues.length} duplicate code blocks`,
				};
			} catch (error) {
				return yield* Effect.fail(
					error instanceof Error
						? error
						: new Error("Duplicates checking failed"),
				);
			}
		});

	return { check };
};

export const DuplicatesCheckerLive = Layer.effect(
	DuplicatesCheckerService,
	Effect.sync(() => makeDuplicatesCheckerService()),
);
