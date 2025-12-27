import { describe, expect, it, vi } from "vitest";
import { createResource } from "./resource.service";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe("createResource", () => {
	it("should fetch data and update loading state", async () => {
		const fetchData = async () => {
			await sleep(50);
			return "Hello, World!";
		};

		const [data, { loading, error }] = createResource(fetchData);

		expect(loading()).toBe(true);
		expect(data()).toBe(undefined);

		await vi.waitFor(() => {
			expect(loading()).toBe(false);
		});

		expect(data()).toBe("Hello, World!");
		expect(error()).toBe(undefined);
	});

	it("should handle errors during fetch", async () => {
		const fetchError = async () => {
			await sleep(50);
			throw new Error("Fetch failed");
		};

		const [data, { loading, error }] = createResource(fetchError);

		expect(loading()).toBe(true);

		await vi.waitFor(() => {
			expect(loading()).toBe(false);
		});

		expect(data()).toBe(undefined);
		expect(error()).toBeInstanceOf(Error);
		expect((error() as Error).message).toBe("Fetch failed");
	});

	it("should refetch data when refetch is called", async () => {
		let count = 0;
		const fetchData = async () => {
			await sleep(50);
			count++;
			return `Count: ${count}`;
		};

		const [data, { refetch }] = createResource(fetchData);

		await vi.waitFor(() => expect(data()).toBe("Count: 1"));
		expect(count).toBe(1);

		await refetch();

		await vi.waitFor(() => expect(data()).toBe("Count: 2"));
		expect(count).toBe(2);
	});
});
