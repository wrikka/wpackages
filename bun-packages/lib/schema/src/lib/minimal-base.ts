/**
 * Minimal base schema for ultra-light bundle size
 */
export abstract class MinimalSchema<T> {
	readonly _type!: T;

	constructor() { }

	/**
	 * Parse value and return result or throw error
	 */
	parse(value: unknown): T {
		const result = this.safeParse(value);
		if (!result.success) {
			const message = result.errors
				.map(e => `[${e.path.join('.')}] ${e.message}`)
				.join('\n');
			throw new Error(message);
		}
		return result.data;
	}

	/**
	 * Parse value safely without throwing
	 */
	safeParse(value: unknown): SafeParseResult<T> {
		try {
			const data = this._validate(value);
			return { success: true, data };
		} catch (error) {
			if (error instanceof TypeError) {
				return {
					success: false,
					errors: [{
						path: [],
						message: error.message,
						code: 'type_mismatch'
					}]
				};
			}
			throw error;
		}
	}

	/**
	 * Abstract method for core validation
	 */
	protected abstract _validate(value: unknown): T;

	/**
	 * Convert schema to JSON Schema format
	 */
	abstract toJSON(): Record<string, unknown>;
}

/**
 * Minimal result type
 */
export type SafeParseResult<T> = {
	success: true;
	data: T;
} | {
	success: false;
	errors: SchemaIssue[];
};

/**
 * Minimal issue type
 */
export interface SchemaIssue {
	path: (string | number)[];
	message: string;
	code: string;
}

/**
 * Minimal type error
 */
export class TypeError extends Error {
	constructor(expected: string, received: string) {
		super(`Expected ${expected}, received ${received}`);
		this.name = 'TypeError';
	}
}
