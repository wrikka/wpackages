// TODO: effect not available
import type { CanvasState } from "../state";
import type { HistoryEntry } from "./types";

export const makeHistoryService = (maxSize = 100) => {
	const undoStack: HistoryEntry[] = [];
	const redoStack: HistoryEntry[] = [];

	return {
		canRedo: () => redoStack.length > 0,

		canUndo: () => undoStack.length > 0,

		clear: () => {
			undoStack.length = 0;
			redoStack.length = 0;
		},
		push: (state: CanvasState) => {
			undoStack.push({ state, timestamp: Date.now() });
			if (undoStack.length > maxSize) {
				undoStack.shift();
			}
			redoStack.length = 0;
		},

		redo: () => {
			const entry = redoStack.pop();
			if (entry) {
				undoStack.push(entry);
				return entry.state;
			}
			return null;
		},

		undo: () => {
			const entry = undoStack.pop();
			if (entry) {
				redoStack.push(entry);
				return entry.state;
			}
			return null;
		},
	};
};
