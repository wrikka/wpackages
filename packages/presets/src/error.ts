import { Effect } from "effect";
import { Logger } from "./services";

export class CustomError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "CustomError";
	}
}

export const logError = (error: Error) => Effect.flatMap(Logger, (logger) => logger.log(`[Error] ${error.message}`));
