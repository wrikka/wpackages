import { computed, type ComputedRef } from "vue";
import type { DefaultTheme } from "vitepress";

export interface ContentItem {
	color?: string;
	description: string;
	items?: ContentItem[];
	text: string;
	link: string;
	icon?: string;
	coverImage?: string;
}

export default function useContent(): {
	contentItems: ComputedRef<ContentItem[]>;
	sidebarSoftwareDevItems: ComputedRef<DefaultTheme.SidebarItem[]>;
} {
	const contentItems = computed<ContentItem[]>(() => [
		{
			text: "AI Stack",
			link: "/software/aistack",
			description: "แอปพลิเคชัน AI",
		coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755178883/learn-wrikka-com/tpmsdmtqblfiyvdng0nx.webp"
		},

		{
			text: "Dev Tools",
			link: "/software/devtools",
			description: "เครื่องมือนักพัฒนา",
			color: "bg-green-900/50",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755179747/learn-wrikka-com/xaxxdwkgl9vxvqru7t6j.webp"
		},

		{
			text: "Frontend",
			link: "/software/frontend",
			description: "พัฒนา Frontend",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755183442/learn-wrikka-com/ojqa8ubqnurzuqjzzyu0.webp"
		},
		{
			text: "Backend",
			link: "/software/backend",
			description: "เครื่องมือ SaaS",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755179092/learn-wrikka-com/igxyf8tr3cjg7pobuz4t.webp"
		},
		{
			text: "Testing",
			link: "/software/testing",
			description: "ทดสอบซอฟต์แวร์",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755178776/learn-wrikka-com/zzy3kcxs5dvnvxdegvyc.webp"
		},
		{
			text: "Deployment",
			link: "/software/deployment",
			description: "Deploy แอป",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755181833/learn-wrikka-com/cwql2vxjydiqlmwyvom1.webp"
		},
		{
			text: "Documentation",
			link: "/software/documentation",
			description: "เอกสาร",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755178296/learn-wrikka-com/vjivbemzyb7f6rkup03o.webp"
		},
		{
			text: "AI Coding",
			link: "/software/ai-coding",
			description: "AI ช่วยเขียนโค้ด",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755178581/learn-wrikka-com/wsyebhugr5yl0pocflu5.webp"
		},
		{
			text: "Resources",
			link: "/software/resources",
			description: "เครื่องมือนักพัฒนา",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755179436/learn-wrikka-com/tymsewvuleq8mpjj6yar.webp"
		},
		{
			text: "Cross Platform",
			link: "/software/cross-platform",
			description: "แอปข้ามแพลตฟอร์ม",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755182073/learn-wrikka-com/giw8ib0lbpj3smom9ipg.webp"
		},
		{
			text: "Programming",
			link: "/software/programming",
			description: "ภาษาโปรแกรม",
			coverImage: "https://res.cloudinary.com/daldcdwqs/image/upload/f_auto/v1755178665/learn-wrikka-com/dwdsfat4zsidqvkumavd.webp"
		},

		/*
	{
	  text: "Crypto Tools",
	  link: "/software/crypto",
	  description: "เครื่องมือวิเคราะห์คริปโตเคอร์เรนซี",
	  icon: "i-mdi-currency-btc",
	  color: "bg-yellow-900/50"
	},
	{
	  text: "Trading",
	  link: "/software/trading",
	  description: "แพลตฟอร์มเทรดคริปโตและเครื่องมือวิเคราะห์",
	  icon: "i-mdi-chart-line",
	  color: "bg-purple-900/50"
	},
	{
			text: "Blockchain",
			link: "/software/blockchain",
			description: "เครื่องมือและเนื้อหาเกี่ยวกับเทคโนโลยีบล็อกเชน",
			color: "bg-purple-900/50",
		},
		*/
	]);

	const sidebarSoftwareDevItems = computed<DefaultTheme.SidebarItem[]>(() => {
		return contentItems.value.map((item) => ({
			text: item.text,
			link: item.link,
		}));
	});

	return {
		contentItems,
		sidebarSoftwareDevItems,
	};
}
