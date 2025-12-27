import type { DefaultTheme } from "vitepress";

export default function sidebarOpenAPI(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/projects/openapi/overview" },
		{
			text: "Get Started",
			collapsed: false,
			base: "/projects/openapi/get-started",
			items: [
				{ text: "Gen TS to OpenAPI", link: "/gen-ts-to-openapi" },
				{ text: "Gen OpenAPI to Docs", link: "/gen-openapi-to-docs" },
			],
		},
	];
}
