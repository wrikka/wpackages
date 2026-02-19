import { describe, expect, it } from "vitest";

import { compile } from "../src/compile";
import { el, text } from "../src/types/ir";

describe("compile", () => {
	it("renders the same html string for react/vue/svelte (initial subset)", () => {
		const tree = el("div", { class: "container" }, [
			el("h1", {}, [text("Hello")]),
			el("p", {}, [text("Write once")]),
		]);

		const expected =
			'<div class="container"><h1>Hello</h1><p>Write once</p></div>';

		expect(compile("react", tree)).toBe(expected);
		expect(compile("vue", tree)).toBe(expected);
		expect(compile("svelte", tree)).toBe(expected);
	});
});
