import type { CanvasState } from "../state";

export const toJSON = (state: CanvasState) => JSON.stringify(state, null, 2);

export const fromJSON = (json: string) => JSON.parse(json) as CanvasState;
