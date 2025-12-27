// Re-export all state utilities
export {
	addShape,
	clearSelection,
	defaultState,
	removeShape,
	selectShapes,
	updateShape,
} from "../state/services/state.service";

import type { CanvasState, ShapeId } from "../types";

export const setHoveredShape = (
	state: CanvasState,
	id?: ShapeId,
): CanvasState => {
	const selection = id
		? { ...state.selection, hoveredId: id }
		: { selectedIds: state.selection.selectedIds };

	return {
		...state,
		selection,
	};
};

export const setTool = (state: CanvasState, tool?: string): CanvasState => {
	if (tool) {
		return { ...state, currentTool: tool };
	}
	const { currentTool: _currentTool, ...rest } = state;
	return rest as CanvasState;
};

export const setDrawing = (
	state: CanvasState,
	isDrawing: boolean,
): CanvasState => ({
	...state,
	isDrawing,
});
