export class PromptError extends Error {
	constructor(message: string, public readonly code: string) {
		super(message);
		this.name = "PromptError";
	}
}

export class ValidationError extends PromptError {
	constructor(message: string) {
		super(message, "VALIDATION_ERROR");
		this.name = "ValidationError";
	}
}

export class CancelError extends PromptError {
	constructor() {
		super("Prompt was cancelled", "CANCELLED");
		this.name = "CancelError";
	}
}

export class TimeoutError extends PromptError {
	constructor(message: string) {
		super(message, "TIMEOUT");
		this.name = "TimeoutError";
	}
}
