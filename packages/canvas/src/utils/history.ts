import type { CanvasState, History, HistoryEntry } from "../types";

export const createHistory = (maxSize = 100): History => ({
	maxSize,
	redoStack: [],
	undoStack: [],
});

export const push = (history: History, state: CanvasState): History => {
	const entry: HistoryEntry = { state, timestamp: Date.now() };
	const undoStack = [...history.undoStack, entry];

	return {
		...history,
		redoStack: [],
		undoStack: undoStack.length > history.maxSize ? undoStack.slice(1) : undoStack,
	};
};

export const undo = (
	history: History,
): [History, CanvasState | null] => {
	if (history.undoStack.length === 0) {
		return [history, null];
	}

	const undoStack = history.undoStack.slice(0, -1);
	const entry = history.undoStack[history.undoStack.length - 1];
	if (!entry) {
		return [history, null];
	}

	const redoStack = [...history.redoStack, entry] as readonly HistoryEntry[];

	return [{ ...history, redoStack, undoStack }, entry.state];
};

export const redo = (
	history: History,
): [History, CanvasState | null] => {
	if (history.redoStack.length === 0) {
		return [history, null];
	}

	const redoStack = history.redoStack.slice(0, -1);
	const entry = history.redoStack[history.redoStack.length - 1];
	if (!entry) {
		return [history, null];
	}

	const undoStack = [...history.undoStack, entry] as readonly HistoryEntry[];

	return [{ ...history, redoStack, undoStack }, entry.state];
};

export const canUndo = (history: History): boolean => history.undoStack.length > 0;

export const canRedo = (history: History): boolean => history.redoStack.length > 0;

export const clear = (history: History): History => ({
	...history,
	redoStack: [],
	undoStack: [],
});
