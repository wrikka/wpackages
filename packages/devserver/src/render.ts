import { getHighlighter } from "shiki";

export async function render() {
	return {
		markdown: {
			highlighter: await getHighlighter({
				langs: ["javascript", "vue", "react", "svelte"],
				themes: ["vitesse-light"],
			}),
		},
	};
}
