import type { ProgressProps } from "../types/schema";
import { h } from "../types/vnode";
import { PROGRESS_CHARS } from "../constant/widget.const";

type ProgressComponentProps = ProgressProps;

export const Progress = (
	props: ProgressComponentProps,
): ReturnType<typeof h> => {
	const {
		value,
		max = 100,
		label,
		showPercentage = false,
		color = "green",
		backgroundColor: _backgroundColor = "gray",
		...rest
	} = props;

	const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
	const filledWidth = Math.floor((percentage / 100) * 20);
	const emptyWidth = 20 - filledWidth;
	const filledBar = PROGRESS_CHARS.filled.repeat(filledWidth);
	const emptyBar = PROGRESS_CHARS.empty.repeat(emptyWidth);
	const percentageText = showPercentage ? ` ${percentage.toFixed(0)}%` : "";
	const labelText = label ? `${label}: ` : "";

	return h(
		"box",
		{ ...rest, flexDirection: "row", alignItems: "center" },
		h(
			"text",
			{ color },
			`${labelText}[${filledBar}${emptyBar}]${percentageText}`,
		),
	);
};
