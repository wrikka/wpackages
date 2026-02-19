// Mock embed macro for test environment
import { readFileSync } from "fs";
import { resolve } from "path";

export const embed = (filePath: string): string => {
	const absolutePath = resolve(process.cwd(), "test", filePath);
	try {
		return readFileSync(absolutePath, "utf-8");
	} catch (error) {
		throw new Error("Failed to read file: " + (error instanceof Error ? error.message : String(error)));
	}
};

export const embedGlob = (pattern: string): Record<string, string> => {
	return {};
};

export const embedBase64 = (filePath: string): string => {
	return "";
};
