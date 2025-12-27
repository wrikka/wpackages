import type { PluginOption } from "vite";
import { defaultMarkdownConfig } from "../config";
import type { WdevOptions } from "../types";
import { deepMerge } from "../utils";

export function createMarkdownPlugin<T extends object>(
	options: WdevOptions<T>,
): PluginOption | null {
	if (!options.markdown) {
		return null;
	}

	const markdownOptions =
		typeof options.markdown === "object"
			? deepMerge(defaultMarkdownConfig, options.markdown)
			: defaultMarkdownConfig;

	return {
		name: "vite-plugin-wvite-markdown",
		async transform(code, id) {
			if (id.endsWith(".md")) {
				const { getHighlighter } = await import("shiki");
				const { fromHighlighter } = await import("@shikijs/markdown-it/core");
				const MarkdownIt = (await import("markdown-it")).default;
				const md = MarkdownIt();
				md.use(
					fromHighlighter(await getHighlighter(markdownOptions), {
						theme:
							Array.isArray(markdownOptions.themes) &&
							typeof markdownOptions.themes[0] === "string"
								? markdownOptions.themes[0]
								: "vitesse-light",
					}),
				);
				const html = md.render(code);
				return `export default ${JSON.stringify(html)}`;
			}
			return null;
		},
	};
}
