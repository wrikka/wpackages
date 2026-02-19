import { defineConfig } from "wxt";

export default defineConfig({
	manifest: {
		name: "Wai Browser Agent",
		version: "0.1.0",
		description: "AI-powered browser agent for intelligent web interaction",
		permissions: [
			"storage",
			"tabs",
			"scripting",
			"activeTab",
			"sidePanel",
			"contextMenus",
		],
		host_permissions: ["*://*/*"],
		side_panel: {
			default_path: "sidebar.html",
		},
		chrome_url_overrides: {
			newtab: "entrypoints/newtab/index.html",
		},
		modal: {
			importStyle: "entrypoints/modal/index.html",
		},
		omnibox: {
			keyword: "wr",
		},
	},
	modules: ["@wxt-dev/module-vue", "@wxt-dev/unocss"],
});
