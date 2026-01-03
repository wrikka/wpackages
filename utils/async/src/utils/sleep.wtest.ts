import { sleep } from "./sleep";

describe("sleep", () => {
	it("resolves", async () => {
		await expect(sleep(0)).toResolve();
	});

	it("rejects for negative ms", async () => {
		try {
			await sleep(-1);
			// This line should not be reached
			throw new Error("sleep(-1) should have rejected but it resolved.");
		} catch (error) {
			expect(error).toBeInstanceOf(RangeError);
		}
	});

	it("rejects on abort", async () => {
		const controller = new AbortController();
		const p = sleep(1000, { signal: controller.signal });
		const abortError = new Error("aborted");
		controller.abort(abortError);

		try {
			await p;
			// This line should not be reached
			throw new Error("sleep() with abort signal should have rejected.");
		} catch (error) {
			expect(error).toBe(abortError);
		}
	});
});
