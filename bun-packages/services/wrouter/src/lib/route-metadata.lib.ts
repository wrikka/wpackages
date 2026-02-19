import type { WRouteRecord } from "../types";

export interface RouteMetadata {
	readonly title?: string;
	readonly description?: string;
	readonly keywords?: readonly string[];
	readonly og?: OpenGraphMetadata;
	readonly twitter?: TwitterMetadata;
	readonly canonical?: string;
	readonly robots?: RobotsMetadata;
	readonly custom?: Readonly<Record<string, string>>;
}

export interface OpenGraphMetadata {
	readonly type?: "website" | "article" | "video" | "image";
	readonly title?: string;
	readonly description?: string;
	readonly image?: string;
	readonly url?: string;
	readonly siteName?: string;
}

export interface TwitterMetadata {
	readonly card?: "summary" | "summary_large_image" | "app" | "player";
	readonly site?: string;
	readonly creator?: string;
	readonly title?: string;
	readonly description?: string;
	readonly image?: string;
}

export interface RobotsMetadata {
	readonly index?: boolean;
	readonly follow?: boolean;
	readonly noarchive?: boolean;
	readonly nosnippet?: boolean;
	readonly noimageindex?: boolean;
	readonly notranslate?: boolean;
}

export interface RouteWithMetadata extends WRouteRecord {
	readonly metadata?: RouteMetadata;
}

export class RouteMetadataManager {
	private readonly metadataMap = new Map<string, RouteMetadata>();
	private readonly defaultMetadata: RouteMetadata;

	constructor(defaultMetadata: RouteMetadata = {}) {
		this.defaultMetadata = Object.freeze(defaultMetadata);
	}

	setMetadata(path: string, metadata: RouteMetadata): void {
		this.metadataMap.set(path, Object.freeze(metadata));
	}

	getMetadata(path: string): RouteMetadata {
		const routeMetadata = this.metadataMap.get(path);
		return Object.freeze({
			...this.defaultMetadata,
			...routeMetadata,
		});
	}

	generateMetaTags(path: string): readonly { name: string; content: string }[] {
		const metadata = this.getMetadata(path);
		const tags: { name: string; content: string }[] = [];

		if (metadata.title) {
			tags.push({ name: "title", content: metadata.title });
		}

		if (metadata.description) {
			tags.push({ name: "description", content: metadata.description });
		}

		if (metadata.keywords) {
			tags.push({ name: "keywords", content: metadata.keywords.join(", ") });
		}

		if (metadata.canonical) {
			tags.push({ name: "canonical", content: metadata.canonical });
		}

		if (metadata.og) {
			if (metadata.og.type) tags.push({ name: "og:type", content: metadata.og.type });
			if (metadata.og.title) tags.push({ name: "og:title", content: metadata.og.title });
			if (metadata.og.description) tags.push({ name: "og:description", content: metadata.og.description });
			if (metadata.og.image) tags.push({ name: "og:image", content: metadata.og.image });
			if (metadata.og.url) tags.push({ name: "og:url", content: metadata.og.url });
			if (metadata.og.siteName) tags.push({ name: "og:site_name", content: metadata.og.siteName });
		}

		if (metadata.twitter) {
			if (metadata.twitter.card) tags.push({ name: "twitter:card", content: metadata.twitter.card });
			if (metadata.twitter.site) tags.push({ name: "twitter:site", content: metadata.twitter.site });
			if (metadata.twitter.creator) tags.push({ name: "twitter:creator", content: metadata.twitter.creator });
			if (metadata.twitter.title) tags.push({ name: "twitter:title", content: metadata.twitter.title });
			if (metadata.twitter.description) tags.push({ name: "twitter:description", content: metadata.twitter.description });
			if (metadata.twitter.image) tags.push({ name: "twitter:image", content: metadata.twitter.image });
		}

		if (metadata.robots) {
			const directives: string[] = [];
			if (metadata.robots.index === false) directives.push("noindex");
			if (metadata.robots.follow === false) directives.push("nofollow");
			if (metadata.robots.noarchive) directives.push("noarchive");
			if (metadata.robots.nosnippet) directives.push("nosnippet");
			if (metadata.robots.noimageindex) directives.push("noimageindex");
			if (metadata.robots.notranslate) directives.push("notranslate");
			if (directives.length > 0) {
				tags.push({ name: "robots", content: directives.join(", ") });
			}
		}

		if (metadata.custom) {
			for (const [name, content] of Object.entries(metadata.custom)) {
				tags.push({ name, content });
			}
		}

		return Object.freeze(tags);
	}

	generateMetaHtml(path: string): string {
		const tags = this.generateMetaTags(path);
		let html = "";

		for (const tag of tags) {
			if (tag.name === "title") {
				html += `<title>${this.escapeHtml(tag.content)}</title>\n`;
			} else if (tag.name === "canonical") {
				html += `<link rel="canonical" href="${this.escapeHtml(tag.content)}">\n`;
			} else if (tag.name.startsWith("og:")) {
				html += `<meta property="${this.escapeHtml(tag.name)}" content="${this.escapeHtml(tag.content)}">\n`;
			} else {
				html += `<meta name="${this.escapeHtml(tag.name)}" content="${this.escapeHtml(tag.content)}">\n`;
			}
		}

		return html;
	}

	private escapeHtml(text: string): string {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
	}

	setDefaultMetadata(metadata: RouteMetadata): void {
		Object.assign(this.defaultMetadata, metadata);
	}

	clear(): void {
		this.metadataMap.clear();
	}
}

export const createRouteMetadataManager = (defaultMetadata?: RouteMetadata) => {
	return new RouteMetadataManager(defaultMetadata);
};

export const mergeMetadata = (...metadatas: readonly RouteMetadata[]): RouteMetadata => {
	return Object.freeze(
		metadatas.reduce(
			(acc, metadata) => ({
				...acc,
				...metadata,
				og: { ...acc.og, ...metadata.og },
				twitter: { ...acc.twitter, ...metadata.twitter },
				robots: { ...acc.robots, ...metadata.robots },
				custom: { ...acc.custom, ...metadata.custom },
			}),
			{},
		),
	);
};
