// Virtual Node for our UI
export interface VNode {
	readonly _tag: "VNode";
	readonly type: string;
	readonly props: Record<string, unknown>;
	readonly children: (VNode | string)[];
}

export const h = (
	type: string,
	props: Record<string, unknown>,
	...children: (VNode | string)[]
): VNode => ({
	_tag: "VNode",
	type,
	props,
	children,
});
