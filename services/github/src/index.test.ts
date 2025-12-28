import { describe, expect, test, vi } from "vitest";
import { Effect } from "@wts/functional";
import { GitHubLive, getRepo, makeGitHub } from "./index";

describe("@wts/github", () => {
	test("makeGitHub should call fetch and return json on success", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const svc = makeGitHub({ baseUrl: "https://example.test" });
		const result = await Effect.runPromiseEither(svc.getRepo("a", "b"));
		expect(result._tag).toBe("Right");
		if (result._tag !== "Right") throw new Error("Expected Right");
		expect(result.right).toEqual({ ok: true });

		vi.unstubAllGlobals();
	});

	test("GitHubLive should wire the service through Effect context", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ name: "repo" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const program = getRepo("o", "r");
		const result = await Effect.runPromiseEither(Effect.provideLayer(program, GitHubLive));
		expect(result._tag).toBe("Right");
		if (result._tag !== "Right") throw new Error("Expected Right");
		expect(result.right).toEqual({ name: "repo" });

		vi.unstubAllGlobals();
	});
});
