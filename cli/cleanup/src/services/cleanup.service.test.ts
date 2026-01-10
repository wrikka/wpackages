import trash from "trash";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "./cleanup.service";

vi.mock("trash", () => ({
	default: vi.fn(),
}));

describe("cleanup service", () => {
	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should delete specified targets", async () => {
		const targets = ["/test/node_modules", "/test/dist"];
		(trash as vi.Mock).mockResolvedValue(undefined);

		const results = await cleanup(targets);

		expect(trash).toHaveBeenCalledTimes(2);
		expect(trash).toHaveBeenCalledWith("/test/node_modules");
		expect(trash).toHaveBeenCalledWith("/test/dist");
		expect(results).toEqual([
			{ status: "fulfilled", path: "/test/node_modules" },
			{ status: "fulfilled", path: "/test/dist" },
		]);
	});

	it("should handle cleanup failures", async () => {
		const targets = ["/test/dist"];
		const error = new Error("Permission denied");

		(trash as vi.Mock).mockRejectedValue(error);

		const results = await cleanup(targets);

		expect(trash).toHaveBeenCalledWith("/test/dist");
		expect(results).toEqual([
			{ status: "rejected", path: "/test/dist", reason: error },
		]);
	});
});
