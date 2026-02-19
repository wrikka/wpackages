import type { IrNode, Props } from "../types/ir";
import { escapeHtmlAttr, escapeHtmlText } from "./escape";

export type RenderCtx = {
	readonly escapeText: (s: string) => string;
	readonly escapeAttr: (s: string) => string;
};

export const defaultCtx: RenderCtx = {
	escapeText: escapeHtmlText,
	escapeAttr: escapeHtmlAttr,
};

export const renderChildren = (
	nodes: ReadonlyArray<IrNode>,
	renderNode: (node: IrNode) => string,
): string => nodes.map(renderNode).join("");

export const renderHtmlProps = (props: Props, ctx: RenderCtx): string => {
	const entries = Object.entries(props);
	const parts: Array<string> = [];

	for (const [key, value] of entries) {
		if (value === undefined) continue;
		if (typeof value === "boolean") {
			if (value) parts.push(key);
			continue;
		}

		parts.push(`${key}="${ctx.escapeAttr(String(value))}"`);
	}

	return parts.length === 0 ? "" : ` ${parts.join(" ")}`;
};
