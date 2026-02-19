/**
 * Tests for wshell parser service
 */
import { describe, expect, test } from "vitest";
import { Effect } from "effect";
import { tokenize, parse, ParseError } from "./parser";

describe("parser service", () => {
  describe("tokenizer", () => {
    test("tokenizes simple command", async () => {
      const tokens = await Effect.runPromise(tokenize("echo hello"));

      expect(tokens).toHaveLength(4); // echo, hello, Eof
      expect(tokens[0]!.type).toBe("Word");
      expect(tokens[0]!.value).toBe("echo");
      expect(tokens[1]!.type).toBe("Word");
      expect(tokens[1]!.value).toBe("hello");
      expect(tokens[2]!.type).toBe("Eof");
    });

    test("tokenizes pipe", async () => {
      const tokens = await Effect.runPromise(tokenize("ls | grep foo"));

      const pipeToken = tokens.find(t => t.type === "Pipe");
      expect(pipeToken).toBeDefined();
      expect(pipeToken!.value).toBe("|");
    });

    test("tokenizes strings", async () => {
      const tokens = await Effect.runPromise(tokenize('echo "hello world"'));

      const stringToken = tokens.find(t => t.type === "String");
      expect(stringToken).toBeDefined();
      expect(stringToken!.value).toBe("hello world");
    });

    test("tokenizes numbers", async () => {
      const tokens = await Effect.runPromise(tokenize("count 42 3.14"));

      const numbers = tokens.filter(t => t.type === "Number");
      expect(numbers).toHaveLength(2);
      expect(numbers[0]!.value).toBe("42");
      expect(numbers[1]!.value).toBe("3.14");
    });

    test("tokenizes flags", async () => {
      const tokens = await Effect.runPromise(tokenize("ls -la --all"));

      const words = tokens.filter(t => t.type === "Word");
      expect(words.some(w => w.value === "-la")).toBe(true);
      expect(words.some(w => w.value === "--all")).toBe(true);
    });

    test("tokenizes && and ||", async () => {
      const andTokens = await Effect.runPromise(tokenize("cmd1 && cmd2"));
      expect(andTokens.some(t => t.type === "And")).toBe(true);

      const orTokens = await Effect.runPromise(tokenize("cmd1 || cmd2"));
      expect(orTokens.some(t => t.type === "Or")).toBe(true);
    });

    test("tokenizes redirections", async () => {
      const outTokens = await Effect.runPromise(tokenize("echo hello > file.txt"));
      expect(outTokens.some(t => t.type === "RedirectOut")).toBe(true);

      const appendTokens = await Effect.runPromise(tokenize("echo hello >> file.txt"));
      expect(appendTokens.some(t => t.type === "RedirectAppend")).toBe(true);

      const inTokens = await Effect.runPromise(tokenize("cmd < input.txt"));
      expect(inTokens.some(t => t.type === "RedirectIn")).toBe(true);
    });

    test("ignores comments", async () => {
      const tokens = await Effect.runPromise(tokenize("echo hello # this is a comment"));

      expect(tokens.every(t => t.value !== "#" && !t.value.includes("comment"))).toBe(true);
    });

    test("tokenizes semicolon", async () => {
      const tokens = await Effect.runPromise(tokenize("cmd1; cmd2"));
      expect(tokens.some(t => t.type === "Semicolon")).toBe(true);
    });
  });

  describe("parser", () => {
    test("parses simple command", async () => {
      const tokens = await Effect.runPromise(tokenize("echo hello"));
      const parsed = await Effect.runPromise(parse(tokens));

      expect(parsed.pipeline.commands).toHaveLength(1);
      expect(parsed.pipeline.commands[0]!.name).toBe("echo");
      expect(parsed.pipeline.commands[0]!.args).toHaveLength(1);
      expect(parsed.pipeline.commands[0]!.args[0]!._tag).toBe("Positional");
    });

    test("parses pipeline", async () => {
      const tokens = await Effect.runPromise(tokenize("ls | grep foo | wc -l"));
      const parsed = await Effect.runPromise(parse(tokens));

      expect(parsed.pipeline.commands).toHaveLength(3);
      expect(parsed.pipeline.operators).toEqual(["pipe", "pipe"]);
    });

    test("parses conditional operators", async () => {
      const andTokens = await Effect.runPromise(tokenize("cmd1 && cmd2"));
      const andParsed = await Effect.runPromise(parse(andTokens));
      expect(andParsed.pipeline.operators).toEqual(["and"]);

      const orTokens = await Effect.runPromise(tokenize("cmd1 || cmd2"));
      const orParsed = await Effect.runPromise(parse(orTokens));
      expect(orParsed.pipeline.operators).toEqual(["or"]);
    });

    test("parses flags", async () => {
      const tokens = await Effect.runPromise(tokenize("ls -la"));
      const parsed = await Effect.runPromise(parse(tokens));

      const flagArg = parsed.pipeline.commands[0]!.args.find(a => a._tag === "Flag");
      expect(flagArg).toBeDefined();
      expect((flagArg as { name: string }).name).toBe("la");
    });

    test("parses environment variables", async () => {
      const tokens = await Effect.runPromise(tokenize("FOO=bar echo hello"));
      const parsed = await Effect.runPromise(parse(tokens));

      expect(parsed.pipeline.commands[0]!.env.FOO).toBe("bar");
    });

    test("parses redirections", async () => {
      const tokens = await Effect.runPromise(tokenize("echo hello > output.txt"));
      const parsed = await Effect.runPromise(parse(tokens));

      expect(parsed.pipeline.commands[0]!.redirect?.stdout).toBe("output.txt");
      expect(parsed.pipeline.commands[0]!.redirect?.append).toBe(false);
    });

    test("parses append redirection", async () => {
      const tokens = await Effect.runPromise(tokenize("echo hello >> output.txt"));
      const parsed = await Effect.runPromise(parse(tokens));

      expect(parsed.pipeline.commands[0]!.redirect?.stdout).toBe("output.txt");
      expect(parsed.pipeline.commands[0]!.redirect?.append).toBe(true);
    });
  });
});
