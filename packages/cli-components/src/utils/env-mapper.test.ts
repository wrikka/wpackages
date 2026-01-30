import { describe, expect, it } from "vitest";
import { mapEnvToOptions } from "./env-mapper";

describe("mapEnvToOptions", () => {
	it("should map environment variables to options", () => {
		const mapping = { MY_VAR: "myOption" };
		const env = { MY_VAR: "test-value" };
		const result = mapEnvToOptions(mapping, env);
		expect(result).toEqual({ myOption: "test-value" });
	});

	it("should parse boolean values", () => {
		const mapping = { DEBUG: "debug" };
		const result = mapEnvToOptions(mapping, { DEBUG: "true" });
		expect(result).toEqual({ debug: true });
	});

	it("should parse numeric values", () => {
		const mapping = { PORT: "port" };
		const result = mapEnvToOptions(mapping, { PORT: "3000" });
		expect(result).toEqual({ port: 3000 });
	});
});
