export default defineNuxtConfig({
	compatibilityDate: "2025-01-13",
	modules: [
		"@unocss/nuxt",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		"@nuxtjs/tailwindcss",
	],
	runtimeConfig: {
		public: {
			apiUrl: process.env.NUXT_PUBLIC_API_URL || "/api",
		},
	},
	app: {
		head: {
			title: "Ultimate Terminal",
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{
					name: "description",
					content: "Ultimate Terminal - A powerful terminal emulator",
				},
			],
			link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
		},
		pageTransition: { name: "page", mode: "out-in" },
		layoutTransition: { name: "layout", mode: "out-in" },
	},
	vite: {
		resolve: {
			alias: {
				"@": "./app",
				"@types": "./types",
				"@utils": "./app/utils",
				"@composables": "./app/composables",
				"@stores": "./app/stores",
				"@components": "./app/components",
				"@ui": "./app/components/ui",
				"@server": "./server",
			},
		},
		css: {
			devSourcemap: true,
		},
	},
	css: ["~/assets/css/main.css"],
	vue: {
		compilerOptions: {
			isCustomElement: (tag) => tag.includes("-"),
		},
	},
	pinia: {
		storesDirs: ["./app/stores/**"],
	},
	experimental: {
		typedPages: true,
		inlineSSRStyles: false,
	},
	nitro: {
		experimental: {
			openAPI: true,
		},
	},
	postcss: {
		plugins: {
			"@unocss/postcss": {},
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	srcDir: "app/",
	typescript: {
		strict: true,
		typeCheck: true,
		tsConfig: {
			compilerOptions: {
				strict: true,
				jsx: "preserve",
				jsxImportSource: "vue",
				types: ["@nuxt/types", "@pinia/nuxt", "@vueuse/nuxt"],
			},
		},
	},
});
