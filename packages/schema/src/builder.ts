import { createValidatedBuilder } from "@w/design-pattern";
import type { StringOptions } from "./types";
import { string as createStringSchema } from "./schemas/string";

// Using the ValidatedBuilder from design-pattern to create a chainable API
const StringSchemaBuilder = () =>
	createValidatedBuilder<StringOptions>(
		{},
		{
			min: (state, min: number) => ({ ...state, min }),
			max: (state, max: number) => ({ ...state, max }),
			pattern: (state, pattern: RegExp) => ({ ...state, pattern }),
		},
	).map(createStringSchema);

export const s = {
	string: StringSchemaBuilder,
	// Other builders like number, object, array will be added here
};
