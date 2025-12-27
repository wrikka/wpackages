/**
 * Utility Types
 *
 * Advanced TypeScript utility types สำหรับ type-safety
 */

/**
 * NonEmptyArray - Array ที่มีอย่างน้อย 1 element
 */
export type NonEmptyArray<T> = readonly [T, ...T[]];

/**
 * Prettify - ทำให้ type อ่านง่ายขึ้น (flatten intersections)
 */
export type Prettify<T> =
	& {
		[K in keyof T]: T[K];
	}
	& {};

/**
 * DeepReadonly - ทำให้ทุก property เป็น readonly (รวม nested)
 */
export type DeepReadonly<T> = {
	readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/**
 * DeepPartial - ทำให้ทุก property เป็น optional (รวม nested)
 */
export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Exact - ป้องกันไม่ให้มี extra properties
 */
export type Exact<T, U extends T> =
	& T
	& {
		[K in Exclude<keyof U, keyof T>]: never;
	};

/**
 * Mutable - ทำให้ readonly properties เป็น mutable
 */
export type Mutable<T> = {
	-readonly [K in keyof T]: T[K];
};

/**
 * RequiredKeys - ดึง keys ที่เป็น required
 */
export type RequiredKeys<T> = {
	[K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * OptionalKeys - ดึง keys ที่เป็น optional
 */
export type OptionalKeys<T> = {
	[K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * PickByType - Pick properties ตาม type
 */
export type PickByType<T, U> = {
	[K in keyof T as T[K] extends U ? K : never]: T[K];
};

/**
 * OmitByType - Omit properties ตาม type
 */
export type OmitByType<T, U> = {
	[K in keyof T as T[K] extends U ? never : K]: T[K];
};

/**
 * ValueOf - ดึง value types ออกมา
 */
export type ValueOf<T> = T[keyof T];

/**
 * KeysOfType - ดึง keys ที่มี type ตรงกัน
 */
export type KeysOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Awaited - Unwrap Promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * UnionToIntersection - แปลง Union เป็น Intersection
 */
export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void
		: never
) extends (k: infer I) => void ? I
	: never;

/**
 * Fn - Function type helper
 */
export type Fn<Args extends any[] = any[], Return = any> = (
	...args: Args
) => Return;

/**
 * AsyncFn - Async function type helper
 */
export type AsyncFn<Args extends any[] = any[], Return = any> = (
	...args: Args
) => Promise<Return>;

/**
 * Constructor - Constructor type helper
 */
export type Constructor<T = any, Args extends any[] = any[]> = new(
	...args: Args
) => T;

/**
 * Class - Class type helper
 */
export type Class<T = any> = Constructor<T>;

/**
 * JSONValue - Valid JSON value types
 */
export type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONObject
	| JSONArray;

export interface JSONObject {
	[key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

/**
 * Nominal - Create nominal (branded) types
 */
export type Nominal<T, Brand extends string> = T & {
	readonly __brand: Brand;
};

/**
 * Brand helper functions
 */
export const brand = <T, Brand extends string>(value: T): Nominal<T, Brand> => {
	return value as Nominal<T, Brand>;
};

export const unbrand = <T, Brand extends string>(
	value: Nominal<T, Brand>,
): T => {
	return value as T;
};

/**
 * Common branded types
 */
export type PositiveNumber = Nominal<number, "PositiveNumber">;
export type NegativeNumber = Nominal<number, "NegativeNumber">;
export type NonZeroNumber = Nominal<number, "NonZeroNumber">;
export type Email = Nominal<string, "Email">;
export type URL = Nominal<string, "URL">;
export type UUID = Nominal<string, "UUID">;
export type NonEmptyString = Nominal<string, "NonEmptyString">;

/**
 * Type guards สำหรับ branded types
 */
export const isPositiveNumber = (n: number): n is PositiveNumber => n > 0;
export const isNegativeNumber = (n: number): n is NegativeNumber => n < 0;
export const isNonZeroNumber = (n: number): n is NonZeroNumber => n !== 0;
export const isEmail = (s: string): s is Email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const isURL = (s: string): s is URL => {
	try {
		new globalThis.URL(s);
		return true;
	} catch {
		return false;
	}
};
export const isNonEmptyString = (s: string): s is NonEmptyString => s.length > 0;
