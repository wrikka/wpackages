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

type StatusType =
	| "success"
	| "error"
	| "warning"
	| "info"
	| "loading"
	| "question"
	| "star";

const statusIcons = {
	success: "✓",
	error: "✗",
	warning: "⚠",
	info: "ℹ",
	loading: "↻",
	question: "?",
	star: "★",
};

const statusColors = {
	success: "green" as const,
	error: "red" as const,
	warning: "yellow" as const,
	info: "blue" as const,
	loading: "cyan" as const,
	question: "magenta" as const,
	star: "yellow" as const,
};

export function Status({
	type,
	message,
}: {
	type: StatusType;
	message: string;
}) {
	const icon = statusIcons[type];
	const color = statusColors[type];

	const colorFn = getColorFn(color);
	return `${colorFn(icon)} ${message}`;
}
