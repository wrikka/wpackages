import { createApp } from "vue";
import { defineContentScript } from "wxt/utils/define-content-script";
import App from "./App.vue";

export default defineContentScript({
	matches: ["*://*/*"],

	main(ctx) {
		let selectedText = "";

		const ui = createIntegratedUi(ctx, {
			position: "modal",
			onMount: (container: HTMLElement) => {
				const app = createApp(App, {
					selectedText: selectedText,
					onClose: () => ui.remove(),
				});
				app.mount(container);
				return app;
			},
			onRemove: (app) => {
				app?.unmount();
			},
		});

		browser.runtime.onMessage.addListener((message) => {
			if (message.action === "show-ai-modal") {
				selectedText = message.selectionText;
				ui.mount();
			}
		});

		document.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.key === "l") {
				const selection = window.getSelection()?.toString();
				if (selection && selection.trim().length > 0) {
					event.preventDefault();
					selectedText = selection;
					ui.mount();
				}
			}
		});
	},
});
