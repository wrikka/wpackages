import { createSchema } from "../lib/create-schema";
import type { Result, Schema } from "./index";

export type BooleanSchema = Schema<boolean> & {
	readonly message: (msg: string) => BooleanSchema;
	readonly name: (name: string) => BooleanSchema;
};

export function boolean(options: { message?: string; name?: string } = {}): BooleanSchema {
	const create = (next: { message?: string; name?: string }): BooleanSchema => {
		const base = createSchema({
			_metadata: { name: next.name || "boolean" },
			_input: false as boolean,
			_output: false as boolean,
			parse(input: unknown): Result<boolean> {
				if (typeof input !== "boolean") {
					return {
						success: false,
						issues: [
							{
								message: next.message
									|| `Expected a boolean, but received ${typeof input}`,
								path: [],
							},
						],
					};
				}
				return { success: true, data: input };
			},
		});

		return {
			...base,
			message: (msg) => create({ ...next, message: msg }),
			name: (name) => create({ ...next, name }),
		};
	};

	return create(options);
}
