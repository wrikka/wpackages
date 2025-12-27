import type { Transform } from "./geometry";
import type { Shape, ShapeId } from "./shape";

export interface Selection {
	readonly selectedIds: ShapeId[];
	readonly hoveredId?: ShapeId;
}

export interface Viewport {
	readonly transform: Transform;
	readonly width: number;
	readonly height: number;
}

export interface CanvasState {
	readonly shapes: Record<ShapeId, Shape>;
	readonly selection: Selection;
	readonly viewport: Viewport;
	readonly isDrawing: boolean;
	readonly currentTool?: string;
}
