import shiki from "@shikijs/markdown-it";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import mathjax from "markdown-it-mathjax3";
import mermaid from "markdown-it-mermaid";
import toc from "markdown-it-toc-done-right";

const parsers = new Map<string, MarkdownIt>();

async function getMarkdownParser(
	theme?: string,
	useToc?: boolean,
	useMermaid?: boolean,
	useMath?: boolean,
	plugins?: string,
): Promise<MarkdownIt> {
	const pluginNames = plugins ? plugins.split(",").sort().join(",") : "";
	const key = `${theme || "default"}-${useToc ? "with-toc" : "no-toc"}-${useMermaid ? "with-mermaid" : "no-mermaid"}-${
		useMath ? "with-math" : "no-math"
	}-${pluginNames}`;
	if (parsers.has(key)) {
		return parsers.get(key)!;
	}

	const md = new MarkdownIt({ html: true });

	const themes = theme
		? { light: theme, dark: theme }
		: { light: "vitesse-light", dark: "vitesse-dark" };

	md.use(await shiki({ themes }));

	if (useToc) {
		md.use(anchor, { permalink: anchor.permalink.ariaHidden({ placement: "before" }) });
		md.use(toc, { placeholder: "[[toc]]" });
	}

	if (useMermaid) {
		md.use(mermaid);
	}

	if (useMath) {
		md.use(mathjax);
	}

	if (pluginNames) {
		for (const pluginName of pluginNames.split(",")) {
			try {
				const plugin = await import(pluginName);
				md.use(plugin.default || plugin);
				console.log(`\n🔌 Successfully loaded plugin: ${pluginName}`);
			} catch {
				console.error(`\n⚠️  Could not load plugin: ${pluginName}. Please ensure it is installed.`);
			}
		}
	}

	parsers.set(key, md);
	return md;
}

export async function renderMarkdownToHtml(
	markdownContent: string,
	theme?: string,
	useToc?: boolean,
	useMermaid?: boolean,
	useMath?: boolean,
	plugins?: string,
): Promise<string> {
	const parser = await getMarkdownParser(theme, useToc, useMermaid, useMath, plugins);
	return parser.render(markdownContent);
}
