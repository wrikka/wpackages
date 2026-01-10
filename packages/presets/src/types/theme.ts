export type ThemeMode = "light" | "dark" | "auto";

export interface ColorPalette {
	primary: string;
	secondary: string;
	background: string;
	foreground: string;
	surface: string;
	border: string;
	error: string;
	warning: string;
	success: string;
	info: string;
}

export interface Typography {
	fontFamily: string;
	fontSize: {
		xs: string;
		sm: string;
		base: string;
		lg: string;
		xl: string;
	};
	fontWeight: {
		normal: number;
		medium: number;
		semibold: number;
		bold: number;
	};
	lineHeight: {
		tight: number;
		normal: number;
		relaxed: number;
	};
}

export interface Theme {
	mode: ThemeMode;
	colors: ColorPalette;
	typography: Typography;
	spacing: {
		xs: string;
		sm: string;
		md: string;
		lg: string;
		xl: string;
	};
	borderRadius: {
		sm: string;
		md: string;
		lg: string;
		full: string;
	};
}
