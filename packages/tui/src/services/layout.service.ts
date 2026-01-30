import { Context, Effect, Layer } from "effect";
import yoga, { Node } from "yoga-layout-prebuilt";
type YogaNodeType = ReturnType<typeof Node.create>;
import type { BoxProps } from "../types/schema";
import type { VNode } from "../types/vnode";

export interface Layout {
	x: number;
	y: number;
	width: number;
	height: number;
	children: Layout[];
	node: VNode;
}

export interface LayoutService {
	readonly calculateLayout: (
		node: VNode,
		width: number,
		height: number,
	) => Effect.Effect<Layout, never>;
}

export const LayoutService: Context.Tag<LayoutService, LayoutService> =
	Context.GenericTag<LayoutService>("LayoutService");

const flexDirectionMap = {
	row: yoga.FLEX_DIRECTION_ROW,
	column: yoga.FLEX_DIRECTION_COLUMN,
	"row-reverse": yoga.FLEX_DIRECTION_ROW_REVERSE,
	"column-reverse": yoga.FLEX_DIRECTION_COLUMN_REVERSE,
};

const justifyContentMap = {
	"flex-start": yoga.JUSTIFY_FLEX_START,
	center: yoga.JUSTIFY_CENTER,
	"flex-end": yoga.JUSTIFY_FLEX_END,
	"space-between": yoga.JUSTIFY_SPACE_BETWEEN,
	"space-around": yoga.JUSTIFY_SPACE_AROUND,
};

const alignItemsMap = {
	"flex-start": yoga.ALIGN_FLEX_START,
	center: yoga.ALIGN_CENTER,
	"flex-end": yoga.ALIGN_FLEX_END,
	stretch: yoga.ALIGN_STRETCH,
};

const createYogaNode = (vNode: VNode): YogaNodeType => {
	const yogaNode = Node.create();

	if (vNode.type === "text") {
		const textContent = (vNode.children ?? [])
			.filter((c): c is string => typeof c === "string")
			.join("");
		yogaNode.setMeasureFunc((_width) => {
			return { width: textContent.length, height: 1 };
		});
	} else if (vNode.type === "box") {
		const props = vNode.props as BoxProps;
		if (props.width) yogaNode.setWidth(props.width);
		if (props.height) yogaNode.setHeight(props.height);
		if (props.flexGrow) yogaNode.setFlexGrow(props.flexGrow);
		if (props.flexDirection) {
			yogaNode.setFlexDirection(
				flexDirectionMap[props.flexDirection as keyof typeof flexDirectionMap],
			);
		}
		if (props.justifyContent) {
			yogaNode.setJustifyContent(
				justifyContentMap[
					props.justifyContent as keyof typeof justifyContentMap
				],
			);
		}
		if (props.alignItems) {
			yogaNode.setAlignItems(
				alignItemsMap[props.alignItems as keyof typeof alignItemsMap],
			);
		}

		const childVNodes = (vNode.children ?? []).filter(
			(c): c is VNode => typeof c !== "string",
		);

		childVNodes.forEach((childVNode, i) => {
			const childYogaNode = createYogaNode(childVNode);
			yogaNode.insertChild(childYogaNode, i);
		});
	}

	return yogaNode;
};

const buildLayoutTree = (yogaNode: YogaNodeType, vNode: VNode): Layout => {
	if (vNode.type === "text") {
		return {
			x: yogaNode.getComputedLeft(),
			y: yogaNode.getComputedTop(),
			width: yogaNode.getComputedWidth(),
			height: yogaNode.getComputedHeight(),
			children: [],
			node: vNode,
		};
	}

	const childVNodes = (vNode.children ?? []).filter(
		(c): c is VNode => typeof c !== "string",
	);

	return {
		x: yogaNode.getComputedLeft(),
		y: yogaNode.getComputedTop(),
		width: yogaNode.getComputedWidth(),
		height: yogaNode.getComputedHeight(),
		children: childVNodes
			.map((childVNode, i) => {
				const childYogaNode = yogaNode.getChild(i);
				return childYogaNode
					? buildLayoutTree(childYogaNode, childVNode)
					: null;
			})
			.filter((c): c is Layout => c !== null),
		node: vNode,
	};
};

export const LayoutServiceLive: Layer.Layer<LayoutService> = Layer.succeed(
	LayoutService,
	{
		calculateLayout: (node, width, height) =>
			Effect.sync(() => {
				const rootYogaNode = createYogaNode(node);
				rootYogaNode.setWidth(width);
				rootYogaNode.setHeight(height);
				rootYogaNode.calculateLayout(width, height, yoga.DIRECTION_LTR);
				const layout = buildLayoutTree(rootYogaNode, node);
				rootYogaNode.freeRecursive();
				return layout;
			}),
	},
);
