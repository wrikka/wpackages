import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const findUp = (startDir: string, fileNames: readonly string[]): string | null => {
	let current = resolve(startDir);

	while (true) {
		for (const fileName of fileNames) {
			const candidate = join(current, fileName);
			if (existsSync(candidate)) return candidate;
		}

		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
};
