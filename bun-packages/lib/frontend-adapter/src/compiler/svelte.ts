import type { IrNode } from "../types/ir";
import { defaultCtx, renderChildren, renderHtmlProps } from "./shared";

export const renderSvelte = (root: IrNode): string => {
	const ctx = defaultCtx;

	const renderNode = (node: IrNode): string => {
		if (node._tag === "Text") {
			return ctx.escapeText(node.value);
		}

		const props = renderHtmlProps(node.props, ctx);
		const children = renderChildren(node.children, renderNode);

		return `<${node.tag}${props}>${children}</${node.tag}>`;
	};

	return renderNode(root);
};
