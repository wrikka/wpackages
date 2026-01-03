import { createSchema } from "../lib/create-schema";
import type { Issue, NumberOptions, Result, Schema } from "./index";

export type NumberSchema = Schema<number> & {
	readonly min: (value: number) => NumberSchema;
	readonly max: (value: number) => NumberSchema;
	readonly integer: () => NumberSchema;
	readonly message: (msg: string) => NumberSchema;
	readonly name: (name: string) => NumberSchema;
};

export function number(options: NumberOptions = {}): NumberSchema {
	const create = (next: NumberOptions): NumberSchema => {
		const base = createSchema({
			_metadata: { name: next.name || "number" },
			_input: 0 as number,
			_output: 0 as number,
			parse(input: unknown): Result<number> {
				if (typeof input !== "number") {
					return {
						success: false,
						issues: [
							{
								message: next.message
									|| `Expected a number, but received ${typeof input}`,
								path: [],
							},
						],
					};
				}

				const issues: Issue[] = [];

				if (next.min !== undefined && input < next.min) {
					issues.push({
						message: `Number must be greater than or equal to ${next.min}`,
						path: [],
					});
				}

				if (next.max !== undefined && input > next.max) {
					issues.push({
						message: `Number must be less than or equal to ${next.max}`,
						path: [],
					});
				}

				if (next.integer && !Number.isInteger(input)) {
					issues.push({
						message: "Number must be an integer",
						path: [],
					});
				}

				if (issues.length > 0) {
					return { success: false, issues };
				}

				return { success: true, data: input };
			},
		});

		const schema: NumberSchema = {
			...base,
			min: (value) => create({ ...next, min: value }),
			max: (value) => create({ ...next, max: value }),
			integer: () => create({ ...next, integer: true }),
			message: (msg) => create({ ...next, message: msg }),
			name: (name) => create({ ...next, name }),
		};

		return schema;
	};

	return create(options);
}
