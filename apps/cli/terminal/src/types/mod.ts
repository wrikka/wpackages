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
	cursor: CursorPosition;
	scrollback: TerminalCell[][];
}

export interface CursorPosition {
	x: number;
	y: number;
	visible: boolean;
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
	children: Pane[];
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
	variant: "light" | "dark";
	colors: {
		background: string;
		foreground: string;
		cursor: string;
		selection: string;
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
	workingDirectory: string;
	themeId: string;
	fontSize: number;
	fontFamily: string;
}

export interface ClipboardItem {
	id: string;
	content: string;
	timestamp: number;
	source: string;
}

export interface Hotkey {
	id: string;
	keys: string[];
	action: string;
	context: string;
}

export interface SearchMatch {
	id: string;
	text: string;
	position: { x: number; y: number };
	length: number;
}

export interface TelemetryMetric {
	name: string;
	value: number;
	timestamp: number;
	unit: string;
}

export interface PTYSession {
	id: string;
	pid: number;
	cols: number;
	rows: number;
}

export interface CommandResult {
	success: boolean;
	data?: unknown;
	error?: string;
}
