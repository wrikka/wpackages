import { select } from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";
import type { FileStatus } from "../types/status";
import { gitCommitCommand } from "./commit";
import { gitStagingCommand } from "./staging";

// Initialize Git repository service

export async function getGitStatusDetailed(): Promise<FileStatus[]> {
	try {
		const { stdout } = await execa("git", ["status", "--porcelain"]);

		if (!stdout) return [];

		return stdout.split("\n").filter(Boolean).map(line => {
			const statusCode = line.substring(0, 2);
			const file = line.substring(3);

			// แปลง status code เป็นชื่อเต็ม
			let status = "";
			const index = statusCode[0];
			const workTree = statusCode[1];

			if (statusCode === "??") {
				status = "Untracked";
			} else if (statusCode === "MM") {
				status = "Modified (staged + unstaged)";
			} else if (index === "M" && workTree === " ") {
				status = "Modified (staged)";
			} else if (index === " " && workTree === "M") {
				status = "Modified (unstaged)";
			} else if (index === "A") {
				status = "Added";
			} else if (index === "D") {
				status = "Deleted";
			} else if (index === "R") {
				status = "Renamed";
			} else if (statusCode.includes("M")) {
				status = "Modified";
			} else {
				status = statusCode.trim() || "Unknown";
			}

			return { file, status, statusCode };
		});
	} catch {
		return [];
	}
}

function getFileColorAndIcon(status: string) {
	if (status.includes("Modified")) {
		return status.includes("staged")
			? { color: (s: string) => pc.bold(pc.green(s)), icon: "●" } // สีเขียว bold สำหรับ staged
			: { color: (s: string) => pc.bold(pc.yellow(s)), icon: "●" }; // สีเหลือง bold สำหรับ unstaged
	}

	const statusMap: Record<string, { color: (s: string) => string; icon: string }> = {
		"Added": { color: (s: string) => pc.bold(pc.green(s)), icon: "+" },
		"Deleted": { color: (s: string) => pc.bold(pc.red(s)), icon: "−" },
		"Renamed": { color: (s: string) => pc.bold(pc.magenta(s)), icon: "→" },
		"Untracked": { color: (s: string) => pc.bold(pc.cyan(s)), icon: "?" },
	};

	return statusMap[status] || { color: pc.white, icon: "○" };
}

export function buildFileTree(files: FileStatus[]) {
	const tree: Record<string, any> = {};

	files.forEach(fileStatus => {
		const parts = fileStatus.file.split("/");
		let current = tree;

		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				// ไฟล์สุดท้าย
				current[part] = fileStatus;
			} else {
				// โฟลเดอร์
				if (!current[part]) {
					current[part] = {};
				}
				current = current[part];
			}
		});
	});

	return tree;
}

export function displayTree(tree: Record<string, any>, indent = "", isLast = true) {
	const entries = Object.entries(tree);

	entries.forEach(([name, value], index) => {
		const isLastEntry = index === entries.length - 1;
		const prefix = indent + (isLast ? "└── " : "├── ");
		const nextIndent = indent + (isLast ? "    " : "│   ");

		if (value.file) {
			// เป็นไฟล์
			const { color, icon } = getFileColorAndIcon(value.status);
			console.log(prefix + color(`${icon} ${name} (${value.status})`));
		} else {
			// เป็นโฟลเดอร์
			console.log(prefix + pc.blue(`${name}/`));
			displayTree(value, nextIndent, isLastEntry);
		}
	});
}

export async function gitStatusCommand(): Promise<void> {
	const files = await getGitStatusDetailed();

	if (files.length === 0) {
		console.log(pc.green("\n✓ No changes detected"));
		return;
	}

	console.log(pc.bold(pc.blue("\n📁 Git Status")));
	console.log("");

	// แสดงสรุปจำนวนไฟล์
	const summary = files.reduce((acc, f) => {
		if (f.status.includes("staged")) acc.staged++;
		else if (f.status.includes("Modified") || f.status === "Untracked") acc.unstaged++;
		return acc;
	}, { staged: 0, unstaged: 0 });

	console.log(pc.dim(`Total: ${files.length} files`));
	if (summary.staged > 0) console.log(pc.bold(pc.green(`  ● ${summary.staged} staged`)));
	if (summary.unstaged > 0) console.log(pc.bold(pc.yellow(`  ● ${summary.unstaged} unstaged`)));
	console.log("");

	// แสดง file tree
	const tree = buildFileTree(files);
	displayTree(tree);
	console.log("");

	// แสดง actions
	const actionOptions: Array<{ label: string; value: string; hint: string }> = [];

	if (summary.unstaged > 0) {
		actionOptions.push({
			label: pc.yellow("📦 Stage files"),
			value: "stage",
			hint: "Add files to staging area",
		});
	}

	if (summary.staged > 0) {
		actionOptions.push({
			label: pc.green("💾 Commit staged files"),
			value: "commit",
			hint: "Create a commit",
		});
	}

	const action = await select({
		message: "What would you like to do?",
		options: actionOptions,
	}) as string;

	if (typeof action === "symbol") {
		return;
	}

	console.log("");

	switch (action) {
		case "stage":
			await gitStagingCommand();
			break;
		case "commit":
			await gitCommitCommand();
			break;
	}
}
