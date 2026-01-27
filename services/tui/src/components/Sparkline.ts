import type { SparklineProps } from "../types/schema";
import { h } from "../types/vnode";
import { SPARKLINE_CHARS } from "../constant/widget.const";

type SparklineComponentProps = SparklineProps;

export const Sparkline = (
	props: SparklineComponentProps,
): ReturnType<typeof h> => {
	const {
		data,
		color = "cyan",
		showLine = true,
		showDots = true,
		...rest
	} = props;

	if (data.length === 0) {
		return h("text", { color }, "No data");
	}

	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;
	const chars = Object.values(SPARKLINE_CHARS);

	const sparkline = data
		.map((value, index) => {
			const normalized = ((value - min) / range) * (chars.length - 1);
			const charIndex = Math.round(normalized);
			const char = chars[charIndex] || chars[0];
			const dot = showDots && index === data.length - 1 ? "●" : "";
			return char + dot;
		})
		.join("");

	const _line = showLine ? "─".repeat(data.length) : "";

	return h(
		"box",
		{ ...rest, flexDirection: "row" },
		h("text", { color }, sparkline),
	);
};
