import type { DefaultTheme } from "vitepress";

export default function sidebarAI(): DefaultTheme.SidebarItem[] {
	return [
		{ text: "Overview", link: "/framework/ai/overview" },
		{
			text: "Get Started",
			collapsed: false,
			base: "/framework/ai/get-started",
			items: [
				{ text: "Design Principles", link: "/design-principles" },
				{ text: "Framework Integration", link: "/framework-integration" },
			],
		},

		{
			text: "Generation",
			collapsed: false,
			base: "/framework/ai/generation",
			items: [
				{ text: "Text Generation", link: "/text-generation" },
				{ text: "Image Generation", link: "/image-generation" },
				{ text: "Video Generation", link: "/video-generation" },
				{ text: "Audio Generation", link: "/audio-generation" },
			],
		},

		{
			text: "Tooling",
			collapsed: false,
			base: "/framework/ai/tooling",
			items: [
				{ text: "Embedding (RAG)", link: "/embedding" },
				{ text: "Tool Calling (MCP)", link: "/tool-calling" },
				{ text: "Thinking", link: "/thinking" },
				{ text: "Search", link: "/search" },
				{ text: "Research", link: "/research" },
				{ text: "Computer Vision", link: "/computer-vision" },
				{ text: "Memory", link: "/memory" },
				{ text: "Analytics", link: "/analytics" },
				{ text: "Runtime", link: "/runtime" },
				{ text: "Finetune", link: "/finetune" },
				{ text: "File System", link: "/file-system" },
				{ text: "Terminal", link: "/terminal" },
				{ text: "Browser", link: "/browser" },
			],
		},

		{
			text: "Agents",
			collapsed: false,
			base: "/framework/ai/agents",
			items: [
				{ text: "Create Agents", link: "/create-agents" },
				{
					text: "Multi Agents Collaboration (A2A)",
					link: "/agent-collaboration",
				},
			],
		},

		{
			text: "APIs",
			collapsed: false,
			base: "/framework/ai/composables",
			items: [
				{ text: "MCP", link: "/mcp" },
				{ text: "CLI", link: "/cli" },
				{ text: "Composables", link: "/composables" },
				{ text: "Components", link: "/components" },
			],
		},
	];
}
