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
