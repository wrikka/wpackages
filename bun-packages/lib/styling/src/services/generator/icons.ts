import type { ResolvedOptions } from "../../config";
import { encodeSvgDataUri, escapeCssClass } from "./css-utils";

export type UsedIconName = { className: string; prefix: string; name: string };

export function getUsedIconNames(classes: ReadonlySet<string>): UsedIconName[] {
	const out: UsedIconName[] = [];
	for (const cls of classes) {
		const m = /^icon-\[([a-z0-9-]+)--([a-z0-9-]+)\]$/i.exec(cls);
		const prefix = m?.[1];
		const name = m?.[2];
		if (prefix && name) {
			out.push({ className: cls, prefix, name });
		}
	}
	return out;
}

export function generateIconCss(used: UsedIconName[], iconSets: Record<string, any>): string {
	if (used.length === 0) return "";

	const rules: string[] = [];
	for (const icon of used) {
		const set = iconSets[icon.prefix];
		const data = set?.icons?.[icon.name];
		if (!data?.body) {
			continue;
		}

		const width = Number(data.width ?? set?.width ?? 16);
		const height = Number(data.height ?? set?.height ?? 16);
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${data.body}</svg>`;
		const uri = encodeSvgDataUri(svg);
		const selector = `.${escapeCssClass(icon.className)}`;
		rules.push(
			`${selector}{display:inline-block;width:1em;height:1em;background-color:currentColor;-webkit-mask:url('${uri}') no-repeat 50% 50%/contain;mask:url('${uri}') no-repeat 50% 50%/contain;}`,
		);
	}
	return rules.join("\n");
}

export async function resolveIcons(options: ResolvedOptions) {
	const icons: Record<string, any> = {};
	if (!options.icons) {
		return {};
	}

	for (const prefix of options.icons) {
		try {
			const json = await import(`@iconify-json/${prefix}/icons.json`, {
				assert: { type: "json" },
			});
			icons[prefix] = (json as any).default;
		} catch {
			console.warn(`[styling] Failed to load icon set "${prefix}"`);
		}
	}
	return icons;
}
