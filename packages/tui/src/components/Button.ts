import type { ButtonProps } from "../types/schema";
import { h } from "../types/vnode";

type ButtonComponentProps = ButtonProps;

export const Button = (props: ButtonComponentProps): ReturnType<typeof h> => {
	const {
		label = "Button",
		variant = "default",
		disabled = false,
		color,
		bold = true,
		...rest
	} = props;

	const textColor =
		color ??
		(variant === "primary"
			? "blue"
			: variant === "danger"
				? "red"
				: variant === "success"
					? "green"
					: "white");
	const prefix = "[";
	const suffix = "]";

	return h(
		"box",
		{ ...rest, flexDirection: "row", alignItems: "center" },
		h(
			"text",
			{ color: disabled ? "gray" : textColor, bold: disabled ? false : bold },
			`${prefix} ${label} ${suffix}`,
		),
	);
};
