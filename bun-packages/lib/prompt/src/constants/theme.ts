import picocolors from "picocolors";

export const defaultTheme = {
	colors: {
		primary: picocolors.cyan,
		secondary: picocolors.gray,
		error: picocolors.red,
		placeholder: picocolors.gray,
		message: picocolors.white,
		value: picocolors.white,
		info: picocolors.blue,
		success: picocolors.green,
		warning: picocolors.yellow,
		complete: picocolors.green,
		incomplete: picocolors.gray,
		inactive: picocolors.gray,
		percentage: picocolors.cyan,
		eta: picocolors.dim,
		dim: picocolors.dim,
	},
	symbols: {
		bar: "│",
		radioOn: "●",
		radioOff: "○",
		check: "✔",
		cross: "✖",
		pointer: "›",
		info: "ℹ",
		warning: "⚠",
	},
};

export type PromptTheme = typeof defaultTheme;
