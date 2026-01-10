import type { TextProps } from "../types/schema";
import { h } from "../types/vnode";

type TextComponentProps = TextProps & {
	readonly children?: string;
};

export const Text = (
	props: TextComponentProps,
	children?: string,
): ReturnType<typeof h> => {
	const resolvedChildren = children ?? props.children ?? "";
	const { children: _children, ...rest } = props;
	return h("text", rest as TextProps, resolvedChildren);
};
