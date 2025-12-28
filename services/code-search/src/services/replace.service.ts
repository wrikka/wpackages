import type { MatchRecord } from "../types/cli.type";
import type { LangKey } from "../types/cli.type";
import { applyEdits, type TextEdit } from "../utils/edit.util";
import { parseTargetFile, traverseAst } from "./parser.service";

type NodeWithRange = { type: string; start?: number; end?: number };

export const replaceInFile = async (params: {
	filePath: string;
	nodeType: string;
	replacement: string;
	lang: LangKey;
}): Promise<{ matches: readonly MatchRecord[]; rewritten: string; changed: boolean }> => {
	const source = await Bun.file(params.filePath).text();
	const parsed = await parseTargetFile(params.filePath, params.lang);
	if (!parsed.ok) return { matches: [], rewritten: source, changed: false };

	const ast = parsed.ast as unknown;
	const matches: MatchRecord[] = [];
	const edits: TextEdit[] = [];

	traverseAst(ast, (node) => {
		const n = node as unknown as NodeWithRange;
		if (n.type !== params.nodeType) return;
		if (typeof n.start !== "number" || typeof n.end !== "number") return;
		matches.push({
			file: params.filePath,
			type: n.type,
			...(typeof n.start === "number" ? { start: n.start } : {}),
			...(typeof n.end === "number" ? { end: n.end } : {}),
		});
		edits.push({ start: n.start, end: n.end, insertedText: params.replacement });
	});

	if (edits.length === 0) return { matches, rewritten: source, changed: false };
	const rewritten = applyEdits(source, edits);
	return { matches, rewritten, changed: rewritten !== source };
};
