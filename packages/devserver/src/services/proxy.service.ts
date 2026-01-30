import { eventHandler } from "h3";
import type { ProxyConfig } from "../types/config";

export function createProxyMiddleware(config: ProxyConfig) {
	return eventHandler(async (event) => {
		const url = new URL(event.request.url);
		const shouldProxy = config.context.some((context) => url.pathname.startsWith(context));

		if (!shouldProxy) {
			return;
		}

		try {
			let proxyPath = url.pathname;
			if (config.pathRewrite) {
				for (const [pattern, replacement] of Object.entries(config.pathRewrite)) {
					proxyPath = proxyPath.replace(new RegExp(pattern), replacement);
				}
			}

			const targetUrl = new URL(proxyPath, config.target);

			const proxyHeaders = new Headers(event.node.req.headers);
			if (config.changeOrigin) {
				proxyHeaders.set("host", targetUrl.host);
			}

			const proxyReq = new Request(targetUrl, {
				method: event.node.req.method || "GET",
				headers: proxyHeaders,
				body: event.node.req.body,
			});

			const proxyRes = await fetch(proxyReq, {
				// @ts-expect-error - Node.js fetch options
				duplex: "half",
			});

			const proxyBody = await proxyRes.arrayBuffer();

			const headers = new Headers();
			proxyRes.headers.forEach((value, key) => {
				if (key.toLowerCase() !== "transfer-encoding") {
					headers.set(key, value);
				}
			});

			return new Response(proxyBody, {
				status: proxyRes.status,
				statusText: proxyRes.statusText,
				headers,
			});
		} catch (error) {
			console.error(`Proxy error for ${url.pathname}:`, error);
			return new Response(`Proxy error: ${error instanceof Error ? error.message : "Unknown error"}`, {
				status: 502,
			});
		}
	});
}

export function createProxyMiddlewareList(configs: readonly ProxyConfig[]) {
	return configs.map((config) => createProxyMiddleware(config));
}
