import { displayConfig } from "../../config/display.config";
import pc from "picocolors";

type ColorName =
	| "black"
	| "red"
	| "green"
	| "yellow"
	| "blue"
	| "magenta"
	| "cyan"
	| "white"
	| "gray";

const getColorFn = (color: ColorName) => {
	const colorMap = {
		black: pc.black,
		red: pc.red,
		green: pc.green,
		yellow: pc.yellow,
		blue: pc.blue,
		magenta: pc.magenta,
		cyan: pc.cyan,
		white: pc.white,
		gray: pc.gray,
	};
	return colorMap[color];
};

export function ProgressBar({
	value,
	max = 100,
	width = displayConfig.progress.width,
	color = displayConfig.progress.color,
	showPercentage = displayConfig.progress.showPercentage,
	labelPosition = displayConfig.progress.labelPosition,
	animated = displayConfig.progress.animated,
}: {
	value: number;
	max?: number;
	width?: number;
	color?: ColorName;
	showPercentage?: boolean;
	labelPosition?: "left" | "right" | "top" | "bottom";
	animated?: boolean;
}) {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));
	const filled = Math.floor((percentage / 100) * width);
	const empty = width - filled;

	const colorFn = getColorFn(color);
	const bar = animated
		? colorFn("█".repeat(filled) + (filled < width ? "▌" : ""))
			+ pc.dim("░".repeat(empty))
		: colorFn("█".repeat(filled)) + pc.dim("░".repeat(empty));

	const percentageText = showPercentage ? ` ${percentage.toFixed(1)}%` : "";

	switch (labelPosition) {
		case "left":
			return `${percentageText} ${bar}`;
		case "top":
			return `${percentageText}\n${bar}`;
		case "bottom":
			return `${bar}\n${percentageText}`;
		default:
			return `${bar}${percentageText}`;
	}
}
