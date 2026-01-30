import MarkdownIt from "markdown-it";
import type { Parser } from "../types";

interface MarkdownAST {
	type: "root";
	children: Array<{
		type: string;
		content?: string;
		tag?: string;
		children?: unknown[];
		[key: string]: unknown;
	}>;
}

/**
 * Markdown Parser implementation
 */
export const MarkdownParser: Parser<MarkdownAST> = {
	format: "markdown",

	parse: (content: string): MarkdownAST => {
		try {
			const md = new MarkdownIt();
			const tokens = md.parse(content, {});

			return {
				type: "root",
				children: tokens.map((token: any) => ({
					type: token.type,
					tag: token.tag || undefined,
					content: token.content || undefined,
					children: token.children?.map((child: any) => ({
						type: child.type,
						content: child.content || undefined,
					})) || undefined,
				})),
			};
		} catch (error) {
			throw new Error(`Failed to parse Markdown: ${String(error)}`);
		}
	},

	stringify: (ast: MarkdownAST, _options = {}): string => {
		try {
			// Simple reconstruction from AST
			let result = "";

			for (const node of ast.children) {
				if (node.type === "heading_open") {
					const level = Number.parseInt(node.tag?.replace("h", "") || "1", 10);
					result += "#".repeat(level) + " ";
				} else if (node.content) {
					result += node.content;
				}

				if (node.type.endsWith("_close")) {
					result += "\n";
				}
			}

			return result.trim();
		} catch (error) {
			throw new Error(`Failed to stringify Markdown: ${String(error)}`);
		}
	},
};
