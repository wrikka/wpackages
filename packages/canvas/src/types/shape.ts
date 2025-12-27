import type { Color } from "./color";
import type { Point, Size } from "./geometry";

export type ShapeId = string & { readonly __brand: "ShapeId" };

export type ShapeType =
	| "rectangle"
	| "circle"
	| "ellipse"
	| "line"
	| "arrow"
	| "text"
	| "path"
	| "polygon";

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

export interface RectangleShape extends BaseShape {
	readonly type: "rectangle";
	readonly size: Size;
	readonly cornerRadius?: number;
}

export interface CircleShape extends BaseShape {
	readonly type: "circle";
	readonly radius: number;
}

export interface EllipseShape extends BaseShape {
	readonly type: "ellipse";
	readonly radiusX: number;
	readonly radiusY: number;
}

export interface LineShape extends BaseShape {
	readonly type: "line";
	readonly start: Point;
	readonly end: Point;
}

export interface ArrowShape extends BaseShape {
	readonly type: "arrow";
	readonly start: Point;
	readonly end: Point;
	readonly arrowHeadSize?: number;
	readonly doubleHeaded?: boolean;
}

export interface TextShape extends BaseShape {
	readonly type: "text";
	readonly content: string;
	readonly fontSize: number;
	readonly fontFamily: string;
	readonly fontWeight?: "normal" | "bold";
	readonly fontStyle?: "normal" | "italic";
	readonly textAlign?: "left" | "center" | "right";
	readonly maxWidth?: number;
}

export interface PathShape extends BaseShape {
	readonly type: "path";
	readonly points: readonly Point[];
	readonly closed: boolean;
	readonly smooth?: boolean;
}

export interface PolygonShape extends BaseShape {
	readonly type: "polygon";
	readonly points: readonly Point[];
}

export type Shape =
	| RectangleShape
	| CircleShape
	| EllipseShape
	| LineShape
	| ArrowShape
	| TextShape
	| PathShape
	| PolygonShape;
