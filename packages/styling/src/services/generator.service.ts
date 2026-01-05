import type { Config } from "tailwindcss";
import { loadConfig } from "../config";
import type { UserOptions } from "../types/options";
import { extractClasses } from "./class-extractor.service";
import { collectClassesFromContent } from "./content-scanner.service";
import { generateFontCss } from "./font.service";
import { getCacheKey, readDiskCache, writeDiskCache } from "./generator/cache";
import { minifyCss } from "./generator/css-utils";
import { generateIconCss, getUsedIconNames, resolveIcons } from "./generator/icons";
import { runTransformClasses, runTransformCss } from "./generator/plugin-pipeline";
import { compileRulesToCss } from "./generator/rules";
import { expandShortcuts } from "./generator/shortcuts";
import { buildTailwindCssWithCandidates } from "./generator/tailwind-builder";

let cachedCss = "";
let lastCacheKey = "";

export { extractClasses };

/**
 * Generates CSS from a set of utility classes using Tailwind CSS.
 * @param classes The set of class names to generate CSS for.
 * @returns A promise that resolves to the generated CSS string.
 */
export async function generateCss(classes: Set<string>, userOptions: UserOptions = {}): Promise<string> {
	const options = loadConfig(userOptions);
	const transformed = await runTransformClasses(options, classes);
	const expanded = expandShortcuts(transformed, options.shortcuts ?? {});
	const { remaining: ruleRemaining, css: rulesCss } = compileRulesToCss(expanded, options.rules);
	const finalClasses = ruleRemaining;

	const classString = [...finalClasses].join(" ");

	const usedIcons = getUsedIconNames(finalClasses);

	const diskKey = getCacheKey(options, `${classString}\n${rulesCss}`);
	const diskHit = await readDiskCache(options, diskKey);
	if (diskHit) {
		cachedCss = diskHit;
		lastCacheKey = diskKey;
		return cachedCss;
	}

	// Simple cache check
	if (diskKey === lastCacheKey) {
		return cachedCss;
	}

	const config: Config = {
		content: [{ raw: `<div class="${classString}"></div>`, extension: "html" }],
		darkMode: options.darkMode,
		theme: options.theme,
		plugins: [...(options.plugins ?? [])],
		// Tailwind v4 can be CSS-first; safelist ensures requested utilities are generated
		safelist: [...finalClasses].filter(c => !c.startsWith("icon-[")),
	} as any;

	const cssInput = "@import \"tailwindcss\";";

	const fontCss = generateFontCss(options);
	const finalCssInput = `${fontCss}\n${cssInput}`;

	const tailwindCss = await buildTailwindCssWithCandidates(
		finalCssInput,
		options,
		[...finalClasses].filter(c => !c.startsWith("icon-[")),
		config,
	);

	// Update cache
	lastCacheKey = diskKey;
	cachedCss = tailwindCss;

	if (rulesCss) {
		cachedCss = `${cachedCss}\n${rulesCss}`;
	}

	if (usedIcons.length > 0) {
		const iconSets = await resolveIcons(options);
		const iconCss = generateIconCss(usedIcons, iconSets);
		if (iconCss) {
			cachedCss = `${cachedCss}\n${iconCss}`;
		}
	}

	if (options.minify) {
		cachedCss = minifyCss(cachedCss);
	}

	cachedCss = await runTransformCss(options, cachedCss);

	await writeDiskCache(options, diskKey, cachedCss);
	return cachedCss;
}

export async function generateCssFromContent(userOptions: UserOptions = {}): Promise<string> {
	const options = loadConfig(userOptions);
	const classes = await collectClassesFromContent({
		patterns: options.content,
		cwd: options.root,
	});
	return await generateCss(classes, options);
}

export async function generateCssBundlesFromContent(
	bundles: Array<{ name: string; patterns: readonly string[] }>,
	userOptions: UserOptions = {},
): Promise<Record<string, string>> {
	const options = loadConfig(userOptions);
	const out: Record<string, string> = {};
	for (const bundle of bundles) {
		const classes = await collectClassesFromContent({
			patterns: bundle.patterns,
			cwd: options.root,
		});
		out[bundle.name] = await generateCss(classes, options);
	}
	return out;
}
