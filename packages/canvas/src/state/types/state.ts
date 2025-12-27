import type { Shape, ShapeId } from "../../shapes";
import type { Transform } from "../../types";

export type Selection = {
	readonly selectedIds: ShapeId[];
	readonly hoveredId?: ShapeId;
};

export type Viewport = {
	readonly transform: Transform;
	readonly width: number;
	readonly height: number;
};

export type CanvasState = {
	readonly shapes: Record<ShapeId, Shape>;
	readonly selection: Selection;
	readonly viewport: Viewport;
	readonly isDrawing: boolean;
	readonly currentTool?: string;
};
