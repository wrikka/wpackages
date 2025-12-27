import type { DefaultTheme } from "vitepress";

export default function sidebarUtils(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/utils/overview" },
		{
			text: "Get Started",
			collapsed: false,
			base: "/utils/get-started",
			items: [
				{ text: "Quick Start", link: "/quick-start" }],
		},
		{
			text: "Development",
			collapsed: false,
			base: "/utils/packages",
			items: [
				{ text: "Validator", link: "/validator" },
				{ text: "Cookies", link: "/cookies" },
				{ text: "Lifecycle", link: "/lifecycle" },
				{ text: "Error Handling", link: "/error-handling" },
				{ text: "Vite Devtools", link: "/vite-devtools1" },
			],
		},
		{
			text: "Frontend",
			collapsed: false,
			base: "/utils/utils",
			items: [
				{ text: "Local State", link: "/local-state" },
				{ text: "Global State", link: "/global-state" },
				{ text: "Pages Router", link: "/pages-router" },
				{ text: "Streaming", link: "/streaming" },
			],
		},
		{
			text: "Backend",
			collapsed: false,
			base: "/utils/utils",
			items: [
				{ text: "API Routes", link: "/api-routes" },
				{ text: "ORM", link: "/orm" },
			],
		},
		
	];
}
