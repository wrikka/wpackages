import type { SidebarConfig } from '../../types/sidebar';
import sidebarAISDK from "./sidebarAISDK";
import sidebarTUI from "./sidebarTUI";
import sidebarComponents from "./sidebarComponents";
import sidebarDocs from "./sidebarDocs";
import sidebarGitCLI from "./sidebarGitCLI";
import sidebarVitext from "./sidebarVitext";
import sidebarServerEngine from "./sidebarServerEngine";
import sidebarFunctions from "./sidebarFunctions";
import sidebarViteDevtools from "./sidebarViteDevtools";
import sidebarBlog from "./sidebarBlog";

export const Sidebar: SidebarConfig = {
	"/ai-sdk": {
		logo: "",
		items: sidebarAISDK(),
	},
	"/docs": {
		logo: "",
		items: sidebarDocs(),
	},
	"/components": {
		logo: "",
		items: sidebarComponents(),
	},
	"/vitext": {
		logo: "",
		items: sidebarVitext(),
	},
	"/tui": {
		logo: "",
		items: sidebarTUI(),
	},
	"/functions": {
		logo: "",
		items: sidebarFunctions(),
	},
	"/server": {
		logo: "",
		items: sidebarServerEngine(),
	},
	"/dotfiles-manager": {
		logo: "",
		items: [
			{ text: 'Getting Started', link: '/dotfiles-manager/getting-started' },
			{ text: 'Advanced Configuration', link: '/dotfiles-manager/advanced' }
		],
	},
	"/git-cli": {
		logo: "",
		items: sidebarGitCLI(),
	},
	"/vite-devtools": {
		logo: "",
		items: sidebarViteDevtools(),
	},
	"/blog": {
		logo: "",
		items: sidebarBlog(),
	},
};