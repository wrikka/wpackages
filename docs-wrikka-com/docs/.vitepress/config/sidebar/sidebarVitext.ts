import type { DefaultTheme } from "vitepress";

export default function sidebarViteReact(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "About Vitext",
			collapsed: false,
			link: "/introduction",
			base: "/framework/vitext/about",
			items: [
				{ text: "Introduction", link: "/introduction" },
				{ text: "Arhitecture", link: "/architecture" },
			],
		},
		{
			text: "Get Started",
			collapsed: false,
			link: "/introduction",
			base: "/framework/vitext/get-started",
			items: [
				{ text: "Learn Vitext", link: "/learn-vitext" },
				{ text: "Prerequisites", link: "/prerequisites" },
				{ text: "Setup Project", link: "/setup-project" },
			],
		},


		{
			text: "Development",
			collapsed: false,
			base: "/framework/vitext/development",
			items: [
				{ text: "CLI", link: "/cli" },
				{ text: "Testing", link: "/testing" },
				{ text: "Error Handling", link: "/error-handling" },
				{ text: "Debugging", link: "/debugging" },
				{ text: "Refactoring", link: "/refactoring" },
				{ text: "Upgrading", link: "/upgrading" },
				{ text: "Linting", link: "/linting" },
				{ text: "Formatting", link: "/formatting" },
				{ text: "Analyzing", link: "/analyzing" },
			],
		},

		{
			text: "Frontend",
			collapsed: false,
			base: "/framework/vitext/frontend",
			items: [
				{ text: "Pages", link: "/pages" },
				{ text: "Navigation", link: "/navigation" },
				{ text: "Rendering", link: "/rendering" },
				{ text: "Styling", link: "/styling" },
				{ text: "Fetching", link: "/fetching" },
				{ text: "State Management", link: "/state-management" },
				{ text: "Loading", link: "/loading" },
				{ text: "Animation", link: "/animation" },
				{ text: "LifeCycle", link: "/lifecycle" },
				{ text: "SEO and Meta", link: "/seo-and-meta" },
			],
		},
		{
			text: "Backend",
			collapsed: false,
			base: "/framework/vitext/backend",
			items: [
				{ text: "Database", link: "/database" },
				{ text: "Authentication", link: "/authentication" },
				{ text: "Analytics", link: "/analytics" },
			],
		},
		{
			text: "Application",
			collapsed: false,
			base: "/framework/vitext/development",
			items: [
				{ text: "vitext.config.ts", link: "/vitext-config-ts" },
				{ text: "Optimizing", link: "/optimizing" },
				{ text: "Deployment", link: "/deployment" },
				{ text: "Security", link: "/security" },

			],
		},
		{
			text: "APIs",
			collapsed: false,
			base: "/framework/vitext/apis",
			items: [
				{ text: "Project Structure", link: "/project-structure" },
				{ text: "Components", link: "/components" },
				{ text: "Hooks", link: "/hooks" },
			],
		},

	];
}
