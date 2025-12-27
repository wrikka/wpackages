/**
 * Builder Pattern - Pure functional implementation
 * Constructs complex objects step by step
 */

import type { BuilderStep } from "../types";

/**
 * Create a builder with fluent interface
 */
export const createBuilder = <TState extends Record<string, unknown>>(
	initialState: TState,
) => {
	type Builder =
		& {
			readonly [K in keyof TState as `set${Capitalize<string & K>}`]: (
				value: TState[K],
			) => Builder;
		}
		& {
			readonly build: () => TState;
		};

	const build = (state: TState): Builder => {
		const builder: Record<string, unknown> = {};

		for (const key in state) {
			const capitalizedKey = `set${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			builder[capitalizedKey] = (value: TState[typeof key]) => build({ ...state, [key]: value });
		}

		builder['build'] = () => state;
		return builder as Builder;
	};

	return build(initialState);
};

/**
 * Create a pipeline builder
 */
export const createPipelineBuilder = <TState>(initialState: TState) => {
	const steps: Array<BuilderStep<TState, TState>> = [];

	return {
		step: (fn: BuilderStep<TState, TState>) => {
			steps.push(fn);
			return createPipelineBuilder(initialState);
		},
		build: (): TState => steps.reduce((state, fn) => fn(state), initialState),
	};
};

/**
 * Create a typed builder with validation
 */
export const createValidatedBuilder = <TState extends Record<string, unknown>>(
	initialState: TState,
	validators: {
		readonly [K in keyof TState]?: (value: TState[K]) => boolean;
	},
) => {
	const validateField = <K extends keyof TState>(
		key: K,
		value: TState[K],
	): TState[K] => {
		const validator = validators[key];
		if (validator && !validator(value)) {
			throw new Error(`Validation failed for field: ${String(key)}`);
		}
		return value;
	};

	const build = (state: TState) => ({
		set: <K extends keyof TState>(key: K, value: TState[K]) => build({ ...state, [key]: validateField(key, value) }),
		build: (): TState => state,
	});

	return build(initialState);
};

/**
 * Create a builder with required fields
 */
export const createRequiredBuilder = <
	TRequired extends Record<string, unknown>,
	TOptional extends Record<string, unknown> = Record<string, never>,
>(
	requiredFields: ReadonlyArray<keyof TRequired>,
) => {
	type PartialState = Partial<TRequired> & TOptional;

	const build = (state: PartialState = {} as PartialState) => ({
		set: <K extends keyof (TRequired & TOptional)>(
			key: K,
			value: (TRequired & TOptional)[K],
		) => build({ ...state, [key]: value }),
		build: (): TRequired & TOptional => {
			const missingFields = requiredFields.filter((field) => !(field in state));
			if (missingFields.length > 0) {
				throw new Error(
					`Missing required fields: ${missingFields.map(String).join(", ")}`,
				);
			}
			return state as TRequired & TOptional;
		},
	});

	return build();
};

/**
 * Create a nested builder
 */
type NestedBuilder<TParent extends Record<string, unknown>, TNested extends keyof TParent> = {
	setParent: <K extends Exclude<keyof TParent, TNested>>(
		key: K,
		value: TParent[K],
	) => NestedBuilder<TParent, TNested>;
	nested: (builder: (value: TParent[TNested]) => TParent[TNested]) => NestedBuilder<TParent, TNested>;
	build: () => TParent;
};

export const createNestedBuilder = <
	TParent extends Record<string, unknown>,
	TNested extends keyof TParent,
>(
	initialState: TParent,
	nestedKey: TNested,
): NestedBuilder<TParent, TNested> => {
	const build = (state: TParent): NestedBuilder<TParent, TNested> => ({
		setParent: <K extends Exclude<keyof TParent, TNested>>(key: K, value: TParent[K]) =>
			build({ ...state, [key]: value }),
		nested: (builder: (value: TParent[TNested]) => TParent[TNested]) =>
			build({ ...state, [nestedKey]: builder(state[nestedKey]) }),
		build: () => state,
	});

	return build(initialState);
};
