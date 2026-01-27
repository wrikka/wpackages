import * as Schema from "@effect/schema/Schema";
import { BORDER_STYLES } from "../constant/border.const";
import { COLORS } from "../constant/color.const";

// Schema for padding
const PaddingSchema = Schema.Struct({
	top: Schema.optional(Schema.Number),
	bottom: Schema.optional(Schema.Number),
	left: Schema.optional(Schema.Number),
	right: Schema.optional(Schema.Number),
});

// Schema for Box component props
export const BoxPropsSchema: Schema.Schema<{
	readonly flexDirection?:
		| "row"
		| "column"
		| "row-reverse"
		| "column-reverse"
		| undefined;
	readonly justifyContent?:
		| "flex-start"
		| "center"
		| "flex-end"
		| "space-between"
		| "space-around"
		| undefined;
	readonly alignItems?:
		| "flex-start"
		| "center"
		| "flex-end"
		| "stretch"
		| undefined;
	readonly width?: number | string | undefined;
	readonly height?: number | string | undefined;
	readonly flexGrow?: number | undefined;
	readonly padding?:
		| {
				readonly top?: number | undefined;
				readonly bottom?: number | undefined;
				readonly left?: number | undefined;
				readonly right?: number | undefined;
		  }
		| undefined;
	readonly borderStyle?: keyof typeof BORDER_STYLES | undefined;
	readonly borderColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	// Layout
	flexDirection: Schema.optional(
		Schema.Literal("row", "column", "row-reverse", "column-reverse"),
	),
	justifyContent: Schema.optional(
		Schema.Literal(
			"flex-start",
			"center",
			"flex-end",
			"space-between",
			"space-around",
		),
	),
	alignItems: Schema.optional(
		Schema.Literal("flex-start", "center", "flex-end", "stretch"),
	),
	width: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
	height: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
	flexGrow: Schema.optional(Schema.Number),

	// Styling
	padding: Schema.optional(PaddingSchema),
	borderStyle: Schema.optional(
		Schema.Literal(
			...(Object.keys(BORDER_STYLES) as Array<keyof typeof BORDER_STYLES>),
		),
	),
	borderColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type BoxProps = Schema.Schema.Type<typeof BoxPropsSchema>;

// Schema for Text component props
export const TextPropsSchema: Schema.Schema<{
	readonly color?: keyof typeof COLORS | undefined;
	readonly bold?: boolean | undefined;
	readonly italic?: boolean | undefined;
}> = Schema.Struct({
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	bold: Schema.optional(Schema.Boolean),
	italic: Schema.optional(Schema.Boolean),
});

export type TextProps = Schema.Schema.Type<typeof TextPropsSchema>;

// Schema for Button component props
export const ButtonPropsSchema: Schema.Schema<{
	readonly label?: string | undefined;
	readonly variant?: "default" | "primary" | "danger" | "success" | undefined;
	readonly disabled?: boolean | undefined;
	readonly onPress?: (() => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly bold?: boolean | undefined;
}> = Schema.Struct({
	label: Schema.optional(Schema.String),
	variant: Schema.optional(
		Schema.Literal("default", "primary", "danger", "success"),
	),
	disabled: Schema.optional(Schema.Boolean),
	onPress: Schema.optional(Schema.Any),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	bold: Schema.optional(Schema.Boolean),
});

export type ButtonProps = Schema.Schema.Type<typeof ButtonPropsSchema>;

// Schema for Input component props
export const InputPropsSchema: Schema.Schema<{
	readonly value?: string | undefined;
	readonly placeholder?: string | undefined;
	readonly password?: boolean | undefined;
	readonly maxLength?: number | undefined;
	readonly onChange?: ((value: string) => void) | undefined;
	readonly onSubmit?: ((value: string) => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	value: Schema.optional(Schema.String),
	placeholder: Schema.optional(Schema.String),
	password: Schema.optional(Schema.Boolean),
	maxLength: Schema.optional(Schema.Number),
	onChange: Schema.optional(Schema.Any),
	onSubmit: Schema.optional(Schema.Any),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type InputProps = Schema.Schema.Type<typeof InputPropsSchema>;

// Schema for List component props
export const ListPropsSchema: Schema.Schema<{
	readonly items: ReadonlyArray<string>;
	readonly selectedIndex?: number | undefined;
	readonly onSelect?: ((index: number, item: string) => void) | undefined;
	readonly showScrollbar?: boolean | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly selectedColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	items: Schema.Array(Schema.String),
	selectedIndex: Schema.optional(Schema.Number),
	onSelect: Schema.optional(Schema.Any),
	showScrollbar: Schema.optional(Schema.Boolean),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	selectedColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type ListProps = Schema.Schema.Type<typeof ListPropsSchema>;

// Schema for Table component props
export const TablePropsSchema: Schema.Schema<{
	readonly headers: ReadonlyArray<string>;
	readonly rows: ReadonlyArray<ReadonlyArray<string>>;
	readonly selectedIndex?: number | undefined;
	readonly onSelect?: ((index: number) => void) | undefined;
	readonly showBorders?: boolean | undefined;
	readonly showScrollbar?: boolean | undefined;
	readonly headerColor?: keyof typeof COLORS | undefined;
	readonly selectedColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	headers: Schema.Array(Schema.String),
	rows: Schema.Array(Schema.Array(Schema.String)),
	selectedIndex: Schema.optional(Schema.Number),
	onSelect: Schema.optional(Schema.Any),
	showBorders: Schema.optional(Schema.Boolean),
	showScrollbar: Schema.optional(Schema.Boolean),
	headerColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	selectedColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type TableProps = Schema.Schema.Type<typeof TablePropsSchema>;

// Schema for Tabs component props
export const TabsPropsSchema: Schema.Schema<{
	readonly tabs: ReadonlyArray<string>;
	readonly selectedIndex?: number | undefined;
	readonly onSelect?: ((index: number, tab: string) => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly selectedColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	tabs: Schema.Array(Schema.String),
	selectedIndex: Schema.optional(Schema.Number),
	onSelect: Schema.optional(Schema.Any),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	selectedColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type TabsProps = Schema.Schema.Type<typeof TabsPropsSchema>;

// Schema for Progress component props
export const ProgressPropsSchema: Schema.Schema<{
	readonly value: number;
	readonly max?: number | undefined;
	readonly label?: string | undefined;
	readonly showPercentage?: boolean | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly backgroundColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	value: Schema.Number,
	max: Schema.optional(Schema.Number),
	label: Schema.optional(Schema.String),
	showPercentage: Schema.optional(Schema.Boolean),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	backgroundColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type ProgressProps = Schema.Schema.Type<typeof ProgressPropsSchema>;

// Schema for Chart component props
export const ChartPropsSchema: Schema.Schema<{
	readonly data: ReadonlyArray<ReadonlyArray<number>>;
	readonly labels?: ReadonlyArray<string> | undefined;
	readonly type?: "line" | "bar" | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly showAxes?: boolean | undefined;
	readonly showGrid?: boolean | undefined;
}> = Schema.Struct({
	data: Schema.Array(Schema.Array(Schema.Number)),
	labels: Schema.optional(Schema.Array(Schema.String)),
	type: Schema.optional(Schema.Literal("line", "bar")),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	showAxes: Schema.optional(Schema.Boolean),
	showGrid: Schema.optional(Schema.Boolean),
});

export type ChartProps = Schema.Schema.Type<typeof ChartPropsSchema>;

// Schema for Sparkline component props
export const SparklinePropsSchema: Schema.Schema<{
	readonly data: ReadonlyArray<number>;
	readonly color?: keyof typeof COLORS | undefined;
	readonly showLine?: boolean | undefined;
	readonly showDots?: boolean | undefined;
}> = Schema.Struct({
	data: Schema.Array(Schema.Number),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	showLine: Schema.optional(Schema.Boolean),
	showDots: Schema.optional(Schema.Boolean),
});

export type SparklineProps = Schema.Schema.Type<typeof SparklinePropsSchema>;

// Schema for Scrollbar component props
export const ScrollbarPropsSchema: Schema.Schema<{
	readonly position: number;
	readonly total: number;
	readonly visible: number;
	readonly color?: keyof typeof COLORS | undefined;
	readonly backgroundColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	position: Schema.Number,
	total: Schema.Number,
	visible: Schema.Number,
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	backgroundColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type ScrollbarProps = Schema.Schema.Type<typeof ScrollbarPropsSchema>;

// Schema for Modal component props
export const ModalPropsSchema: Schema.Schema<{
	readonly title?: string | undefined;
	readonly isOpen?: boolean | undefined;
	readonly onClose?: (() => void) | undefined;
	readonly width?: number | string | undefined;
	readonly height?: number | string | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly borderColor?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	title: Schema.optional(Schema.String),
	isOpen: Schema.optional(Schema.Boolean),
	onClose: Schema.optional(Schema.Any),
	width: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
	height: Schema.optional(Schema.Union(Schema.Number, Schema.String)),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	borderColor: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type ModalProps = Schema.Schema.Type<typeof ModalPropsSchema>;

// Schema for Dropdown component props
export const DropdownPropsSchema: Schema.Schema<{
	readonly items: ReadonlyArray<string>;
	readonly placeholder?: string | undefined;
	readonly isOpen?: boolean | undefined;
	readonly selectedIndex?: number | undefined;
	readonly onSelect?: ((index: number, item: string) => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	items: Schema.Array(Schema.String),
	placeholder: Schema.optional(Schema.String),
	isOpen: Schema.optional(Schema.Boolean),
	selectedIndex: Schema.optional(Schema.Number),
	onSelect: Schema.optional(
		Schema.Function({
			args: [Schema.Number, Schema.String],
			returns: Schema.Void,
		}),
	),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type DropdownProps = Schema.Schema.Type<typeof DropdownPropsSchema>;

// Schema for Checkbox component props
export const CheckboxPropsSchema: Schema.Schema<{
	readonly label?: string | undefined;
	readonly checked?: boolean | undefined;
	readonly onChange?: ((checked: boolean) => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	label: Schema.optional(Schema.String),
	checked: Schema.optional(Schema.Boolean),
	onChange: Schema.optional(Schema.Any),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type CheckboxProps = Schema.Schema.Type<typeof CheckboxPropsSchema>;

// Schema for Radio component props
export const RadioPropsSchema: Schema.Schema<{
	readonly options: ReadonlyArray<string>;
	readonly selectedIndex?: number | undefined;
	readonly onChange?: ((index: number, value: string) => void) | undefined;
	readonly color?: keyof typeof COLORS | undefined;
}> = Schema.Struct({
	options: Schema.Array(Schema.String),
	selectedIndex: Schema.optional(Schema.Number),
	onChange: Schema.optional(Schema.Any),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
});

export type RadioProps = Schema.Schema.Type<typeof RadioPropsSchema>;

// Schema for Spinner component props
export const SpinnerPropsSchema: Schema.Schema<{
	readonly type?: "dots" | "line" | "bar" | undefined;
	readonly color?: keyof typeof COLORS | undefined;
	readonly label?: string | undefined;
}> = Schema.Struct({
	type: Schema.optional(Schema.Literal("dots", "line", "bar")),
	color: Schema.optional(
		Schema.Literal(...(Object.keys(COLORS) as Array<keyof typeof COLORS>)),
	),
	label: Schema.optional(Schema.String),
});

export type SpinnerProps = Schema.Schema.Type<typeof SpinnerPropsSchema>;

// Schema for Canvas component props
export const CanvasPropsSchema: Schema.Schema<{
	readonly width: number;
	readonly height: number;
	readonly onDraw?: ((ctx: CanvasContext) => void) | undefined;
}> = Schema.Struct({
	width: Schema.Number,
	height: Schema.Number,
	onDraw: Schema.optional(Schema.Any),
});

export type CanvasProps = Schema.Schema.Type<typeof CanvasPropsSchema>;

// Canvas context schema
export const CanvasContextSchema: Schema.Schema<{
	readonly width: number;
	readonly height: number;
	readonly clear: () => void;
	readonly drawPixel: (x: number, y: number, char: string) => void;
	readonly drawLine: (
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		char: string,
	) => void;
	readonly drawRect: (
		x: number,
		y: number,
		width: number,
		height: number,
		char: string,
	) => void;
	readonly drawText: (x: number, y: number, text: string) => void;
}> = Schema.Struct({
	width: Schema.Number,
	height: Schema.Number,
	clear: Schema.Any,
	drawPixel: Schema.Any,
	drawLine: Schema.Any,
	drawRect: Schema.Any,
	drawText: Schema.Any,
});

export type CanvasContext = Schema.Schema.Type<typeof CanvasContextSchema>;
