export const COLORS = {
	black: "black",
	red: "red",
	green: "green",
	yellow: "yellow",
	blue: "blue",
	magenta: "magenta",
	cyan: "cyan",
	white: "white",
	gray: "gray",
} as const;

export type Color = keyof typeof COLORS;
