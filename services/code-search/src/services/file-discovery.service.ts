import { resolve } from "node:path";
import { isGlobLike, tryStat } from "../utils/path.util";

export const listFiles = async (roots: readonly string[], globs: readonly string[]): Promise<string[]> => {
	const files = new Set<string>();
	for (const root of roots) {
		if (isGlobLike(root)) {
			const glob = new Bun.Glob(root);
			for await (const match of glob.scan({ cwd: process.cwd(), onlyFiles: true })) {
				files.add(resolve(match));
			}
			continue;
		}

		const st = await tryStat(root);
		if (!st) continue;
		if (st.isFile()) {
			files.add(resolve(root));
			continue;
		}
		if (!st.isDirectory()) continue;

		for (const g of globs) {
			const glob = new Bun.Glob(g);
			for await (const match of glob.scan({ cwd: root, onlyFiles: true })) {
				files.add(resolve(root, match));
			}
		}
	}
	return [...files];
};
