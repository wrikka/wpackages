// TODO: effect not available
import type { CanvasState } from "../state";

// TODO: effect not available
export const HistoryService = {
	push: (_state: CanvasState) => Promise.resolve<void>(undefined),
	undo: () => Promise.resolve<CanvasState | null>(null),
	redo: () => Promise.resolve<CanvasState | null>(null),
	canUndo: () => Promise.resolve<boolean>(false),
	canRedo: () => Promise.resolve<boolean>(false),
	clear: () => Promise.resolve<void>(undefined),
};
