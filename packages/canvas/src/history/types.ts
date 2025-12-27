import type { CanvasState } from "../state";

export interface HistoryEntry {
	state: CanvasState;
	timestamp: number;
}
