export interface CssOptimizerOptions {
	readonly deduplicate?: boolean;
	readonly mergeMediaQueries?: boolean;
	readonly sortSelectors?: boolean;
	readonly removeUnused?: boolean;
}

export interface CssOptimizationResult {
	readonly css: string;
	readonly stats: {
		readonly originalSize: number;
		readonly optimizedSize: number;
		readonly reduction: number;
		readonly reductionPercent: number;
	};
}

export function optimizeCss(css: string, options: CssOptimizerOptions = {}): CssOptimizationResult {
	const originalSize = css.length;
	let optimizedCss = css;

	if (options.deduplicate !== false) {
		optimizedCss = deduplicateCssRules(optimizedCss);
	}

	if (options.mergeMediaQueries) {
		optimizedCss = mergeMediaQueries(optimizedCss);
	}

	if (options.sortSelectors) {
		optimizedCss = sortSelectors(optimizedCss);
	}

	const optimizedSize = optimizedCss.length;
	const reduction = originalSize - optimizedSize;
	const reductionPercent = originalSize > 0 ? (reduction / originalSize) * 100 : 0;

	return {
		css: optimizedCss,
		stats: {
			originalSize,
			optimizedSize,
			reduction,
			reductionPercent,
		},
	};
}

function deduplicateCssRules(css: string): string {
	const rules = new Map<string, string>();

	const ruleRegex = /([^{]+)\{([^}]+)\}/g;
	let match;

	while ((match = ruleRegex.exec(css)) !== null) {
		const selector = match[1].trim();
		const declarations = match[2].trim();

		if (rules.has(selector)) {
			const existingDeclarations = rules.get(selector)!;
			const mergedDeclarations = mergeDeclarations(existingDeclarations, declarations);
			rules.set(selector, mergedDeclarations);
		} else {
			rules.set(selector, declarations);
		}
	}

	return Array.from(rules.entries())
		.map(([selector, declarations]) => `${selector}{${declarations}}`)
		.join("\n");
}

function mergeDeclarations(existing: string, newDeclarations: string): string {
	const existingProps = parseDeclarations(existing);
	const newProps = parseDeclarations(newDeclarations);

	for (const [prop, value] of Object.entries(newProps)) {
		existingProps[prop] = value;
	}

	return Object.entries(existingProps)
		.map(([prop, value]) => `${prop}:${value}`)
		.join(";");
}

function parseDeclarations(declarations: string): Record<string, string> {
	const props: Record<string, string> = {};

	for (const decl of declarations.split(";")) {
		const [prop, ...valueParts] = decl.split(":");
		if (prop && valueParts.length > 0) {
			props[prop.trim()] = valueParts.join(":").trim();
		}
	}

	return props;
}

function mergeMediaQueries(css: string): string {
	const mediaQueries = new Map<string, string[]>();
	let result = css;

	const mediaRegex = /@media[^{]+\{([\s\S]*?)\}/g;
	let match;

	while ((match = mediaRegex.exec(css)) !== null) {
		const mediaQuery = match[0].match(/@media[^{]+\{/)?.[0] || "";
		const content = match[1];

		if (!mediaQueries.has(mediaQuery)) {
			mediaQueries.set(mediaQuery, []);
		}

		mediaQueries.get(mediaQuery)!.push(content);
		result = result.replace(match[0], "");
	}

	for (const [mediaQuery, contents] of mediaQueries) {
		const mergedContent = contents.join("\n");
		result += `${mediaQuery}${mergedContent}}`;
	}

	return result;
}

function sortSelectors(css: string): string {
	const rules: Array<{ selector: string; declarations: string }> = [];
	const ruleRegex = /([^{]+)\{([^}]+)\}/g;
	let match;

	while ((match = ruleRegex.exec(css)) !== null) {
		rules.push({
			selector: match[1].trim(),
			declarations: match[2].trim(),
		});
	}

	rules.sort((a, b) => a.selector.localeCompare(b.selector));

	return rules.map(({ selector, declarations }) => `${selector}{${declarations}}`).join("\n");
}
