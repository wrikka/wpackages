import type { Transform } from "../types";
import { ZERO_POINT } from "./point";

export const IDENTITY_TRANSFORM = Object.freeze<Transform>(
	{
		rotate: 0,
		scale: 1,
		translate: ZERO_POINT,
	} as const,
);
