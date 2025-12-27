import { computed } from "vue";
import type { DefaultTheme } from "vitepress";

export interface Project extends DefaultTheme.NavItemWithLink {
	link: string;
	text: string;
	title: string;
	image: string;
	alt: string;
	color: string;
	description: string;
	status?: "completed" | "coming";
	github?: string;
	demo?: string;
	playground?: string;
}

export default function useProjects() {
	const projectsItems: Project[] = [
		{
			link: "/projects/git-cli",
			text: "Git CLI",
			title: "Git CLI",
			image:
				"https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "Git CLI",
			color: "text-red-500",
			description: "เรียนรู้ Git ผ่าน CLI",
			status: "coming",
			github: "https://github.com/example/git-cli",
			demo: "https://example.com/git-cli-demo",
			playground: "https://example.com/git-cli-playground",
		},
		{
			link: "/projects/saas",
			text: "SaaS",
			title: "SaaS",
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e69166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "SaaS Platform",
			color: "text-red-500",
			description: "ระบบซอฟต์แวร์แบบบริการ",
			status: "coming",
			github: "https://github.com/example/saas",
			demo: "https://example.com/saas",
			playground: "https://example.com/saas-playground",
		},
		{
			link: "/projects/packages",
			text: "Package Library",
			title: "Package Library",
			image:
				"https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "Package Library",
			color: "text-amber-500",
			description: "ไลบรารีและแพคเกจโค้ดสำเร็จรูป",
			status: "coming",
			github: "https://github.com/example/packages",
			demo: "https://example.com/packages-demo",
			playground: "https://example.com/playground",
		},
		{
			link: "/projects/ai-chatbot",
			text: "AI Chatbot",
			title: "AI Chatbot",
			image:
				"https://images.unsplash.com/photo-1655720827862-39f9163811d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "AI Chatbot",
			color: "text-purple-500",
			description: "แชทบอทอัจฉริยะ",
			status: "coming",
			github: "https://github.com/example/ai-chatbot",
			demo: "https://example.com/ai-chatbot",
			playground: "https://example.com/ai-chatbot-playground",
		},
		{
			link: "/projects/framer-template",
			text: "Framer Template",
			title: "Framer Template",
			image:
				"https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "Framer Template",
			color: "text-red-500",
			description: "เทมเพลต Framer",
			status: "coming",
			github: "https://github.com/example/framer-template",
			demo: "https://example.com/framer-template",
			playground: "https://example.com/framer-template-playground",
		},
		{
			link: "/projects/wordpress-templates",
			text: "WordPress Templates",
			title: "WordPress Templates",
			image:
				"https://images.unsplash.com/photo-1471107340929-a87cd0f5b5e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "WordPress Templates",
			color: "text-blue-400",
			description: "เทมเพลต WordPress",
			status: "coming",
			github: "https://github.com/example/wordpress-templates",
			demo: "https://example.com/wordpress-templates",
			playground: "https://example.com/wordpress-templates-playground",
		},
		{
			link: "/projects/design-system",
			text: "Design System",
			title: "Design System",
			image:
				"https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "Design System",
			color: "text-green-500",
			description: "ระบบการออกแบบ",
			status: "coming",
			github: "https://github.com/example/design-system",
			demo: "https://example.com/design-system",
			playground: "https://example.com/design-system-playground",
		},
		{
			link: "/projects/templates-starter",
			text: "Template Starter",
			title: "Template Starter",
			image:
				"https://images.unsplash.com/photo-1551288049-bebda4e69166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=450&q=80",
			alt: "Template Starter",
			color: "text-amber-500",
			description: "เทมเพลตเริ่มต้นโครงการ",
			status: "coming",
			github: "https://github.com/example/templates-starter",
			demo: "https://example.com/template-starter",
			playground: "https://example.com/template-starter-playground",
		},
	];

	const projects = computed(() => projectsItems);

	return {
		projects,
	};
}
