import { Effect } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCommand } from "./scaffold.service";

vi.spyOn(globalThis, "Bun", "get").mockReturnValue({ write: vi.fn() } as any);

describe("generateCommand", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should generate a command file with the correct content", async () => {
		const commandName = "my-test-command";
		vi.spyOn(global.Bun, "write").mockResolvedValue(0);

		await Effect.runPromise(generateCommand(commandName));

		const expectedFilePath = `src/commands/${commandName}.ts`;
		const writeCall = (global.Bun.write as any).mock.calls[0];

		expect(global.Bun.write).toHaveBeenCalledOnce();
		expect(writeCall[0]).toBe(expectedFilePath);
		expect(writeCall[1]).toContain(`export const ${commandName}: Command = {`);
		expect(writeCall[1]).toContain(`name: "${commandName}"`);
	});

	it("should throw an error if the command name is empty", async () => {
		const promise = Effect.runPromise(generateCommand("  "));
		await expect(promise).rejects.toThrow("Failed to generate command: Error: Command name cannot be empty.");
	});
});
