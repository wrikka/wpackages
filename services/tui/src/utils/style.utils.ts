import p from "picocolors";
import type { Color } from "../constant/color.const";

export const isColor = (key: string): key is Color => key in p;

export const getColorStyle = (
	color: Color | undefined,
): ((s: string) => string) => {
	if (!color || !isColor(color)) return (s) => s;
	return p[color] as (s: string) => string;
};

export const applyTextStyle = (props: {
	color?: Color;
	bold?: boolean;
	italic?: boolean;
}): ((s: string) => string) => {
	let style = getColorStyle(props.color);
	if (props.bold) style = (s) => p.bold(style(s));
	if (props.italic) style = (s) => p.italic(style(s));
	return style;
};
