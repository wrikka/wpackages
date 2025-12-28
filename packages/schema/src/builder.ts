import { string as createStringSchema } from "./schemas/string";
import type { StringOptions } from "./types";

type Builder<State> = {
	readonly map: <T>(fn: (state: State) => T) => T;
};

const createBuilder = <State>(initial: State): Builder<State> => {
	const map = <T>(fn: (state: State) => T): T => fn(initial);
	return { map };
};

type StringBuilder = Builder<StringOptions> & {
	readonly min: (min: number) => StringBuilder;
	readonly max: (max: number) => StringBuilder;
	readonly pattern: (pattern: RegExp) => StringBuilder;
};

const createStringBuilder = (state: StringOptions): StringBuilder => {
	const base = createBuilder(state);
	return {
		...base,
		min: (min) => createStringBuilder({ ...state, min }),
		max: (max) => createStringBuilder({ ...state, max }),
		pattern: (pattern) => createStringBuilder({ ...state, pattern }),
	};
};

const StringSchemaBuilder = (): ReturnType<StringBuilder["map"]> => createStringBuilder({}).map(createStringSchema);

export const s = {
	string: StringSchemaBuilder,
	// Other builders like number, object, array will be added here
};
