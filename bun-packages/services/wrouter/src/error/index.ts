import { NotFoundError, AppError, ValidationError } from "@wpackages/error";

export class RouteNotFoundError extends NotFoundError {
	constructor(readonly pathname: string) {
		super({
			message: `Route not found: ${pathname}`,
			statusCode: 404,
			isOperational: true,
		});
	}
}

export class RouteMatchError extends ValidationError {
	constructor(readonly pathname: string, readonly reason: string) {
		super({
			message: `Failed to match route ${pathname}: ${reason}`,
			statusCode: 400,
			isOperational: true,
		});
	}
}

export class InvalidRoutePathError extends ValidationError {
	constructor(readonly path: string, readonly reason: string) {
		super({
			message: `Invalid route path ${path}: ${reason}`,
			statusCode: 400,
			isOperational: true,
		});
	}
}

export class MiddlewareError extends AppError {
	constructor(readonly middlewareName: string, readonly cause: unknown) {
		super({
			message: `Middleware ${middlewareName} failed`,
			statusCode: 500,
			isOperational: true,
			cause,
		});
	}
}

export class GuardError extends AppError {
	constructor(readonly guardName: string, readonly reason: string) {
		super({
			message: `Guard ${guardName} failed: ${reason}`,
			statusCode: 403,
			isOperational: true,
		});
	}
}
