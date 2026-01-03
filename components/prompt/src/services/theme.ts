import pc from "picocolors";

export const theme = {
	message: (text: string) => pc.bold(text),
	placeholder: (text: string) => pc.gray(text),
	value: (text: string) => pc.cyan(text),
	cursor: (text: string) => pc.inverse(text),
	error: (text: string) => pc.red(text),
};
