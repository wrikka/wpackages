export class TranslationError extends Error {
	constructor(message: string, public readonly code: string) {
		super(message);
		this.name = "TranslationError";
	}
}

export class UnsupportedLanguageError extends TranslationError {
	constructor(language: string) {
		super(`Unsupported language: ${language}`, "UNSUPPORTED_LANGUAGE");
		this.name = "UnsupportedLanguageError";
	}
}

export class InvalidCodeError extends TranslationError {
	constructor(message: string, public readonly line?: number, public readonly column?: number) {
		super(message, "INVALID_CODE");
		this.name = "InvalidCodeError";
	}
}

export class NetworkError extends TranslationError {
	constructor(message: string) {
		super(message, "NETWORK_ERROR");
		this.name = "NetworkError";
	}
}
