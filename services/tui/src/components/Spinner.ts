import type { SpinnerProps } from "../types/schema";
import { h } from "../types/vnode";
import { SPINNER_PATTERNS } from "../constant/widget.const";

type SpinnerComponentProps = SpinnerProps;

let spinnerIndex = 0;

export const Spinner = (props: SpinnerComponentProps): ReturnType<typeof h> => {
	const { type = "dots", color = "cyan", label, ...rest } = props;

	const pattern = SPINNER_PATTERNS[type] || SPINNER_PATTERNS.dots;
	const char = pattern[spinnerIndex % pattern.length];
	spinnerIndex++;

	const labelText = label ? `${label} ` : "";

	return h(
		"box",
		{ ...rest, flexDirection: "row", alignItems: "center" },
		h("text", { color }, `${labelText}${char}`),
	);
};
