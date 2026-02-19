export interface TerminalCell {
	char: string;
	fg: string;
	bg: string;
	bold: boolean;
	italic: boolean;
	underline: boolean;
}

export interface TerminalBuffer {
	rows: TerminalCell[][];
	cursor: { x: number; y: number; visible: boolean };
	scrollback: TerminalCell[][];
}

export interface Tab {
	id: string;
	title: string;
	active: boolean;
	paneId: string;
	metadata: Record<string, unknown>;
}

export interface Pane {
	id: string;
	parentId: string | null;
	children: string[];
	splitDirection: "horizontal" | "vertical" | null;
	splitRatio: number;
	terminalId: string | null;
	active: boolean;
}

export interface Session {
	id: string;
	name: string;
	tabs: Tab[];
	panes: Pane[];
	createdAt: number;
	updatedAt: number;
}

export interface Theme {
	id: string;
	name: string;
	colors: {
		bg: string;
		fg: string;
		cursor: string;
		black: string;
		red: string;
		green: string;
		yellow: string;
		blue: string;
		magenta: string;
		cyan: string;
		white: string;
		brightBlack: string;
		brightRed: string;
		brightGreen: string;
		brightYellow: string;
		brightBlue: string;
		brightMagenta: string;
		brightCyan: string;
		brightWhite: string;
	};
}

export interface Profile {
	id: string;
	name: string;
	shell: string;
	args: string[];
	env: Record<string, string>;
	workingDir: string;
}

export interface ClipboardItem {
	id: string;
	content: string;
	timestamp: number;
}

export interface Hotkey {
	id: string;
	name: string;
	key: string;
	ctrl: boolean;
	shift: boolean;
	alt: boolean;
	meta: boolean;
	action: string;
}

export interface SearchMatch {
	line: number;
	start: number;
	end: number;
	text: string;
}

export interface TelemetryMetric {
	name: string;
	value: number;
	unit: string;
	timestamp: number;
}

export interface PTYSession {
	id: string;
	cols: number;
	rows: number;
	shell: string;
}

export interface CommandResult {
	success: boolean;
	data?: unknown;
	error?: string;
}
