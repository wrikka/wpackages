import { IDENTITY_TRANSFORM } from "../../constant";
import type { Shape, ShapeId } from "../../shapes";
import type { CanvasState } from "../types/state";

// ===== Pure State Transformers =====

export const addShape = (state: CanvasState, shape: Shape): CanvasState => ({
	...state,
	shapes: {
		...state.shapes,
		[shape.id]: shape,
	},
});

export const removeShape = (state: CanvasState, id: ShapeId): CanvasState => {
	const { [id]: _, ...rest } = state.shapes;
	return {
		...state,
		selection: {
			...state.selection,
			selectedIds: state.selection.selectedIds.filter((sid) => sid !== id),
		},
		shapes: rest,
	};
};

export const updateShape = (
	state: CanvasState,
	id: ShapeId,
	updates: Partial<Shape>,
): CanvasState => {
	const shape = state.shapes[id];
	if (!shape) return state;

	return {
		...state,
		shapes: {
			...state.shapes,
			[id]: { ...shape, ...updates },
		},
	};
};

export const selectShapes = (
	state: CanvasState,
	ids: ShapeId[],
): CanvasState => ({
	...state,
	selection: {
		...state.selection,
		selectedIds: ids,
	},
});

export const clearSelection = (state: CanvasState): CanvasState => ({
	...state,
	selection: {
		selectedIds: [],
	},
});

export const defaultState: CanvasState = {
	isDrawing: false,
	selection: {
		selectedIds: [],
	},
	shapes: {},
	viewport: {
		height: 1080,
		transform: IDENTITY_TRANSFORM,
		width: 1920,
	},
};
