import Shiki from "@shikijs/markdown-it";
import { fromHighlighter } from "@shikijs/markdown-it/core";
import vitesseDark from "@shikijs/themes/vitesse-dark";
import vitesseLight from "@shikijs/themes/vitesse-light";
import MarkdownIt from "markdown-it";
import open from "open";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import type { Highlighter } from "shiki";
import { createHtmlContent } from "../utils/html-generators";
import type { OpenMarkdownOptions } from "../utils/types/open-markdown";
import { validateMarkdownFile } from "../utils/validators";

const highlighter = await createHighlighterCore({
	themes: [
		vitesseLight,
		vitesseDark,
	],
	langs: [
		() => import("@shikijs/langs/javascript"),
		() => import("@shikijs/langs/typescript"),
	],
	engine: createOnigurumaEngine(import("shiki/wasm")),
});

const md = MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
});
md.use(fromHighlighter(highlighter as Highlighter, {
	themes: {
		light: "vitesse-light",
		dark: "vitesse-dark",
	},
}));

md.use(
	await Shiki({
		themes: {
			light: "vitesse-light",
			dark: "vitesse-dark",
		},
	}),
);

export async function openMarkdown(filePath: string, options: OpenMarkdownOptions) {
	const validatedPath = validateMarkdownFile(filePath);

	try {
		const markdownContent = await Bun.file(validatedPath).text();
		const renderedContent = md.render(markdownContent);
		const htmlContent = createHtmlContent(renderedContent);

		const server = Bun.serve({
			port: 3000,
			hostname: "localhost",
			fetch() {
				return new Response(htmlContent, {
					headers: { "Content-Type": "text/html" },
				});
			},
		});

		console.log(`\n🚀 Markdown server running at http://${server.hostname}:${server.port}`);
		console.log(`📂 File: ${validatedPath.split(/[\\/]/).pop()}\n`);

		if (options.autoOpen) {
			await open(`http://${server.hostname}:${server.port}`);
		}
		return server;
	} catch (err: unknown) {
		console.error(`Error opening file: ${err instanceof Error ? err.message : "Unknown error"}`);
		process.exit(1);
	}
}
