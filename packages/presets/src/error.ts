import { createLogger } from "@wpackages/observability";
import { AppError } from "@wpackages/error";

const logger = createLogger();

export const logError = (error: Error) => {
	logger.error(error.message, {
		name: error.name,
		cause: error instanceof AppError ? error.cause : undefined,
	});
};
