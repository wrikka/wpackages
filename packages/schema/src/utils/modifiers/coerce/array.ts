import type { Schema } from "../../../types";
import { createSchema } from "../../create-schema";

export const coerceArray = <Input, Output>(
	schema: Schema<Input[], Output>,
	options: {
		readonly splitBy?: string;
		readonly trimItems?: boolean;
		readonly filterEmpty?: boolean;
	} = {},
): Schema<Input | Input[] | string, Output> => {
	return createSchema({
		parse: (input: unknown) => {
			let arr: unknown[];

			if (typeof input === "string" && options.splitBy) {
				arr = input.split(options.splitBy);

				if (options.trimItems) {
					arr = arr.map((item) => typeof item === "string" ? item.trim() : item);
				}

				if (options.filterEmpty) {
					arr = arr.filter(
						(item) => !(typeof item === "string" && item === ""),
					);
				}
			} else {
				arr = Array.isArray(input) ? input : [input];
			}

			return schema.parse(arr as Input[]);
		},
		_metadata: schema._metadata,
		// biome-ignore lint/suspicious/noExplicitAny: Required for type inference
		_input: undefined as any,
		_output: schema._output,
	});
};
