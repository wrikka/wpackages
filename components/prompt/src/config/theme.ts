import { Theme } from "@/types/theme";
import pc from "picocolors";

export const defaultTheme: Theme = {
	message: pc.bold,
	placeholder: pc.gray,
	value: pc.cyan,
	cursor: pc.inverse,
	error: pc.red,
	info: pc.blue,
};
