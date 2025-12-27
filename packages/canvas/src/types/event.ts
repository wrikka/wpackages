import type { Point } from "./geometry";

export type PointerEventType = "pointerdown" | "pointermove" | "pointerup";

export interface PointerEvent {
	readonly type: PointerEventType;
	readonly position: Point;
	readonly button: number;
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
}

export type KeyboardEventType = "keydown" | "keyup";

export interface KeyboardEvent {
	readonly type: KeyboardEventType;
	readonly key: string;
	readonly ctrlKey: boolean;
	readonly shiftKey: boolean;
	readonly altKey: boolean;
}

export interface WheelEvent {
	readonly type: "wheel";
	readonly delta: number;
	readonly position: Point;
}

export type CanvasEvent = PointerEvent | KeyboardEvent | WheelEvent;
