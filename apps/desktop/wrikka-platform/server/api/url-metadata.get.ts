import { createError, defineEventHandler, getQuery, type H3Event } from "h3";

type UrlMetadata = {
	url: string;
	title: string;
	faviconUrl?: string;
};

function readQueryUrl(event: H3Event) {
	const q = getQuery(event);
	const url = typeof q.url === "string" ? q.url : "";
	return url;
}

function extractTitle(html: string): string | null {
	const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
	const raw = m?.[1]?.trim();
	return raw ? raw : null;
}

function extractFaviconHref(html: string): string | null {
	const linkRe = /<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]*>/gi;
	const hrefRe = /href=["']([^"']+)["']/i;

	const links = html.match(linkRe) || [];
	for (const l of links) {
		const hm = l.match(hrefRe);
		const href = hm?.[1]?.trim();
		if (href) return href;
	}

	return null;
}

function safeResolveUrl(base: string, maybeRelative: string): string {
	try {
		return new URL(maybeRelative, base).toString();
	} catch {
		return maybeRelative;
	}
}

export default defineEventHandler(async (event: H3Event) => {
	const input = readQueryUrl(event);
	if (!input) {
		throw createError({ statusCode: 400, statusMessage: "Missing url" });
	}

	let target: URL;
	try {
		target = new URL(input);
	} catch {
		throw createError({ statusCode: 400, statusMessage: "Invalid url" });
	}

	const base = target.origin;

	const html = await fetch(target.toString(), {
		method: "GET",
		headers: {
			"user-agent": "wterminal-desktop/1.0",
			accept: "text/html,application/xhtml+xml",
		},
	})
		.then(async (r) => (r.ok ? r.text() : ""))
		.catch(() => "");

	const title = extractTitle(html) || target.hostname;
	const faviconHref = extractFaviconHref(html);

	const meta: UrlMetadata = {
		url: target.toString(),
		title,
		faviconUrl: faviconHref
			? safeResolveUrl(base, faviconHref)
			: safeResolveUrl(base, "/favicon.ico"),
	};

	return meta;
});
