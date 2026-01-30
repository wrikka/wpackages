const ATTRIBUTE_REGEX = /([a-z0-9-]+)=(["'])((?:\\.|(?!\2)[^\\])*?)\2/gi;
const ATTRIBUTE_VALUE_REGEX = /([a-z0-9-]+)=\{([^}]*)\}/gi;
const ATTRIBUTE_SHORTHAND_REGEX = /([a-z0-9-]+)(?:=(["'])((?:\\.|(?!\2)[^\\])*?)\2)?\s*/gi;

export function extractAttributes(code: string): Set<string> {
	const classes = new Set<string>();

	for (const match of code.matchAll(ATTRIBUTE_REGEX)) {
		const attrName = match[1];
		const attrValue = match[3];

		if (isStyleAttribute(attrName)) {
			const parts = attrValue.split(/\s+/).filter(Boolean);
			for (const part of parts) {
				classes.add(part);
			}
		}
	}

	for (const match of code.matchAll(ATTRIBUTE_VALUE_REGEX)) {
		const attrName = match[1];
		const attrValue = match[2];

		if (isStyleAttribute(attrName)) {
			const parts = attrValue.split(/\s+/).filter(Boolean);
			for (const part of parts) {
				classes.add(part);
			}
		}
	}

	for (const match of code.matchAll(ATTRIBUTE_SHORTHAND_REGEX)) {
		const attrName = match[1];
		const attrValue = match[3];

		if (!attrValue && isStyleAttribute(attrName)) {
			classes.add(attrName);
		}
	}

	return classes;
}

function isStyleAttribute(attrName: string): boolean {
	const styleAttributes = [
		"flex",
		"grid",
		"block",
		"inline",
		"inline-block",
		"hidden",
		"p",
		"px",
		"py",
		"pt",
		"pr",
		"pb",
		"pl",
		"m",
		"mx",
		"my",
		"mt",
		"mr",
		"mb",
		"ml",
		"w",
		"h",
		"min-w",
		"min-h",
		"max-w",
		"max-h",
		"text",
		"font",
		"bg",
		"border",
		"rounded",
		"shadow",
		"opacity",
		"transition",
		"transform",
		"cursor",
		"pointer",
		"select",
		"resize",
		"overflow",
		"z",
		"gap",
		"space",
		"divide",
		"place",
		"items",
		"justify",
		"content",
		"self",
		"align",
		"order",
		"flex",
		"grid",
		"col",
		"row",
		"box",
		"list",
		"object",
		"fill",
		"stroke",
		"sr",
		"not-sr",
		"focus",
		"focus-within",
		"focus-visible",
		"active",
		"visited",
		"target",
		"first",
		"last",
		"odd",
		"even",
		"group",
		"peer",
		"hover",
		"disabled",
		"checked",
		"indeterminate",
		"default",
		"required",
		"valid",
		"invalid",
		"in-range",
		"out-of-range",
		"read-only",
		"placeholder-shown",
		"autofill",
		"marker",
		"selection",
		"file",
		"backdrop",
		"before",
		"after",
		"first-letter",
		"first-line",
		"marker",
	];

	if (attrName.startsWith("[")) {
		return true;
	}

	if (styleAttributes.includes(attrName)) {
		return true;
	}

	return false;
}
