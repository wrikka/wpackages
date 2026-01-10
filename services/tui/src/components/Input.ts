import type { InputProps } from "../types/schema";
import { h } from "../types/vnode";

type InputComponentProps = InputProps;

export const Input = (
	props: InputComponentProps,
): ReturnType<typeof h> => {
	const {
		value = "",
		placeholder = "Type here...",
		password = false,
		maxLength,
		color = "white",
		...rest
	} = props;

	const displayValue = password ? "*".repeat(value.length) : value;
	const maxLengthDisplay = maxLength ? ` (${value.length}/${maxLength})` : "";
	const displayText = value ? displayValue + maxLengthDisplay : placeholder;

	return h(
		"box",
		{ ...rest, flexDirection: "row", alignItems: "center", padding: { top: 0, bottom: 0, left: 1, right: 1 }, borderStyle: "single", borderColor: color },
		h("text", { color: value ? color : "gray" }, `${displayText}${value ? "" : " "}`),
	);
};
