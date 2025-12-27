import type { Rect, Shape, ShapeId } from "../types";
import * as RectangleShapes from "../shapes/rectangle";
import * as CircleShapes from "../shapes/circle";
import * as LineShapes from "../shapes/line";
import * as ArrowShapes from "../shapes/arrow";
import * as PathShapes from "../shapes/path";

export const createShapeId = (): ShapeId =>
	`shape-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as ShapeId;

// ===== Re-export Rectangle Utils =====
export const getRectangleBounds = RectangleShapes.getBounds;
export const rectangleToSVGPath = RectangleShapes.toSVGPath;

// ===== Re-export Circle Utils =====
export const getCircleBounds = CircleShapes.getBounds;
export const circleToSVGPath = CircleShapes.toSVGPath;

// ===== Re-export Line Utils =====
export const getLineBounds = LineShapes.getBounds;
export const lineToSVGPath = LineShapes.toSVGPath;

// ===== Re-export Arrow Utils =====
export const arrowToSVGPath = ArrowShapes.toSVGPath;

// ===== Re-export Path Utils =====
export const pathToSVGPath = PathShapes.toSVGPath;

// ===== Generic Shape Utils =====
export const getShapeBounds = (shape: Shape): Rect => {
	switch (shape.type) {
		case "rectangle":
			return RectangleShapes.getBounds(shape as any);
		case "circle":
			return CircleShapes.getBounds(shape as any);
		case "line":
			return LineShapes.getBounds(shape as any);
		case "arrow":
			return ArrowShapes.getBounds(shape as any);
		case "path":
			return PathShapes.getBounds(shape as any);
		default:
			return { height: 0, width: 0, x: shape.position.x, y: shape.position.y };
	}
};

export const shapeToSVGPath = (shape: Shape): string => {
	switch (shape.type) {
		case "rectangle":
			return rectangleToSVGPath(shape);
		case "circle":
			return circleToSVGPath(shape);
		case "line":
			return lineToSVGPath(shape);
		case "arrow":
			return arrowToSVGPath(shape);
		case "path":
			return pathToSVGPath(shape);
		default:
			return "";
	}
};
