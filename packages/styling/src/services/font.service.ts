import type { ResolvedOptions } from "../config";
import type { FontOptions, GoogleFont, LocalFont } from "../types/fonts";

function buildGoogleFontUrl(font: GoogleFont): string {
	let url = `https://fonts.googleapis.com/css2?family=${font.name.replace(/ /g, "+")}`;

	if (font.weights?.length) {
		const weights = font.weights.join(";");
		url += `:wght@${weights}`;
	}

	url += "&display=swap";
	return url;
}

export function generateFontCss(options: ResolvedOptions): string {
	if (!options.fonts || options.fonts.length === 0) {
		return "";
	}

	const fontImports = options.fonts.map((font: FontOptions) => {
		switch (font.source) {
			case "google":
				return `@import url('${buildGoogleFontUrl(font)}');`;
			case "local":
				return generateLocalFontCss(font);
			case "custom":
			case "cdn":
				return `@import url('${font.url}');`;
			default:
				return "";
		}
	});

	return fontImports.filter(Boolean).join("\n");
}

function generateLocalFontCss(font: LocalFont): string {
	const sources = Array.isArray(font.src) ? font.src : [font.src];

	return sources.map(src => {
		const format = src.path.split(".").pop();
		return `
@font-face {
  font-family: '${font.name}';
  src: url('${src.path}') format('${format}');
  font-weight: ${src.weight || "normal"};
  font-style: ${src.style || "normal"};
  font-display: swap;
}
    `.trim();
	}).join("\n");
}
