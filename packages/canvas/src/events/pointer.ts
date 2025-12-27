import type { Point } from "../types";

export type PointerEventType = "pointerdown" | "pointermove" | "pointerup";

export interface PointerEvent {
	type: PointerEventType;
	position: Point;
	button: number;
	ctrlKey: boolean;
	shiftKey: boolean;
	altKey: boolean;
}
