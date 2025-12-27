import type { Point } from "../types";
import * as Line from "./line";
import type { ArrowShape } from "./types";

export const getBounds = Line.getBounds;
export const contains = Line.contains;
export const getCenter = Line.getCenter;
export const getLength = Line.getLength;
export const getAngle = Line.getAngle;

const DEFAULT_ARROW_HEAD_SIZE = 15;

export const getArrowHeadPoints = (
	shape: ArrowShape,
	atStart = false,
): [Point, Point, Point] => {
	const size = shape.arrowHeadSize ?? DEFAULT_ARROW_HEAD_SIZE;
	const angle = Math.atan2(
		shape.end.y - shape.start.y,
		shape.end.x - shape.start.x,
	);

	const tip = atStart ? shape.start : shape.end;
	const baseAngle = atStart ? angle + Math.PI : angle;

	const left = {
		x: tip.x + size * Math.cos(baseAngle + Math.PI / 6),
		y: tip.y + size * Math.sin(baseAngle + Math.PI / 6),
	};

	const right = {
		x: tip.x + size * Math.cos(baseAngle - Math.PI / 6),
		y: tip.y + size * Math.sin(baseAngle - Math.PI / 6),
	};

	return [tip, left, right];
};

export const toSVGPath = (shape: ArrowShape): string => {
	const linePath = `M ${shape.start.x} ${shape.start.y} L ${shape.end.x} ${shape.end.y}`;

	const [tip, left, right] = getArrowHeadPoints(shape);
	const arrowPath = `M ${left.x} ${left.y} L ${tip.x} ${tip.y} L ${right.x} ${right.y}`;

	if (shape.doubleHeaded) {
		const [tip2, left2, right2] = getArrowHeadPoints(shape, true);
		const arrowPath2 = `M ${left2.x} ${left2.y} L ${tip2.x} ${tip2.y} L ${right2.x} ${right2.y}`;
		return `${linePath} ${arrowPath} ${arrowPath2}`;
	}

	return `${linePath} ${arrowPath}`;
};

export const scale = (
	shape: ArrowShape,
	factor: number,
	origin: Point,
): ArrowShape => {
	const lineScaled = Line.scale(shape as any, factor, origin);

	return {
		...shape,
		...(shape.arrowHeadSize && {
			arrowHeadSize: shape.arrowHeadSize * factor,
		}),
		end: lineScaled.end,
		start: lineScaled.start,
	};
};
