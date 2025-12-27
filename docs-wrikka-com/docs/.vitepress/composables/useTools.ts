import { computed } from "vue";
import type { DefaultTheme } from "vitepress";

export interface ToolItem {
	text: string;
	link: string;
	description: string;
	icon: string;
	color?: string;
	coverImage?: string;
}

export default function useTools() {
	const toolItems: ToolItem[] = [
		// Business Tools
		{
			text: "Business Tools",
			link: "/tools/business-tools",
			description: "เครื่องมือสำหรับธุรกิจและการจัดการ",
			icon: "mdi:briefcase",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755181484/learn-wrikka-com/akmdgzyu7spsyls6fbsj.webp"
		},

		// Productivity Tools
		{
			text: "Productivity Tools",
			link: "/tools/productivity-tools",
			description: "เครื่องมือเพิ่มประสิทธิภาพการทำงาน",
			icon: "mdi:lightning-bolt",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755181331/learn-wrikka-com/e1lmlat3uxlnuitidjrb.webp"

		},

		// Creator Tools
		{
			text: "Creator Tools",
			link: "/tools/creator-tools",
			description: "เครื่องมือสำหรับครีเอเตอร์",
			icon: "mdi:brush",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755180023/learn-wrikka-com/sj63zeev7bl1bjfmlna2.webp"
		},

		// Browse Extensions
		{
			text: "Browser Extension",
			link: "/tools/browser-extensions",
			description: "ส่วนขยายเบราว์เซอร์สำหรับนักพัฒนา",
			icon: "mdi:puzzle",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755179796/learn-wrikka-com/czhpphhe7ikcwkigz6p1.webp"
		},
		// Windows Programs
		{
			text: "Windows Programs",
			link: "/tools/windows-program",
			description: "โปรแกรมสำหรับระบบปฏิบัติการ Windows",
			icon: "mdi:microsoft-windows",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755182356/learn-wrikka-com/q2idrwryfxvpz1249uw7.webp"
		}
	];

	const sidebarToolsItems = computed<DefaultTheme.SidebarItem[]>(() => {
		return toolItems.map((item) => ({
			text: item.text,
			link: item.link,
		}));
	});

	return {
		toolItems,
		sidebarToolsItems,
	};
}
