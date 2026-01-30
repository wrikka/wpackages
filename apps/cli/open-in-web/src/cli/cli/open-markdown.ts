import open from "open";
import path from "path";
import { isUrl, readFileContent, readFileFromUrl } from "../../services/file.service";
import { writeFileContent } from "../../services/file.service";
import { renderMarkdownToHtml } from "../../services/markdown.service";
import { generatePdf } from "../../services/pdf.service";
import { startServer } from "../../services/server.service";
import { renderTemplate } from "../../services/template.service";
import { validateMarkdownFile } from "../utils/validators";

interface OpenMarkdownOptions {
	autoOpen: boolean;
	port: number;
	css?: string;
	theme?: string;
	output?: string;
	toc?: boolean;
	mermaid?: boolean;
	math?: boolean;
	pdf?: string;
	plugins?: string;
}

export async function openMarkdown(filePath: string, options: OpenMarkdownOptions) {
	const validatedPath = validateMarkdownFile(filePath);

	try {
		let customCssContent = "";
		if (options.css) {
			try {
				customCssContent = await readFileContent(options.css);
			} catch {
				console.error(`\n⚠️  Could not read custom CSS file: ${options.css}. Proceeding without it.`);
			}
		}

		const isFromUrl = isUrl(validatedPath);
		let markdownContent = isFromUrl
			? await readFileFromUrl(validatedPath)
			: await readFileContent(validatedPath);
		if (options.toc) {
			markdownContent = `[[toc]]\n\n${markdownContent}`;
		}
		const renderedContent = await renderMarkdownToHtml(
			markdownContent,
			options.theme,
			options.toc,
			options.mermaid,
			options.math,
			options.plugins,
		);
		const isExport = !!options.output || !!options.pdf;

		const htmlContent = await renderTemplate({
			title: path.basename(validatedPath),
			content: renderedContent,
			head: customCssContent ? `<style>${customCssContent}</style>` : "",
			isExport: isExport,
			useMermaid: !!options.mermaid,
			useMath: !!options.math,
		});

		if (options.pdf) {
			await generatePdf(htmlContent, options.pdf);
			return;
		}

		if (options.output) {
			await writeFileContent(options.output, htmlContent);
			console.log(`\n✅ Successfully exported to ${options.output}`);
			return;
		}

		const server = startServer({
			disableLiveReload: isFromUrl,
			port: options.port,
			filepath: validatedPath,
			htmlContent: htmlContent,
		});

		const serverUrl = `http://localhost:${server.port}`;
		console.log(`\n🚀 Markdown server running at ${serverUrl}`);
		if (isFromUrl) {
			console.log(`🔗 Viewing from URL: ${validatedPath}\n`);
		} else {
			console.log(`📂 Watching file: ${path.basename(validatedPath)}\n`);
		}

		if (options.autoOpen) {
			await open(serverUrl);
		}

		return server;
	} catch (err: unknown) {
		console.error(`Error processing file: ${err instanceof Error ? err.message : "Unknown error"}`);
		process.exit(1);
	}
}
