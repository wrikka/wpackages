import { literal, number, object, record, type Schema, string, union } from "@wpackages/schema";
import type { RouteParam } from "../types";

const routeParamTypeSchema = union([
	literal("string"),
	literal("number"),
	literal("boolean"),
]);

const createRouteParamSchema = (isOptional: boolean) =>
	object({
		name: string().refine((s) => (s.length > 0 ? true : "Name cannot be empty")),
		type: routeParamTypeSchema,
		optional: literal(isOptional),
	});

export const routeParamSchema = createRouteParamSchema(false);
export const optionalRouteParamSchema = createRouteParamSchema(true);

export const routeParamWithOptionalSchema = union([
	routeParamSchema as Schema<any>,
	optionalRouteParamSchema as Schema<any>,
]);

const allowedParamValue = union([
	string(),
	number(),
	literal(true),
	literal(false),
]);

export const paramsSchema = record(allowedParamValue);
export const querySchema = record(string().optional());

export const routeMatchSchema = object({
	path: string(),
	params: paramsSchema,
	query: querySchema,
	hash: string().optional(),
});

const validateData = <T>(schema: Schema<T>, data: unknown) => {
	const result = schema.safeParse(data);
	return result.success
		? { data: result.data, error: null }
		: { data: null, error: result.error.issues };
};

export const validateRouteParams = (
	params: Record<string, unknown>,
	expectedParams: readonly RouteParam[],
) => {
	const shape = Object.fromEntries(
		expectedParams.map((param) => [
			param.name,
			param.optional
				? (allowedParamValue.optional() as Schema<any>)
				: (allowedParamValue as Schema<any>),
		]),
	);
	const schema = object(shape);
	return validateData(schema, params);
};

export const validateRouteQuery = (query: Record<string, string | undefined>) => {
	return validateData(querySchema, query);
};

export const createRouteSchema = <
	TParams extends Record<string, Schema<any>>,
	TQuery extends Record<string, Schema<any>>,
	TBody extends Record<string, Schema<any>>,
>(shape: {
	params?: TParams;
	query?: TQuery;
	body?: TBody;
}) => {
	return {
		params: shape.params ? object(shape.params) : undefined,
		query: shape.query ? object(shape.query) : undefined,
		body: shape.body ? object(shape.body) : undefined,
	};
};
