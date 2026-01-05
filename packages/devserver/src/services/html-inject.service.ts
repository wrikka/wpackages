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
	if (!options.hmrClient) {
		return html;
	}

	const hmrScript = `
<script>
(function() {
	const socket = new WebSocket(\`ws://\${window.location.host}\`);
	
	socket.addEventListener('open', () => {
		console.log('[wdev:hmr] Connected to dev server');
		socket.send(JSON.stringify({ type: 'wdev:client-ready' }));
	});
	
	socket.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		
		switch (message.type) {
			case 'wdev:hmr-update':
				if (message.data.type === 'full-reload') {
					console.log('[wdev:hmr] Full reload triggered');
					window.location.reload();
				}
				break;
			case 'wdev:error':
				console.error('[wdev:hmr] Error:', message.data.message);
				break;
		}
	});
	
	socket.addEventListener('close', () => {
		console.log('[wdev:hmr] Disconnected from dev server');
	});
})();
</script>`;

	// Inject before closing </body> tag or at the end
	const bodyCloseIndex = html.lastIndexOf("</body>");
	if (bodyCloseIndex !== -1) {
		return html.slice(0, bodyCloseIndex) + hmrScript + "\n" + html.slice(bodyCloseIndex);
	}

	// If no </body> tag, inject at the end
	return html + "\n" + hmrScript;
}

export async function loadAndInjectHtml(
	filePath: string,
	options: HtmlInjectOptions = { hmrClient: true, errorOverlay: true },
): Promise<string> {
	const html = await readFile(filePath, "utf-8");
	return injectHtml(html, options);
}
