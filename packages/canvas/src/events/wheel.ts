import type { Point } from "../types";

export interface WheelEvent {
	type: "wheel";
	delta: number;
	position: Point;
}
