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

export function Spinner({
	size = displayConfig.spinner.size,
	color = displayConfig.spinner.color,
	speed = displayConfig.spinner.speed,
}: {
	size?: "sm" | "md" | "lg" | number;
	color?: ColorName;
	speed?: "slow" | "normal" | "fast";
}) {
	const sizeMap = {
		sm: 1,
		md: 2,
		lg: 3,
	};

	const speedMap = {
		slow: 200,
		normal: 100,
		fast: 50,
	};

	const actualSize = typeof size === "string" ? sizeMap[size] : size;
	const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;
	const interval = speedMap[speed];
	const frame = frames[Math.floor(Date.now() / interval) % frames.length] ?? frames[0];

	const colorFn = getColorFn(color);
	return colorFn(frame.repeat(actualSize));
}
