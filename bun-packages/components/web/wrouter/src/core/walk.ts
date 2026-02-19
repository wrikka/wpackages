import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const walkFiles = (dir: string): string[] => {
	const items = readdirSync(dir);
	const out: string[] = [];
	for (const item of items) {
		const full = join(dir, item);
		const s = statSync(full);
		if (s.isDirectory()) {
			out.push(...walkFiles(full));
			continue;
		}
		out.push(full);
	}
	return out;
};
