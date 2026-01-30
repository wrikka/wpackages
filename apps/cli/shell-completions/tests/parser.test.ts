import { describe, expect, it, vi } from "vitest";
import * as dynamicGenerators from "../src/dynamic-generators";
import { parse } from "../src/parser";
import type { CompletionSpec } from "../src/schema";

// Mock the dynamic generators
vi.mock("../src/dynamic-generators", () => ({
	generateSuggestions: vi.fn(),
}));

const gitSpec: CompletionSpec = {
	name: "git",
	subcommands: [
		{
			name: "add",
			description: "Add file contents to the index",
			args: [{ name: "path", generators: { template: "filepaths" } }],
		},
		{ name: "commit", description: "Record changes to the repository" },
	],
};

describe("parser", () => {
	it("should suggest subcommands for the root command", async () => {
		const suggestions = await parse("git ", gitSpec);
		expect(suggestions.map((s) => s.name)).toEqual(["add", "commit"]);
	});

	it("should filter subcommands based on the word to complete", async () => {
		const suggestions = await parse("git a", gitSpec);
		expect(suggestions.map((s) => s.name)).toEqual(["add"]);
	});

	it("should invoke dynamic generator for subcommand arguments", async () => {
		const mockedSuggestions = [{ name: "file.txt" }];
		vi.spyOn(dynamicGenerators, "generateSuggestions").mockResolvedValue(mockedSuggestions);

		const suggestions = await parse("git add ", gitSpec);
		expect(dynamicGenerators.generateSuggestions).toHaveBeenCalledWith(
			{ template: "filepaths" },
			"",
		);
		expect(suggestions).toEqual(mockedSuggestions);
	});

	it("should filter dynamic suggestions", async () => {
		const mockedSuggestions = [{ name: "file.txt" }];
		vi.spyOn(dynamicGenerators, "generateSuggestions").mockResolvedValue(mockedSuggestions);

		const suggestions = await parse("git add f", gitSpec);
		expect(dynamicGenerators.generateSuggestions).toHaveBeenCalledWith(
			{ template: "filepaths" },
			"f",
		);
		expect(suggestions).toEqual(mockedSuggestions);
	});
});
