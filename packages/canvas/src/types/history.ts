import type { CanvasState } from "./state";

export interface HistoryEntry {
	readonly state: CanvasState;
	readonly timestamp: number;
}

export interface History {
	readonly undoStack: readonly HistoryEntry[];
	readonly redoStack: readonly HistoryEntry[];
	readonly maxSize: number;
}
