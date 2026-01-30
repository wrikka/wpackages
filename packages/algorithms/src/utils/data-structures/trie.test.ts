import { describe, expect, it } from "vitest";
import { Trie } from "./trie";

describe("Trie", () => {
	it("should insert and search words", () => {
		const trie = new Trie();
		trie.insert("apple");
		trie.insert("app");
		expect(trie.search("apple")).toBe(true);
		expect(trie.search("app")).toBe(true);
		expect(trie.search("appl")).toBe(false);
	});

	it("should check prefixes", () => {
		const trie = new Trie();
		trie.insert("apple");
		expect(trie.startsWith("app")).toBe(true);
		expect(trie.startsWith("ban")).toBe(false);
	});

	it("should handle empty trie", () => {
		const trie = new Trie();
		expect(trie.search("test")).toBe(false);
		expect(trie.startsWith("test")).toBe(false);
	});
});
