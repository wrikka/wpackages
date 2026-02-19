export type ShortcutAction =
	| "submit"
	| "cancel"
	| "next"
	| "previous"
	| "select"
	| "deselect"
	| "toggle"
	| "delete"
	| "custom";

export interface Shortcut {
	key: string;
	description: string;
	action: ShortcutAction;
	handler?: () => void | Promise<void>;
}

export interface ShortcutOptions {
	shortcuts: Shortcut[];
	allowCustom?: boolean;
	showHelp?: boolean;
	helpKey?: string;
}

export interface ShortcutContext {
	active: boolean;
	available: Shortcut[];
	execute: (key: string) => boolean | Promise<boolean>;
}
