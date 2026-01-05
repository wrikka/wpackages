export class HttpError extends Error {
	readonly _tag = "HttpError";

	constructor(
		readonly status: number,
		message: string,
		readonly details?: unknown,
	) {
		super(message);
		this.name = "HttpError";
	}
}
