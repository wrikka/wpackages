import type { Point } from "../types";

export const ZERO_POINT = Object.freeze<Point>(
	{
		x: 0,
		y: 0,
	} as const,
);
