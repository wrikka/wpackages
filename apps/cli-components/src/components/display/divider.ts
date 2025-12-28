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

export function Divider({
	type = displayConfig.divider.type,
	length = displayConfig.divider.length,
	color = displayConfig.divider.color as ColorName,
	character = displayConfig.divider.character,
}: {
	type?: "horizontal" | "vertical";
	length?: number;
	color?: ColorName;
	character?: string;
}) {
	const colorFn = getColorFn(color);
	if (type === "horizontal") {
		return colorFn(character.repeat(length));
	} else {
		return colorFn(character + "\n").repeat(length);
	}
}
