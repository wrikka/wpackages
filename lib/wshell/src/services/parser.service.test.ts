import { Command } from "@wpackages/command";
import { describe, expect, it } from "bun:test";
import { Effect } from "effect";
import { ParserService, ParserServiceLive } from "./parser.service";

describe("ParserService", () => {
	const runPromise = <E, A>(effect: Effect.Effect<A, E, ParserService>) =>
		Effect.runPromise(effect.pipe(Effect.provide(ParserServiceLive)));

	it("should parse a simple command", async () => {
		const program = ParserService.pipe(
			Effect.flatMap((parser) => parser.parse("ls")),
		);
		const result = await runPromise(program);
		expect(result).toEqual(new Command({ name: "ls", args: [] }));
	});

	it("should parse a command with arguments", async () => {
		const program = ParserService.pipe(
			Effect.flatMap((parser) => parser.parse("echo hello world")),
		);
		const result = await runPromise(program);
		expect(result).toEqual(new Command({ name: "echo", args: ["hello", "world"] }));
	});

	it("should parse a command with quoted arguments", async () => {
		const program = ParserService.pipe(
			Effect.flatMap(parser => parser.parse("git commit -m \"feat: initial commit\"")),
		);
		const result = await runPromise(program);
		expect(result).toEqual(new Command({ name: "git", args: ["commit", "-m", "feat: initial commit"] }));
	});

	it("should return a ParseError for empty input", async () => {
		const program = ParserService.pipe(
			Effect.flatMap((parser) => parser.parse("")),
		);
		expect(runPromise(program)).rejects.toThrow();
	});
});
