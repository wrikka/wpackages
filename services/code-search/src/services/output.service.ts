import type { CliOptions, MatchRecord } from "../types/cli.type";

export const printMatches = (opts: CliOptions, records: readonly MatchRecord[]) => {
	if (opts.countOnly) {
		console.log(records.length);
		return;
	}

	if (opts.output === "json") {
		console.log(JSON.stringify(records, null, 2));
		return;
	}

	for (const r of records) {
		const loc = r.start !== undefined && r.end !== undefined ? `[${r.start},${r.end}]` : "";
		console.log(`${r.file}: ${r.type}${loc}`);
	}
};
