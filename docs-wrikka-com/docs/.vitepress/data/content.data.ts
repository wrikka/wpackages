import { createContentLoader } from "vitepress";

interface ContentItem {
	title: string;
	internallink?: string;
	externallink?: string;
	description: string;
	image?: string;
}

const contentData = createContentLoader("content/*.md", {
	transform(raw): ContentItem[] {
		return raw.map(({ frontmatter }) => ({
			title: frontmatter.title,
			internallink: frontmatter.link?.startsWith("/")
				? frontmatter.link
				: undefined,
			externallink: frontmatter.link?.startsWith("http")
				? frontmatter.link
				: undefined,
			description: frontmatter.description,
			image: frontmatter.image,
		}));
	},
});

export { contentData, type ContentItem };
