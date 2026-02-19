import puppeteer, { type Browser, type Page } from "puppeteer";

export type BrowserController = {
	browser: Browser;
	newPage: () => Promise<Page>;
	close: () => Promise<void>;
};

async function resolveCdpWsEndpoint(input: string): Promise<string> {
	if (input.startsWith("ws://") || input.startsWith("wss://")) return input;

	const url = new URL(input);
	const base = `${url.protocol}//${url.host}`;
	const versionUrl = url.pathname === "/" || url.pathname === "" ? `${base}/json/version` : input;
	const res = await fetch(versionUrl);
	if (!res.ok) throw new Error(`Failed to fetch CDP version endpoint: ${versionUrl} (${res.status})`);
	const json = (await res.json()) as { webSocketDebuggerUrl?: string };
	if (!json.webSocketDebuggerUrl) throw new Error(`CDP endpoint did not return webSocketDebuggerUrl: ${versionUrl}`);
	return json.webSocketDebuggerUrl;
}

export async function createBrowserController(params: {
	headless: boolean;
	cdpEndpoint?: string;
}): Promise<BrowserController> {
	const cdpEndpoint = params.cdpEndpoint;

	if (cdpEndpoint) {
		const ws = await resolveCdpWsEndpoint(cdpEndpoint);
		const browser = await puppeteer.connect({ browserWSEndpoint: ws });
		return {
			browser,
			newPage: async () => browser.newPage(),
			async close() {
				// do not close externally managed browser
			},
		};
	}

	const browser = await puppeteer.launch({ headless: params.headless });
	return {
		browser,
		newPage: async () => browser.newPage(),
		async close() {
			await browser.close();
		},
	};
}
