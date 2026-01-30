import type { HighlighterCoreOptions } from "shiki";

export const defaultMarkdownConfig = {
	langs: ["javascript", "typescript"],
	themes: ["vitesse-light"],
} as unknown as HighlighterCoreOptions;
