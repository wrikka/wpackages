import { describe, expect, it, mock } from "bun:test";
import { Action } from "../src/types/history";
import { createMemoryHistory } from "../src/services/memory";

describe("createMemoryHistory", () => {
	it("should initialize with a default entry", () => {
		const history = createMemoryHistory();
		expect(history.location.pathname).toBe("/");
	});

	it("should initialize with provided entries", () => {
		const history = createMemoryHistory(["/home", "/about"]);
		expect(history.location.pathname).toBe("/about");
	});

	it("should push a new entry", () => {
		const history = createMemoryHistory();
		history.push("/new");
		expect(history.location.pathname).toBe("/new");
	});

	it("should replace the current entry", () => {
		const history = createMemoryHistory(["/home"]);
		history.replace("/new");
		expect(history.location.pathname).toBe("/new");
	});

	it("should go back and forward", () => {
		const history = createMemoryHistory(["/one", "/two", "/three"]);
		history.back();
		expect(history.location.pathname).toBe("/two");
		history.forward();
		expect(history.location.pathname).toBe("/three");
	});

	it("should notify listeners on change", () => {
		const history = createMemoryHistory();
		const listener = mock(() => {});
		history.listen(listener);
		history.push("/new");
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/new" }), Action.Push);
	});
});
