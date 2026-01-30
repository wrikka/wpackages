import type { RuleHandler, StylingRule } from "../../types/options";
import { escapeCssClass, toCssDeclarationString } from "./css-utils";

export function compileRulesToCss(classes: ReadonlySet<string>, rules: readonly StylingRule[] | undefined): {
	readonly remaining: Set<string>;
	readonly css: string;
} {
	if (!rules || rules.length === 0) {
		return { remaining: new Set(classes), css: "" };
	}

	const remaining = new Set<string>();
	const cssParts: string[] = [];

	for (const cls of classes) {
		let handled = false;
		for (const [re, handler] of rules) {
			re.lastIndex = 0;
			const match = re.exec(cls);
			if (!match) continue;

			handled = true;
			const selector = `.${escapeCssClass(cls)}`;

			if (typeof handler === "string") {
				cssParts.push(`${selector}{${handler}}`);
			} else {
				const out = (handler as RuleHandler)(match);
				if (typeof out === "string") {
					cssParts.push(`${selector}{${out}}`);
				} else {
					cssParts.push(`${selector}{${toCssDeclarationString(out)}}`);
				}
			}

			break;
		}

		if (!handled) {
			remaining.add(cls);
		}
	}

	return { remaining, css: cssParts.join("\n") };
}
