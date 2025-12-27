import type { KeyboardEvent } from "./keyboard";
import type { PointerEvent } from "./pointer";
import type { WheelEvent } from "./wheel";

export type CanvasEvent = PointerEvent | KeyboardEvent | WheelEvent;
