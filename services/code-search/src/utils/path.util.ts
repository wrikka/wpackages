import { stat } from "node:fs/promises";
import { resolve } from "node:path";

export const isGlobLike = (value: string): boolean => value.includes("*") || value.includes("?");

export const toAbsolutePath = (value: string): string => resolve(value);

export const tryStat = async (path: string): Promise<ReturnType<typeof stat> | undefined> => {
	try {
		return await stat(path);
	} catch {
		return undefined;
	}
};
