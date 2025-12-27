import type MarkdownIt from "markdown-it";

export function externalLinksPlugin(md: MarkdownIt) {
	const defaultRender =
		md.renderer.rules.link_open ||
		((tokens, idx, options, _env, self) =>
			self.renderToken(tokens, idx, options));
	md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
		const token = tokens[idx];
		if (token?.attrs) {
			const hrefIndex = token.attrIndex("href");
			if (hrefIndex >= 0) {
				const href = token.attrs[hrefIndex][1];
				if (href && /^https?:\/\//.test(href)) {
					token.attrPush(["class", "external-link"]);
					token.attrPush(["target", "_blank"]);
					token.attrPush(["rel", "noopener noreferrer"]);
					const domain = new URL(href).hostname;
					const nextToken = tokens[idx + 1];
					if (nextToken && nextToken.type === "image") {
						return defaultRender(tokens, idx, options, _env, self);
					}
					return `<span class="external-link-container"><img src="https://www.google.com/s2/favicons?domain=${domain}&sz=16&type=1" alt="${domain} favicon" class="w-3.5 h-3" />${defaultRender(tokens, idx, options, _env, self)}`;
				}
			}
		}
		return defaultRender(tokens, idx, options, _env, self);
	};
	md.renderer.rules.link_close = (tokens, idx, options, _env, self) => {
		const token = tokens[idx - 2];
		if (token?.attrs) {
			const hrefIndex = token.attrIndex("href");
			if (hrefIndex >= 0) {
				const href = token.attrs[hrefIndex][1];
				if (href && /^https?:\/\//.test(href)) {
					const prevToken = tokens[idx - 1];
					if (prevToken && prevToken.type === "image") {
						return self.renderToken(tokens, idx, options);
					}
					return `${self.renderToken(tokens, idx, options)}</span>`;
				}
			}
		}
		return self.renderToken(tokens, idx, options);
	};
}
