import { DEFAULT_GLOBS_BY_LANG } from "./config/defaults.config";
import { parseArgs } from "./services/args.service";
import { listFiles } from "./services/file-discovery.service";
import { printMatches } from "./services/output.service";
import { replaceInFile } from "./services/replace.service";
import { searchInFile } from "./services/search.service";
import type { MatchRecord } from "./types/cli.type";

export const runCodeSearchApp = async () => {
	const opts = parseArgs(process.argv.slice(2));
	const globs = DEFAULT_GLOBS_BY_LANG[opts.lang] ?? DEFAULT_GLOBS_BY_LANG["typescript"];
	const files = await listFiles(opts.paths, globs);

	const all: MatchRecord[] = [];
	let hasChanges = false;

	for (const filePath of files) {
		if (!opts.replace) {
			const matches = await searchInFile({
				filePath,
				nodeType: opts.nodeType,
				lang: opts.lang,
				includeText: opts.output === "json",
			});
			all.push(...matches);
			continue;
		}

		const replacement = opts.replace;
		if (!replacement) {
			throw new Error("Internal error: --replace value is missing");
		}

		const res = await replaceInFile({
			filePath,
			nodeType: opts.nodeType,
			replacement,
			lang: opts.lang,
		});
		all.push(...res.matches);
		if (res.changed) {
			hasChanges = true;
			if (opts.write) {
				await Bun.write(filePath, res.rewritten);
			}
		}
	}

	printMatches(opts, all);
	if (opts.replace && opts.check && hasChanges) process.exit(1);
};
