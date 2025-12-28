import { describe, it, expect, vi } from "vitest";
import { format } from "./formatter.service";
import { exec } from "node:child_process";

vi.mock("node:child_process", () => ({
	exec: vi.fn(),
}));

describe("formatter service", () => {
	it("should call dprint with the correct paths", async () => {
		vi.mocked(exec).mockImplementation((command, options, callback) => {
			const cb = (typeof options === "function" ? options : callback) as
				| ((error: Error | null, stdout: string, stderr: string) => void)
				| undefined;

			cb?.(null, "formatted", "");
			return {} as ReturnType<typeof exec>;
		});

		await format(["src", "test"]);

		expect(exec).toHaveBeenCalledWith(
			"npx dprint fmt src test",
			expect.any(Function),
		);
	});
});
