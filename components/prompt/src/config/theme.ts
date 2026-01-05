import pc from "picocolors";
import { Theme } from "../types/theme";

export const defaultTheme: Theme = {
	message: pc.bold,
	placeholder: pc.gray,
	value: pc.cyan,
	cursor: pc.inverse,
	error: pc.red,
	info: pc.blue,
};
