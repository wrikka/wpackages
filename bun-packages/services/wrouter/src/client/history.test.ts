import { describe, expect, it } from "vitest";
import { MemoryHistory } from "../history";
import type { Location } from "../../types";

describe("MemoryHistory", () => {
	it("creates initial location", () => {
		const history = new MemoryHistory(["/"]);
		expect(history.location.pathname).toBe("/");
	});

	it("pushes new locations", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users"));
		expect(history.location.pathname).toBe("/users");
	});

	it("replaces current location", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users"));
		Effect.runSync(history.replace("/posts"));
		expect(history.location.pathname).toBe("/posts");
		expect(history.length).toBe(2);
	});

	it("parses query params", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users?foo=bar"));
		expect(history.location.search).toBe("?foo=bar");
	});

	it("parses hash", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users#section"));
		expect(history.location.hash).toBe("#section");
	});

	it("goes back", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users"));
		Effect.runSync(history.push("/posts"));
		Effect.runSync(history.back());
		expect(history.location.pathname).toBe("/users");
	});

	it("goes forward", () => {
		const history = new MemoryHistory(["/"]);
		Effect.runSync(history.push("/users"));
		Effect.runSync(history.push("/posts"));
		Effect.runSync(history.back());
		Effect.runSync(history.forward());
		expect(history.location.pathname).toBe("/posts");
	});

	it("notifies listeners", () => {
		const history = new MemoryHistory(["/"]);
		let notifiedLocation: Location | null = null;

		history.listen((location) => {
			notifiedLocation = location;
		});

		Effect.runSync(history.push("/users"));
		expect(notifiedLocation?.pathname).toBe("/users");
	});
});
