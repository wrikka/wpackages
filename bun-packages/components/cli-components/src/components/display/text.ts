import pc from "picocolors";
import { displayConfig } from "../../config/display.config";

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

export function Text({
	children,
	color = displayConfig.text.color,
	bold = displayConfig.text.bold,
	italic = displayConfig.text.italic,
	underline = displayConfig.text.underline,
	align = displayConfig.text.align,
	wrap = displayConfig.text.wrap,
}: {
	children: string;
	color?: ColorName;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	align?: "left" | "center" | "right";
	wrap?: boolean;
}) {
	const colorFn = getColorFn(color);
	let text = colorFn(children);

	if (bold) text = pc.bold(text);
	if (italic) text = pc.italic(text);
	if (underline) text = pc.underline(text);

	// Handle alignment
	if (align === "center") {
		const lines = text.split("\n");
		text = lines
			.map((line: string) => {
				const padding = Math.max(0, process.stdout.columns - line.length);
				return " ".repeat(Math.floor(padding / 2)) + line;
			})
			.join("\n");
	} else if (align === "right") {
		const lines = text.split("\n");
		text = lines
			.map((line: string) => {
				const padding = Math.max(0, process.stdout.columns - line.length);
				return " ".repeat(padding) + line;
			})
			.join("\n");
	}

	// Handle wrapping
	if (wrap) {
		const lines = text.split("\n");
		text = lines
			.map((line: string) => {
				if (line.length <= process.stdout.columns) return line;
				return (
					line
						.match(new RegExp(`.{1,${process.stdout.columns}}`, "g"))
						?.join("\n") || line
				);
			})
			.join("\n");
	}

	return text;
}
