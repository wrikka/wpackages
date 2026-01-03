/**
 * Supported editors for opening files
 */
export const EDITOR_OPTIONS = [
	{ value: "code", label: "Visual Studio Code" },
	{ value: "sublime", label: "Sublime Text" },
	{ value: "vim", label: "Vim" },
	{ value: "nano", label: "Nano" },
	{ value: "notepad", label: "Notepad" },
] as const;

export const DEFAULT_EDITOR = "code" as const;
