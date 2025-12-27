import type { DefaultTheme } from "vitepress";

export default function sidebarCLI(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/framework/cli/overview" },
		{
			text: "Get Started",
			collapsed: false,
			base: "/framework/cli/get-started",
			items: [
			{ text: "Get Started", link: "/get-started" },
			{ text: "APIs", link: "/cli" },
			{ text: "Examples", link: "/examples" },
			],
		},

		{
			text: "Terminal Interface",
			collapsed: false,
			base: "/framework/cli/terminal-interface",
			items: [
				{ text: "Prompts", link: "/prompts" },
				{ text: "Commands", link: "/commands" },
				{ text: "Logger", link: "/logger" },
				{ text: "Table", link: "/table" },
				{ text: "Loading", link: "/loading" },
				{ text: "Tasks", link: "/tasks" },
				{ text: "Search", link: "/search" },
				{ text: "Instructions", link: "/instructions" },
				{ text: "Error Handling", link: "/error-handling" },
				{ text: "Help System", link: "/help-system" },
				{ text: "Configuration", link: "/configuration" },
				{ text: "Autocomplete", link: "/autocomplete" },
			],
		},
	];
}
