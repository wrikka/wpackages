/**
 * CSS-in-JS extraction macro for build-time CSS generation.
 * Extracts CSS strings and returns a class name or style object.
 *
 * @param styles - CSS template literal or string
 * @param options - Extraction options
 * @returns Class name or style object
 *
 * @example
 * // const styles = extractCSS`
 * //   .container { color: ${env("THEME_COLOR")}; }
 * // `
 */
export const extractCSS = Bun.macro((
	styles: string | TemplateStringsArray,
	...values: unknown[]
) => {
	let css = "";

	if (typeof styles === "string") {
		css = styles;
	} else {
		css = styles.reduce((acc, part, i) => {
			const value = values[i] !== undefined ? String(values[i]) : "";
			return acc + part + value;
		}, "");
	}

	const className = generateClassName(css);

	return JSON.stringify({
		className,
		css,
		style: cssToStyle(css),
	});
});

/**
 * Extract CSS and return only class name.
 *
 * @param styles - CSS template literal or string
 * @param values - Interpolated values
 * @returns Class name
 *
 * @example
 * // const className = extractCSSClass`
 * //   .container { color: red; }
 * // `
 */
export const extractCSSClass = Bun.macro((
	styles: TemplateStringsArray,
	...values: unknown[]
) => {
	let css = styles.reduce((acc, part, i) => {
		const value = values[i] !== undefined ? String(values[i]) : "";
		return acc + part + value;
	}, "");

	const className = generateClassName(css);

	return JSON.stringify(className);
});

/**
 * Extract CSS and return style object.
 *
 * @param styles - CSS template literal or string
 * @param values - Interpolated values
 * @returns Style object
 *
 * @example
 * // const style = extractCSSStyle`
 * //   color: red;
 * //   padding: 10px;
 * // `
 */
export const extractCSSStyle = Bun.macro((
	styles: TemplateStringsArray,
	...values: unknown[]
) => {
	let css = styles.reduce((acc, part, i) => {
		const value = values[i] !== undefined ? String(values[i]) : "";
		return acc + part + value;
	}, "");

	const style = cssToStyle(css);

	return JSON.stringify(style);
});

/**
 * Generate a unique class name from CSS content.
 */
function generateClassName(css: string): string {
	const hash = simpleHash(css);
	return `css-${hash}`;
}

/**
 * Simple hash function for class names.
 */
function simpleHash(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36);
}

/**
 * Convert CSS string to style object.
 */
function cssToStyle(css: string): Record<string, string> {
	const style: Record<string, string> = {};
	const rules = css.split(";");

	for (const rule of rules) {
		const [property, value] = rule.split(":").map((s) => s.trim());
		if (property && value) {
			const camelCaseProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
			style[camelCaseProperty] = value;
		}
	}

	return style;
}
