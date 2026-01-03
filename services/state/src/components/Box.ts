import type { BoxProps } from "../types/schema";
import { h, type VNode } from "../types/vnode";

type BoxComponentProps = BoxProps & {
	readonly children?: Array<VNode | string>;
};

export const Box = (
	props: BoxComponentProps,
	children?: Array<VNode | string>,
): ReturnType<typeof h> => {
	const resolvedChildren = children ?? props.children ?? [];
	const { children: _children, ...rest } = props;
	return h("box", rest as BoxProps, ...resolvedChildren);
};
