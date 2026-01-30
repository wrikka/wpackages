/**
 * HTML injection service for @wpackages/devserver
 * Injects HMR client and other runtime scripts into HTML
 */

import { readFile } from "node:fs/promises";

export interface HtmlInjectOptions {
	readonly hmrClient: boolean;
	readonly errorOverlay: boolean;
}

export async function injectHtml(
	html: string,
	options: HtmlInjectOptions = { hmrClient: true, errorOverlay: true },
): Promise<string> {
	let scripts = "";

	if (options.hmrClient) {
		scripts += `
<script type="module" src="/@wdev/hmr-client.js"></script>`;
	}

	if (options.errorOverlay) {
		scripts += `
<script type="module" src="/@wdev/error-overlay.js"></script>`;
	}

	if (!scripts) {
		return html;
	}

	// Inject before closing </body> tag or at the end
	const bodyCloseIndex = html.lastIndexOf("</body>");
	if (bodyCloseIndex !== -1) {
		return html.slice(0, bodyCloseIndex) + scripts + "\n" + html.slice(bodyCloseIndex);
	}

	// If no </body> tag, inject at the end
	return html + "\n" + scripts;
}

export async function loadAndInjectHtml(
	filePath: string,
	options: HtmlInjectOptions = { hmrClient: true, errorOverlay: true },
): Promise<string> {
	const html = await readFile(filePath, "utf-8");
	return injectHtml(html, options);
}
