export class SdkError extends Error {
	public readonly cause?: Error;

	constructor(message: string, cause?: Error) {
		super(message);
		this.name = this.constructor.name;
		this.cause = cause;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class ApiError extends SdkError {
	constructor(public service: string, message: string, cause?: Error) {
		super(`[${service}] API Error: ${message}`, cause);
	}
}

export class AuthError extends SdkError {
	constructor(public service: string, message: string = "Authentication failed") {
		super(`[${service}] Auth Error: ${message}`);
	}
}

export class ValidationError extends SdkError {
	constructor(message: string, public details?: any) {
		super(`Validation Error: ${message}`);
	}
}

export class IntegrationError extends SdkError {
	constructor(message: string, public details?: any) {
		super(message);
	}
}

export class ConfigError extends SdkError {
	constructor(message: string) {
		super(`Configuration Error: ${message}`);
	}
}

export class NotFoundError extends SdkError {
	constructor(resource: string) {
		super(`Not Found: ${resource}`);
	}
}
