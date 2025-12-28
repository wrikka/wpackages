import { select, spinner, text } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";
import { generateCommitMessageWithAI } from "../utils/ai";
import { getTypeDescription, runGitCommand } from "../utils/common";
import { getCommitConfig, isAICommitEnabled } from "../utils/config";
import { getGitStatusDetailed } from "./status";

async function getStagedDiff(): Promise<string> {
	try {
		const { stdout } = await execa("git", ["diff", "--cached"]);
		return stdout;
	} catch {
		throw new Error("Failed to get staged diff");
	}
}

async function generateAICommitMessage(): Promise<string> {
	// ดึง diff ของไฟล์ที่ staged
	const diff = await getStagedDiff();

	if (!diff.trim()) {
		throw new Error("No staged changes to analyze");
	}

	// ตัด diff ถ้ายาวเกินไป (เหลือ 8000 chars สำหรับ token limit)
	const maxDiffLength = 8000;
	const truncatedDiff = diff.length > maxDiffLength
		? diff.substring(0, maxDiffLength) + "\n\n... (diff truncated)"
		: diff;

	// เรียกใช้ AI
	return await generateCommitMessageWithAI(truncatedDiff);
}

export async function gitCommitCommand(): Promise<void> {
	const files = await getGitStatusDetailed();
	const stagedFiles = files.filter(f => f.statusCode[0] !== " " && f.statusCode[0] !== "?" && f.statusCode !== "??");

	if (stagedFiles.length === 0) {
		console.log(pc.red("\n✗ No staged files for commit"));
		console.log(pc.dim("Run \"git-cli add\" to stage files first"));
		return;
	}

	// แสดงสรุปไฟล์ที่จะ commit
	console.log(pc.bold(pc.green(`\n💾 Commit Preparation`)));
	console.log("");
	console.log(pc.dim(`Staged files: ${stagedFiles.length}`));
	console.log("");

	// ตรวจสอบ AI config
	const aiEnabled = isAICommitEnabled();
	const commitConfig = getCommitConfig();

	// เลือก commit mode (แสดง AI option เฉพาะเมื่อ enabled)
	const modeOptions = [
		{ value: "manual", label: "✍️  Manual Commit", hint: "Write your own message" },
	];

	if (aiEnabled) {
		modeOptions.unshift(
			{ value: "ai", label: "🤖 AI Commit", hint: "Auto-generate commit message" },
		);
	}

	const mode = await select({
		message: "Choose commit mode:",
		options: modeOptions,
	}) as string;

	if (typeof mode === "symbol") {
		return;
	}

	let commitMessage = "";

	if (mode === "ai") {
		// AI mode: generate commit message
		const s = spinner();
		s.start("🤖 Analyzing changes with AI...");

		try {
			commitMessage = await generateAICommitMessage();
			s.stop("✓ AI analysis complete");
			console.log("");
			console.log(pc.cyan(`Generated message: "${commitMessage}"`));
			console.log("");

			// ถามว่าจะใช้ message นี้หรือไม่
			const confirm = await select({
				message: "Use this commit message?",
				options: [
					{ value: "yes", label: "✓ Yes, commit with this message" },
					{ value: "edit", label: "✏️  Edit message" },
					{ value: "cancel", label: "✗ Cancel" },
				],
			}) as string;

			if (typeof confirm === "symbol" || confirm === "cancel") {
				console.log(pc.dim("\nCommit cancelled"));
				return;
			}

			if (confirm === "edit") {
				const edited = await text({
					message: "Edit commit message:",
					placeholder: commitMessage,
					initialValue: commitMessage,
					validate: (value) => {
						if (!value.trim()) {
							return "Please enter a commit message";
						}
					},
				});

				if (typeof edited === "symbol") {
					console.log(pc.dim("\nCommit cancelled"));
					return;
				}

				commitMessage = edited;
			}
		} catch (error) {
			s.stop("✗ AI generation failed");
			console.log("");
			console.log(pc.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
			console.log(pc.dim("\nFalling back to manual commit..."));
			console.log("");

			// Fallback to manual commit
			const fallbackMessage = await text({
				message: "Enter commit message manually:",
				placeholder: "feat: your message here",
				validate: (value) => {
					if (!value.trim()) {
						return "Please enter a commit message";
					}
				},
			});

			if (typeof fallbackMessage === "symbol") {
				console.log(pc.dim("\nCommit cancelled"));
				return;
			}

			commitMessage = fallbackMessage;
		}
	} else {
		// Manual mode: เลือก conventional commit type
		let commitType = "";
		let commitScope = "";

		if (commitConfig?.conventionalCommits) {
			const types = commitConfig.types || ["feat", "fix", "docs", "style", "refactor", "test", "chore", "perf"];

			const typeOptions = types.map(type => ({
				value: type,
				label: type,
				hint: getTypeDescription(type),
			}));

			commitType = await select({
				message: "Select commit type:",
				options: typeOptions,
			}) as string;

			if (typeof commitType === "symbol") {
				return;
			}

			// ถ้า config กำหนดให้มี scope
			if (commitConfig.requireScope) {
				const scopeInput = await text({
					message: "Enter scope (optional):",
					placeholder: "e.g., api, ui, auth",
				});

				if (typeof scopeInput === "symbol") {
					return;
				}

				if (scopeInput.trim()) {
					commitScope = `(${scopeInput.trim()})`;
				}
			}
		}

		// Manual mode: ask for commit message

		const message = await text({
			message: "Enter commit message:",
			placeholder: commitConfig?.conventionalCommits
				? `${commitType}${commitScope}: your message here`
				: "feat: add new feature",
			validate: (value) => {
				if (!value.trim()) {
					return "Please enter a commit message";
				}
			},
		});

		if (typeof message === "symbol") {
			return;
		}

		// รวม type + scope + message
		commitMessage = commitConfig?.conventionalCommits
			? `${commitType}${commitScope}: ${message}`
			: message;
	}

	try {
		await runGitCommand(["commit", "-m", commitMessage]);
		console.log(pc.green(`\n✓ Commit successful: "${commitMessage}"`));
	} catch (error) {
		console.log(pc.red("\n✗ Failed to create commit"));
		console.error(error);
	}
}
