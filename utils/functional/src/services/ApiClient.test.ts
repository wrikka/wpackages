import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";
import { ApplicationError } from "../error";
import { ApiClientLive, ApiClientMock, type User } from "./ApiClient";

describe("ApiClient", () => {
	it("ApiClientMock should return provided users", async () => {
		const users: ReadonlyArray<User> = [
			{ id: 1, name: "A" },
			{ id: 2, name: "B" },
		];

		const client = await Effect.runPromise(Effect.scoped(Layer.build(ApiClientMock(users))));
		const result = await Effect.runPromise(client.getUsers);
		expect(result).toEqual(users);
	});

	it("ApiClientLive should fail if API_BASE_URL is missing", async () => {
		const prev = process.env.API_BASE_URL;
		delete process.env.API_BASE_URL;

		const client = await Effect.runPromise(Effect.scoped(Layer.build(ApiClientLive)));
		await expect(Effect.runPromise(client.getUsers)).rejects.toBeInstanceOf(ApplicationError);

		process.env.API_BASE_URL = prev;
	});

	it("ApiClientLive should fetch /users and decode basic fields", async () => {
		const prev = process.env.API_BASE_URL;
		process.env.API_BASE_URL = "https://example.test";

		const fetchMock = vi.fn(async () => new Response(JSON.stringify([{ id: 10, name: "Alice" }]), { status: 200 }));
		vi.stubGlobal("fetch", fetchMock);

		try {
			const client = await Effect.runPromise(Effect.scoped(Layer.build(ApiClientLive)));
			const users = await Effect.runPromise(client.getUsers);
			expect(fetchMock).toHaveBeenCalledWith("https://example.test/users");
			expect(users).toEqual([{ id: 10, name: "Alice" }]);
		} finally {
			vi.unstubAllGlobals();
			process.env.API_BASE_URL = prev;
		}
	});
});
