import { coerceArray } from "./array";
import { coerceBoolean } from "./boolean";
import { coerceDate } from "./date";
import { coerceNumber } from "./number";
import { coerceString } from "./string";

export const coerce = {
	number: coerceNumber,
	boolean: coerceBoolean,
	date: coerceDate,
	string: coerceString,
	array: coerceArray,
} as const;

export { coerceArray, coerceBoolean, coerceDate, coerceNumber, coerceString };
