import { writeFileSync } from "fs";
import { resolve } from "path";

/**
 * Testing utilities macro for generating test files at build time.
 *
 * @param options - Test generation options
 * @returns Generated test code
 * @throws Error if test generation fails
 *
 * @example
 * // const tests = generateTests({
 * //   coverage: 80,
 * //   frameworks: ["vitest"]
 * // })
 */
export const generateTests = Bun.macro((
	options: TestGenerationOptions = {},
) => {
	try {
		const coverage = options.coverage || 80;
		const frameworks = options.frameworks || ["vitest"];

		const testCode = `import { describe, it, expect } from "vitest";

describe("Generated Tests", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  // Add your tests here
  // Target coverage: ${coverage}%
});

// Test frameworks: ${frameworks.join(", ")}
`;

		if (options.writeToFile !== false) {
			const outputPath = resolve(import.meta.dir, "..", "test", "generated.test.ts");
			writeFileSync(outputPath, testCode, "utf-8");
		}

		return JSON.stringify(testCode);
	} catch (error) {
		throw new Error(
			"Failed to generate tests: " + (error instanceof Error ? error.message : String(error)),
		);
	}
});

/**
 * Test generation options.
 */
interface TestGenerationOptions {
	coverage?: number;
	frameworks?: Array<"vitest" | "jest" | "mocha">;
	writeToFile?: boolean;
}

/**
 * Generate test stub for a function.
 *
 * @param functionName - Function name to generate test for
 * @param options - Test stub options
 * @returns Test stub code
 *
 * @example
 * // const testStub = generateTestStub("myFunction")
 */
export const generateTestStub = Bun.macro((
	functionName: string,
	options: TestStubOptions = {},
) => {
	const testStub = `import { describe, it, expect } from "vitest";

describe("${functionName}", () => {
  it("should work correctly", () => {
    // Arrange
    const input = ${options.defaultValue || "undefined"};

    // Act
    const result = ${functionName}(input);

    // Assert
    expect(result).toBeDefined();
  });

  it("should handle edge cases", () => {
    // Add edge case tests here
  });
});
`;

	if (options.writeToFile !== false) {
		const outputPath = resolve(import.meta.dir, "..", "test", `${functionName}.test.ts`);
		writeFileSync(outputPath, testStub, "utf-8");
	}

	return JSON.stringify(testStub);
});

/**
 * Test stub options.
 */
interface TestStubOptions {
	defaultValue?: string;
	writeToFile?: boolean;
}
