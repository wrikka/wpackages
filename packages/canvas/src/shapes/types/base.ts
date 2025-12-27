import type { Color, Point } from "../../types";

export type ShapeId = string & { readonly __brand: "ShapeId" };

export type ShapeType =
	| "rectangle"
	| "circle"
	| "ellipse"
	| "line"
	| "arrow"
	| "text"
	| "path"
	| "polygon"
	| "triangle"
	| "diamond"
	| "star";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type FillStyle = "solid" | "hachure" | "cross-hatch" | "none";

export interface BaseStyle {
	readonly fill?: Color;
	readonly fillStyle?: FillStyle;
	readonly stroke?: Color;
	readonly strokeWidth?: number;
	readonly strokeStyle?: StrokeStyle;
	readonly opacity?: number;
}

export interface BaseShape {
	readonly id: ShapeId;
	readonly type: ShapeType;
	readonly position: Point;
	readonly rotation: number;
	readonly locked: boolean;
	readonly visible: boolean;
	readonly zIndex: number;
	readonly style: BaseStyle;
}

export const createShapeId = (): ShapeId =>
	`shape-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as ShapeId;
