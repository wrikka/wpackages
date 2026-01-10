import { COLORS } from "../constant";
import type { Theme } from "../types";

const lightPalette = {
	primary: COLORS.BLUE,
	secondary: COLORS.PURPLE,
	background: COLORS.WHITE,
	foreground: COLORS.BLACK,
	surface: COLORS.GRAY_100,
	border: COLORS.GRAY_200,
	error: COLORS.RED,
	warning: COLORS.YELLOW,
	success: COLORS.GREEN,
	info: COLORS.BLUE,
};

const darkPalette = {
	primary: COLORS.BLUE_400,
	secondary: COLORS.PURPLE_400,
	background: COLORS.BLACK,
	foreground: COLORS.WHITE,
	surface: COLORS.GRAY_900,
	border: COLORS.GRAY_800,
	error: COLORS.RED_400,
	warning: COLORS.YELLOW_400,
	success: COLORS.GREEN_400,
	info: COLORS.BLUE_400,
};

export const AppTheme: Theme = Object.freeze({
	mode: "auto",
	colors: lightPalette,
	typography: {
		fontFamily: "Inter, system-ui, sans-serif",
		fontSize: {
			xs: "0.75rem",
			sm: "0.875rem",
			base: "1rem",
			lg: "1.125rem",
			xl: "1.25rem",
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75,
		},
	},
	spacing: {
		xs: "0.25rem",
		sm: "0.5rem",
		md: "1rem",
		lg: "1.5rem",
		xl: "2rem",
	},
	borderRadius: {
		sm: "0.25rem",
		md: "0.375rem",
		lg: "0.5rem",
		full: "9999px",
	},
});

export const DarkTheme: Theme = Object.freeze({
	...AppTheme,
	mode: "dark",
	colors: darkPalette,
});
