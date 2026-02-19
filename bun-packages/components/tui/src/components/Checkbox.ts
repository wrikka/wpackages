import type { CheckboxProps } from "../types/schema";
import { h } from "../types/vnode";
import { CHECKBOX_SYMBOLS } from "../constant/widget.const";

type CheckboxComponentProps = CheckboxProps;

export const Checkbox = (
	props: CheckboxComponentProps,
): ReturnType<typeof h> => {
	const {
		label = "Checkbox",
		checked = false,
		color = "green",
		...rest
	} = props;

	const symbol = checked
		? CHECKBOX_SYMBOLS.checked
		: CHECKBOX_SYMBOLS.unchecked;

	return h(
		"box",
		{ ...rest, flexDirection: "row", alignItems: "center" },
		h("text", { color, bold: checked }, `${symbol} ${label}`),
	);
};
