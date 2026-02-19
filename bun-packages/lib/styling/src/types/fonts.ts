export type GoogleFont = {
	source: "google";
	name: string;
	weights?: (string | number)[];
	styles?: ("normal" | "italic")[];
};

export type CdnFont = {
	source: "cdn";
	url: string; // URL to the CSS file for the font
};

export type CustomFont = {
	source: "custom";
	url: string;
};

export interface LocalFontSrc {
	path: string; // Path to the font file
	weight?: string | number;
	style?: "normal" | "italic";
}

export type LocalFont = {
	source: "local";
	name: string;
	src: LocalFontSrc | LocalFontSrc[];
};

export type FontOptions = GoogleFont | CdnFont | LocalFont | CustomFont;
