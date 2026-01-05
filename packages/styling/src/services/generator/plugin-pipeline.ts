import type { ResolvedOptions } from "../../config";

export async function runTransformClasses(options: ResolvedOptions, input: Set<string>): Promise<Set<string>> {
	let out = input;
	for (const p of options.stylingPlugins ?? []) {
		if (p.transformClasses) {
			out = await p.transformClasses(out, options);
		}
	}
	return out;
}

export async function runTransformCss(options: ResolvedOptions, css: string): Promise<string> {
	let out = css;
	for (const p of options.stylingPlugins ?? []) {
		if (p.transformCss) {
			out = await p.transformCss(out, options);
		}
	}
	return out;
}
