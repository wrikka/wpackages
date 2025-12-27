import type { Shape } from "../shapes";
import { roundRect } from "./helpers";

export const renderShape = (
	ctx: CanvasRenderingContext2D,
	shape: Shape,
): void => {
	ctx.save();

	ctx.translate(shape.position.x, shape.position.y);
	ctx.rotate(shape.rotation);

	if (shape.style.fill) {
		ctx.fillStyle = shape.style.fill as string;
	}
	if (shape.style.stroke) {
		ctx.strokeStyle = shape.style.stroke as string;
		ctx.lineWidth = shape.style.strokeWidth ?? 1;
	}
	if (shape.style.opacity !== undefined) {
		ctx.globalAlpha = shape.style.opacity;
	}

	switch (shape.type) {
		case "rectangle": {
			const r = shape.cornerRadius ?? 0;
			if (r > 0) {
				roundRect(ctx, 0, 0, shape.size.width, shape.size.height, r);
			} else {
				ctx.rect(0, 0, shape.size.width, shape.size.height);
			}
			break;
		}

		case "circle":
			ctx.arc(0, 0, shape.radius, 0, Math.PI * 2);
			break;

		case "ellipse":
			ctx.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
			break;

		case "line":
			ctx.beginPath();
			ctx.moveTo(shape.start.x, shape.start.y);
			ctx.lineTo(shape.end.x, shape.end.y);
			ctx.stroke();
			break;

		case "path": {
			if (shape.points.length > 0) {
				const firstPoint = shape.points[0];
				if (firstPoint) {
					ctx.beginPath();
					ctx.moveTo(firstPoint.x, firstPoint.y);
					for (let i = 1; i < shape.points.length; i++) {
						const point = shape.points[i];
						if (point) {
							ctx.lineTo(point.x, point.y);
						}
					}
					if (shape.closed) {
						ctx.closePath();
					}
					ctx.stroke();
				}
			}
			break;
		}
	}

	if (shape.style.fill && shape.type !== "line") {
		ctx.fill();
	}
	if (shape.style.stroke) {
		ctx.stroke();
	}

	ctx.restore();
};
