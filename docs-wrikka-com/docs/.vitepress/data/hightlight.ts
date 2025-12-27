export interface HighlightItem {
	title: string;
	description: string;
	image: string;
	link?: string;
}

export const highlights: HighlightItem[] = [
	{
		title: "remote caching จะช่วยลดพื้นที่ node_modules",
		description:
			"ลดขนาด node_modules ลงได้เยอะเลย แถมยังทำให้ติดตั้ง packages เร็วขึ้นด้วย",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752403956/markdown-images/mfg2ua9reow5lnqzmgch.png",
		link: "https://turborepo.com/docs/core-concepts/remote-caching",
	},
	{
		title: "ใช้ ast-grep สำหรับ structural search",
		description:
			"ค้นหาและแก้ไขโค้ดแบบโครงสร้าง (AST) ได้อย่างแม่นยำ ช่วยให้การ refactor โค้ดทำได้ง่ายและปลอดภัยมากขึ้น",
		image: "https://ast-grep.github.io/image/search-replace.png",
		link: "/highlight/ast-grep",
	},
	{
		title: "ใช้ ni แทน npm pnpm",
		description: "ใช้ ni แล้วไม่ต้องจำคำสั่ง มันเลือก package manager ให้เอง",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752404111/markdown-images/awhkmptid5mgxxlku2wt.png",
		link: "https://github.com/antfu/ni",
	},
	{
		title: "ใช้ windsurf workflow เพื่อง่ายความสะดวกสบาย",
		description: "workflow ที่ทำให้เขียนโค้ดสบายๆ งานเร็วขึ้น",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752404233/markdown-images/v5bqz7zgl7wpajfhgjrn.png",
		link: "/highlight/workflows",
	},
	{
		title: "ดูประสิทธิภาพ AI ดูที่ artificialanalysis",
		description: "มาเช็คกันว่า AI ตัวไหนเร็ว แรง ตรงใจเราที่สุด",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752405417/markdown-images/cunvp7v4cfvvwyssijqj.png",
		link: "/highlight/ai-assistant",
	},
	{
		title: "ใช้ unocss แทน tailwindcss",
		description: "unocss เร็วกว่า tailwindcss ตั้งเยอะ ลองแล้วติดใจ",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406254/markdown-images/b4hqglvxmqmra5d7hott.png",
		link: "/highlight/unocss",
	},
	{
		title: "run lint และแก้ error ทั้งหมดจนไม่มีเหลือ",
		description: "เคล็ดลับการไล่จับ error ให้หมดไป",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752407087/markdown-images/fdmrcat22m25jxmiukkx.png",
		link: "/highlight/linting",
	},
	{
		title: "ใช้ Clerk สำหรับ Auth ถ้าต้องการความง่าย",
		description: "ทำระบบ login/logout ง่ายๆ ด้วย Clerk",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406357/markdown-images/jnueau8gqpwg63bjr3ee.png",
		link: "https://clerk.com/docs/vue/components/authentication/sign-in",
	},
	{
		title: "ใช้ Windsurf",
		description: "ชุดเครื่องมือเด็ดสำหรับนักพัฒนา",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406506/markdown-images/enngnbpf2at71zhxkb8f.png",
		link: "/software/windsurf",
	},
	{
		title: "commit 1 ครั้ง ให้หลาย commit",
		description: "แบ่งการเปลี่ยนแปลงเป็น commit ย่อยๆ จาก staging เดียว",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406838/markdown-images/vs79x9rwvmyqz9nlestk.png",
		link: "/highlight/git-workflow",
	},
	{
		title: "package manager ใน windows แนะนำใช้ scoop",
		description: "ติดตั้งโปรแกรมใน windows ง่ายๆ ด้วย scoop",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406388/markdown-images/xniw1hixhlfdi1goxbir.png",
		link: "/highlight/scoop",
	},
	{
		title: "ติดตั้ง Starship เพื่อให้ shell prompt สวยๆ",
		description: "ทำให้ terminal สวย ปัง ดูโปรด้วย Starship",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406434/markdown-images/bry52552fs42fzxbzutj.png",
		link: "https://starship.rs/",
	},
	{
		title: "ให้เชื่อมั่นใน Vite",
		description: "Vite เร็วเว่อร์ ลองแล้วจะรัก",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406084/markdown-images/hqeadvmtqjizjick91jn.png",
		link: "https://vite.dev/",
	},
	{
		title: "Icon ใช้ Iconify",
		description: "มี icon เยอะแยะ ใช้ง่ายด้วย Iconify",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406160/markdown-images/wn8ri666rhwh4jgwjutz.png",
		link: "https://iconify.design/docs/usage/",
	},
	{
		title: "ใช้ ts แทน js เสมอ",
		description: "TypeScript ช่วยจับ error ก่อนรันโค้ด",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406990/markdown-images/ohltpyizoxrzvgehkjjf.png",
		link: "/software/typescript",
	},
	{
		title: "ใช้ tsdown สำหรับสร้าง package",
		description: "สร้าง package ง่ายๆ ด้วย tsdown",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752407161/markdown-images/nd0ry4wlotpup8ybhcly.png",
		link: "https://tsdown.dev/",
	},
	{
		title: "ใช้ Yazi จะเข้าถึงไฟล์ได้เร็วกว่า",
		description: "จัดการไฟล์เร็วปรี๊ดด้วย Yazi",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406804/markdown-images/kjz7mhr6seo2k5tla9qd.png",
		link: "https://github.com/sxyazi/yazi",
	},
	{
		title: "อย่าใช้ Express",
		description: "มีตัวอื่นที่ดีกว่า Express อีกเยอะ",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406659/markdown-images/ey7jtgnvfsdnat4lhynf.png",
		link: "/highlight/express-alternatives",
	},
	{
		title: "แก้ไข error ล่ง problems ให้ AI",
		description: "ให้ AI ช่วยแกะ error ให้ ง่ายกว่ามานั่งแกะเอง",
		image:
			"https://res.cloudinary.com/daldcdwqs/image/upload/v1752406711/markdown-images/uwqkoaopfsarivcgksnd.png",
		link: "/highlight/ai-error-fixing",
	},
];
