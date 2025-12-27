import { createContentLoader } from "vitepress";

export interface BlogPost {
	url: string;
	title: string;
	date: string;
	tags: string[];
	category: string;
	image: string;
	description: string;
	excerpt?: string;
}

declare const data: BlogPost[];
export { data };

export default createContentLoader("blog/*.md", {
	excerpt: true,
	transform(raw): BlogPost[] {
		return raw
			.map(({ url, frontmatter, excerpt }) => ({
				url,
				title: frontmatter.title,
				date: frontmatter.date,
				tags: frontmatter.tags || [],
				category: frontmatter.category || "Uncategorized",
				image: frontmatter.image,
				description: frontmatter.description,
				excerpt,
			}))
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	},
});
