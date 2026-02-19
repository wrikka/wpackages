// https://nuxt.com/docs/api/configuration/nuxt-config
import checker from "vite-plugin-checker";

export default defineNuxtConfig({
	typescript: {
		typeCheck: true,
		tsConfig: {
			compilerOptions: {
				moduleResolution: "bundler",
				types: ["@tauri-apps/api"],
			},
		},
	},
	alias: {
		"~/shared": "./shared",
	},
	compatibilityDate: "2025-12-27",
	devtools: { enabled: true },
	modules: [
		"@unocss/nuxt",
		"@nuxt/icon",
		"@vue-macros/nuxt",
		"@nuxtjs/color-mode",
		"@vueuse/nuxt",
		"@pinia/nuxt",
		"nuxt-mcp-dev",
		"@scalar/nuxt",
	],

	ssr: false,

	scalar: {
		url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
	},

	icon: {
		serverBundle: {
			collections: ["mdi"],
		},
	},

	nitro: {
		preset: "cloudflare_module",
		cloudflare: {
			deployConfig: true,
			nodeCompat: true,
			wrangler: {
				routes: [
					{
						pattern: "desktop.wrikka.com",
						custom_domain: true,
					},
				],
			},
		},
	},

	vite: {
		clearScreen: false,
		envPrefix: ["VITE_", "TAURI_"],
		plugins: [
			checker({
				overlay: {
					initialIsOpen: false,
				},
				typescript: true,
				vueTsc: true,
				oxlint: true,
			}),
		],
		server: {
			strictPort: true,
		},
	},

	ignore: ["**/src-tauri/**"],
});
