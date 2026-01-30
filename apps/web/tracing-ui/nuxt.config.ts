// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",

	devtools: { enabled: true },

	modules: ["@unocss/nuxt"],

	// Alias paths
	alias: {
		"~/": "./app/",
		"#shared/": "./shared/",
		"~~/": "./",
	},

	// TypeScript configuration
	typescript: {
		typeCheck: true,
		strict: true,
	},

	// Auto-imports configuration
	imports: {
		autoImport: true,
	},

	// Components auto-import
	components: true,

	// Runtime config
	runtimeConfig: {
		public: {
			appName: "tracing-ui",
			appVersion: "1.0.0",
		},
	},

	// App configuration
	app: {
		head: {
			title: "@wpackages/tracing UI",
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "description", content: "Distributed tracing visualization UI" },
			],
		},
	},

	// Vite configuration
	vite: {
		clearScreen: false,
	},
});
