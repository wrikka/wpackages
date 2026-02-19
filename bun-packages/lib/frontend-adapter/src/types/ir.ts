export type Primitive = string | number | boolean;

export type Props = Readonly<Record<string, Primitive | undefined>>;

export type IrNode = IrText | IrElement;

export type IrText = {
	readonly _tag: "Text";
	readonly value: string;
};

export type IrElement = {
	readonly _tag: "Element";
	readonly tag: string;
	readonly props: Props;
	readonly children: ReadonlyArray<IrNode>;
};

export const text = (value: string): IrText => ({ _tag: "Text", value });

export const el = (
	tag: string,
	props: Props,
	children: ReadonlyArray<IrNode>,
): IrElement => ({ _tag: "Element", tag, props, children });
