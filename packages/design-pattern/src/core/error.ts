// @ai: Add custom error classes for design patterns, e.g., SingletonError for multiple instantiation attempts.

export class DesignPatternError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DesignPatternError";
	}
}

export class SingletonError extends DesignPatternError {
	constructor(message: string) {
		super(message);
		this.name = "SingletonError";
	}
}
