import { parseSync } from "oxc-parser";
import type { LangKey } from "../types/cli.type";

type AstNode = {
	type: string;
	start?: number;
	end?: number;
	[key: string]: unknown;
};

export type ParsedFile =
	| { ok: true; filePath: string; ast: unknown }
	| { ok: false; filePath: string; error: string };

export const parseTargetFile = async (
	filePath: string,
	_lang: LangKey,
): Promise<ParsedFile> => {
	try {
		const source = await Bun.file(filePath).text();
		const result = parseSync(filePath, source);
		return { ok: true, filePath, ast: result.program };
	} catch (error) {
		return {
			ok: false,
			filePath,
			error: error instanceof Error ? error.message : "Failed to parse file",
		};
	}
};

type Visitor = (node: AstNode, parent?: AstNode) => undefined | boolean;

export const traverseAst = (
	node: unknown,
	visitor: (node: AstNode, parent?: AstNode) => void,
	parent?: AstNode,
): void => {
	if (!node || typeof node !== "object") return;
	const astNode = node as AstNode;
	const shouldStop = (visitor as unknown as Visitor)(astNode, parent);
	if (shouldStop === false) return;

	for (const [key, value] of Object.entries(astNode)) {
		if (key === "type" || key === "start" || key === "end") continue;
		if (Array.isArray(value)) {
			for (const item of value) traverseAst(item, visitor, astNode);
			continue;
		}
		if (value && typeof value === "object") {
			traverseAst(value, visitor, astNode);
		}
	}
};
