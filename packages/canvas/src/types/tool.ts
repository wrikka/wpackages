export type ToolType =
	| "select"
	| "rectangle"
	| "circle"
	| "line"
	| "arrow"
	| "text"
	| "pen"
	| "eraser"
	| "pan"
	| "zoom";

export interface Tool {
	readonly type: ToolType;
	readonly name: string;
	readonly icon?: string;
	readonly cursor?: string;
}
