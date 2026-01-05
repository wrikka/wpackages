export function toCssDeclarationString(style: Record<string, string>): string {
	return Object.entries(style)
		.map(([prop, value]) => `${prop}:${value};`)
		.join("");
}

export function escapeCssClass(className: string): string {
	const escaped = className
		.replaceAll("\\", "\\\\")
		.replaceAll("[", "\\[")
		.replaceAll("]", "\\]")
		.replaceAll(":", "\\:")
		.replaceAll("/", "\\/")
		.replaceAll(".", "\\.")
		.replaceAll("!", "\\!")
		.replaceAll("%", "\\%")
		.replaceAll(",", "\\,")
		.replaceAll("(", "\\(")
		.replaceAll(")", "\\)")
		.replaceAll("#", "\\#")
		.replaceAll("@", "\\@");

	if (/^[0-9]/.test(escaped)) {
		return `\\3${escaped[0]} ${escaped.slice(1)}`;
	}

	return escaped;
}

export function encodeSvgDataUri(svg: string): string {
	return `data:image/svg+xml,${
		encodeURIComponent(svg)
			.replaceAll("'", "%27")
			.replaceAll("\"", "%22")
	}`;
}

export function minifyCss(css: string): string {
	return css
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\s+/g, " ")
		.replace(/\s*([{}:;,])\s*/g, "$1")
		.trim();
}
