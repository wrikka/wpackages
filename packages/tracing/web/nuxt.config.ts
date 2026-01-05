// https://nuxt.com/docs/api/configuration/nuxt-config
import checker from "vite-plugin-checker";

export default defineNuxtConfig({
    compatibilityDate: "latest", 
    devtools: { enabled: true },
    modules: [
        "@vue-macros/nuxt",
        "@nuxtjs/color-mode",
        "@vueuse/nuxt",
        "@unocss/nuxt",
        "@pinia/nuxt",
        "nuxt-mcp-dev",
        "@nuxt/icon",
        "@scalar/nuxt"
    ],

    alias: {
        '~/shared': './shared'
    },

    typescript: {
		strict: true,
		typeCheck: true,
	},

    scalar: {
        url: 'https://registry.scalar.com/@scalar/apis/galaxy?format=yaml',
    },

    icon: {
        serverBundle: {
            collections: ['mdi']
        }
    },

    nitro: {
        preset: "cloudflare_module",
        cloudflare: {
            deployConfig: true,
            nodeCompat: true,
            wrangler : {
                routes: [
					{
						pattern: "*tracing.wrikka.com",
						custom_domain: true,
					},
				]
            }
        },
    },

    routeRules : {

    },

    vite: {
        plugins: [
            checker({
                overlay: {
                    initialIsOpen: false,
                },
                typescript: true,
                vueTsc: true,
                oxlint: true,
            }) as any,
        ],
    }
});
