import type { DefaultTheme } from "vitepress";

export default function sidebarKogit(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/projects/kogit/overview" },
		{
			text: "Commands",
			collapsed: false,
			base: "/projects/kogit/commands",
			items: [
				{ text: "Commit", link: "/commit" },
				{ text: "Branch", link: "/branch" },
				{ text: "Push", link: "/push" },
				{ text: "Pull", link: "/pull" },
				{ text: "Merge", link: "/merge" },
				{ text: "Rebase", link: "/rebase" },
				{ text: "Reset", link: "/reset" },
				{ text: "Revert", link: "/revert" },
				{ text: "Tag", link: "/tag" },
				{ text: "Clone", link: "/clone" },
				{ text: "Fetch", link: "/fetch" },
				{ text: "Pull", link: "/pull" },
				{ text: "Push", link: "/push" },
			],
		},
	];
}
