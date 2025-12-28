import { displayConfig } from "../../config/display.config";

export const Box = ({
	title,
	border = displayConfig.box.border,
	padding = displayConfig.box.padding,
	children = "",
	width = displayConfig.box.width,
}: {
	title?: string;
	border?: boolean | "single" | "double" | "round";
	padding?:
		| number
		| { top: number; right: number; bottom: number; left: number };
	children?: string;
	width?: number;
}): string => {
	// padding parameter is kept for API compatibility but not used in simple rendering
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	void padding;
	const content = children;
	const boxContent = title ? `${title}\n\n${content}` : content;

	let borderStyle: "single" | "double" | "round" | "none" = "none";
	if (typeof border === "string") {
		if (border === "single" || border === "double" || border === "round") {
			borderStyle = border;
		} else {
			borderStyle = "single";
		}
	} else if (border === true) {
		borderStyle = "single";
	}

	// Simple box rendering without external dependency
	if (borderStyle === "none") {
		return boxContent;
	}

	const borderChars = {
		single: { top: "─", bottom: "─", left: "│", right: "│", topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘" },
		double: { top: "═", bottom: "═", left: "║", right: "║", topLeft: "╔", topRight: "╗", bottomLeft: "╚", bottomRight: "╝" },
		round: { top: "─", bottom: "─", left: "│", right: "│", topLeft: "╭", topRight: "╮", bottomLeft: "╰", bottomRight: "╯" },
	};

	const chars = borderChars[borderStyle];
	const lines = boxContent.split("\n");
	const maxWidth = Math.max(...lines.map(l => l.length), width || 0);
	
	const result = [
		chars.topLeft + chars.top.repeat(maxWidth + 2) + chars.topRight,
		...lines.map(l => chars.left + " " + l.padEnd(maxWidth) + " " + chars.right),
		chars.bottomLeft + chars.bottom.repeat(maxWidth + 2) + chars.bottomRight,
	];

	return result.join("\n");
};

Box.displayName = "Box";
