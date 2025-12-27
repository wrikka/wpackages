import type { DefaultTheme } from "vitepress";

export default function sidebarDocs(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/framework/docs/overview" },
		{
			text: "Get Started",
			collapsed: false,
			base: "/framework/docs/get-started",
			items: [{ text: "Installation", link: "/installation" }],
		},
		{
			text: "Writing",
			collapsed: false,
			base: "/framework/docs/writing",
			items: [
				{ text: "Frontmatter", link: "/frontmatter" },
				{ text: "Markdown", link: "/markdown" },
			],
		},
		{
			text: "Customize",
			collapsed: false,
			base: "/framework/docs/customize",
			items: [
				{ text: "Slots", link: "/slots" },
				{ text: "Sidebar", link: "/sidebar" },
				{ text: "Navbar", link: "/navbar" },
				{ text: "Theme", link: "/theme" },
				{ text: "SEO", link: "/seo" },
				{ text: "Search", link: "/search" },
				{ text: "Vite", link: "/vite" },
				{ text: "Markdown", link: "/markdown" },
			],
		},

		{
			text: "APIs",
			collapsed: false,
			base: "/framework/docs/apis",
			items: [
				{ text: "Markdown", link: "/markdown" },
				{ text: "Composables", link: "/composables" },
				{ text: "Components", link: "/components" },
			],
		},
	];
}
