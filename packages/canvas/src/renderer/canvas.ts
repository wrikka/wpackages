import type { CanvasState } from "../state";
import { renderShape } from "./shape";

export const renderCanvas = (
	ctx: CanvasRenderingContext2D,
	state: CanvasState,
): void => {
	ctx.clearRect(0, 0, state.viewport.width, state.viewport.height);

	ctx.save();

	const transform = state.viewport.transform;
	ctx.translate(transform.translate.x, transform.translate.y);
	ctx.scale(transform.scale, transform.scale);
	ctx.rotate(transform.rotate);

	const shapes = Object.values(state.shapes)
		.filter((s) => s.visible)
		.sort((a, b) => a.zIndex - b.zIndex);

	for (const shape of shapes) {
		renderShape(ctx, shape);
	}

	ctx.restore();
};
