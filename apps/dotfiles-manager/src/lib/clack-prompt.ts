import * as clack from "@clack/prompts";
import { existsSync, mkdirSync } from "node:fs";

export const ensureDirectoryExists = (path: string): void => {
	if (!existsSync(path)) {
		mkdirSync(path, { recursive: true });
	}
};

export const handleCancel = (value: unknown): void => {
	if (clack.isCancel(value)) {
		clack.cancel("Operation cancelled");
		process.exit(0);
	}
};
