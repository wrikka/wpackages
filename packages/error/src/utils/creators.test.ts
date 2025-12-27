/**
 * Error Creators Tests
 */

import { describe, expect, it } from "vitest";
import * as creators from "../services/creators";

describe("appError", () => {
	it("should create AppError", () => {
		const error = creators.appError("Something went wrong");
		expect(error.name).toBe("AppError");
		expect(error.message).toBe("Something went wrong");
	});

	it("should include metadata", () => {
		const error = creators.appError("Error", {
			metadata: { userId: 123 },
		});
		expect(error.metadata).toEqual({ userId: 123 });
	});
});

describe("validationError", () => {
	it("should create ValidationError", () => {
		const error = creators.validationError("Invalid input");
		expect(error.name).toBe("ValidationError");
		expect(error.message).toBe("Invalid input");
	});

	it("should include field and value", () => {
		const error = creators.validationError("Invalid email", {
			field: "email",
			value: "not-an-email",
		});
		expect(error.field).toBe("email");
		expect(error.value).toBe("not-an-email");
	});
});

describe("httpError", () => {
	it("should create HttpError", () => {
		const error = creators.httpError("Not Found", 404);
		expect(error.name).toBe("HttpError");
		expect(error.message).toBe("Not Found");
		expect(error.status).toBe(404);
	});

	it("should include status text", () => {
		const error = creators.httpError("Server Error", 500, {
			statusText: "Internal Server Error",
		});
		expect(error.statusText).toBe("Internal Server Error");
	});
});

describe("notFoundError", () => {
	it("should create NotFoundError", () => {
		const error = creators.notFoundError("User", 123);
		expect(error.name).toBe("NotFoundError");
		expect(error.resource).toBe("User");
		expect(error.id).toBe(123);
		expect(error.message).toContain("User");
		expect(error.message).toContain("123");
	});

	it("should work without id", () => {
		const error = creators.notFoundError("Settings");
		expect(error.resource).toBe("Settings");
		expect(error.id).toBeUndefined();
	});
});

describe("fromError", () => {
	it("should convert Error to AppError", () => {
		const original = new Error("Original error");
		const error = creators.fromError(original);

		expect(error.name).toBe("AppError");
		expect(error.message).toBe("Original error");
		expect(error.cause).toBe(original);
	});
});

describe("fromUnknown", () => {
	it("should convert Error to AppError", () => {
		const error = creators.fromUnknown(new Error("Test"));
		expect(error.name).toBe("AppError");
		expect(error.message).toBe("Test");
	});

	it("should convert string to AppError", () => {
		const error = creators.fromUnknown("Error message");
		expect(error.name).toBe("AppError");
		expect(error.message).toBe("Error message");
	});

	it("should convert number to AppError", () => {
		const error = creators.fromUnknown(404);
		expect(error.name).toBe("AppError");
		expect(error.message).toBe("404");
	});
});
