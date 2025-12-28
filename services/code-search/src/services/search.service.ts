import type { MatchRecord } from "../types/cli.type";
import type { LangKey } from "../types/cli.type";
import { parseTargetFile, traverseAst } from "./parser.service";

type NodeWithRange = { type: string; start?: number; end?: number };

export const searchInFile = async (params: {
	filePath: string;
	nodeType: string;
	lang: LangKey;
	includeText: boolean;
}): Promise<readonly MatchRecord[]> => {
	const parsed = await parseTargetFile(params.filePath, params.lang);
	if (!parsed.ok) return [];

	const ast = parsed.ast as unknown;
	const matches: MatchRecord[] = [];

	traverseAst(ast, (node) => {
		const n = node as unknown as NodeWithRange;
		if (n.type !== params.nodeType) return;
		matches.push({
			file: params.filePath,
			type: n.type,
			...(typeof n.start === "number" ? { start: n.start } : {}),
			...(typeof n.end === "number" ? { end: n.end } : {}),
			...(params.includeText ? { text: JSON.stringify(node) } : {}),
		});
	});

	return matches;
};
