export interface CriticalCssOptions {
	readonly viewportHeight?: number;
	readonly includeFonts?: boolean;
	readonly includeKeyframes?: boolean;
	readonly minify?: boolean;
}

export interface CriticalCssResult {
	readonly critical: string;
	readonly nonCritical: string;
	readonly stats: {
		readonly criticalSize: number;
		readonly nonCriticalSize: number;
		readonly reduction: number;
	};
}

export function extractCriticalCss(
	html: string,
	fullCss: string,
	options: CriticalCssOptions = {},
): CriticalCssResult {
	const { includeFonts = true, includeKeyframes = true, minify = false } = options;

	const usedClasses = extractUsedClassesFromHtml(html);
	const criticalRules = extractCriticalRules(fullCss, usedClasses, {
		includeFonts,
		includeKeyframes,
	});

	const nonCriticalRules = extractNonCriticalRules(fullCss, criticalRules);

	let criticalCss = criticalRules.join("\n");
	let nonCriticalCss = nonCriticalRules.join("\n");

	if (minify) {
		criticalCss = minifyCssString(criticalCss);
		nonCriticalCss = minifyCssString(nonCriticalCss);
	}

	const criticalSize = criticalCss.length;
	const nonCriticalSize = nonCriticalCss.length;
	const reduction = ((criticalSize / (criticalSize + nonCriticalSize)) * 100).toFixed(2);

	return {
		critical: criticalCss,
		nonCritical: nonCriticalCss,
		stats: {
			criticalSize,
			nonCriticalSize,
			reduction: Number.parseFloat(reduction),
		},
	};
}

function extractUsedClassesFromHtml(html: string): Set<string> {
	const classes = new Set<string>();
	const classRegex = /class=["']([^"']+)["']/g;
	let match;

	while ((match = classRegex.exec(html)) !== null) {
		const classList = match[1].split(/\s+/);
		for (const cls of classList) {
			if (cls) {
				classes.add(cls);
			}
		}
	}

	return classes;
}

function extractCriticalRules(
	css: string,
	usedClasses: Set<string>,
	options: { includeFonts: boolean; includeKeyframes: boolean },
): string[] {
	const criticalRules: string[] = [];
	const rules = css.match(/[^{}]+\{[^{}]*\}/g) || [];

	for (const rule of rules) {
		const selector = rule.match(/([^{}]+)\{/)?.[1]?.trim() || "";

		if (isCriticalSelector(selector, usedClasses, options)) {
			criticalRules.push(rule);
		}
	}

	return criticalRules;
}

function isCriticalSelector(
	selector: string,
	usedClasses: Set<string>,
	options: { includeFonts: boolean; includeKeyframes: boolean },
): boolean {
	if (selector.startsWith("@font-face") && options.includeFonts) {
		return true;
	}

	if (selector.startsWith("@keyframes") && options.includeKeyframes) {
		return true;
	}

	if (selector.startsWith("@") || selector.startsWith(":root")) {
		return true;
	}

	const selectorClasses = selector.split(/[\s,>+~]/).filter(Boolean);

	for (const selClass of selectorClasses) {
		const className = selClass.replace(/[.#]/, "");
		if (usedClasses.has(className)) {
			return true;
		}
	}

	return false;
}

function extractNonCriticalRules(fullCss: string, criticalRules: string[]): string[] {
	const criticalSet = new Set(criticalRules);
	const allRules = fullCss.match(/[^{}]+\{[^{}]*\}/g) || [];

	return allRules.filter(rule => !criticalSet.has(rule));
}

function minifyCssString(css: string): string {
	return css
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\s+/g, " ")
		.replace(/\s*([{}:;,])\s*/g, "$1")
		.trim();
}

export function generateCriticalCssInline(
	criticalCss: string,
	nonCriticalCss: string,
	nonCriticalPath: string,
): string {
	return `
<!-- Critical CSS -->
<style>
${criticalCss}
</style>

<!-- Non-critical CSS -->
<link rel="preload" href="${nonCriticalPath}" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="${nonCriticalPath}"></noscript>
`.trim();
}
