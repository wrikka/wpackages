/**
 * Command parser - parses tokens into commands
 */
import { Effect } from "effect";
import type { Token, Command, Pipeline, ParsedCommand, CommandArg } from "../types/command.types";
import { ParseError } from "./parser.errors";

/** Parser state */
interface ParserState {
  tokens: Token[];
  position: number;
}

/** Create parser state */
function createParserState(tokens: Token[]): ParserState {
  return { tokens, position: 0 };
}

/** Peek at current or future token */
function peek(state: ParserState, offset = 0): Token {
  return state.tokens[state.position + offset] ?? state.tokens[state.tokens.length - 1]!;
}

/** Advance to next token */
function advance(state: ParserState): Token {
  return state.tokens[state.position++] ?? state.tokens[state.tokens.length - 1]!;
}

/** Expect a specific token type */
function expect(state: ParserState, type: string): Token {
  const token = advance(state);
  if (token.type !== type) {
    throw new ParseError(
      `Expected ${type} but got ${token.type}`,
      token.position,
      token.line,
      token.column
    );
  }
  return token;
}

/** Parse tokens into ParsedCommand */
export function parse(tokens: Token[]): Effect.Effect<ParsedCommand, ParseError> {
  return Effect.try({
    try: () => {
      const state = createParserState(tokens);
      const pipeline = parsePipeline(state);

      return {
        pipeline,
        raw: tokens.map((t) => t.value).join(""),
        tokens,
      };
    },
    catch: (error) => {
      if (error instanceof ParseError) {
        return error;
      }
      return new ParseError(String(error), 0, 1, 1);
    },
  });
}

/** Parse a pipeline of commands */
function parsePipeline(state: ParserState): Pipeline {
  const commands: Command[] = [];
  const operators: ("pipe" | "and" | "or")[] = [];

  commands.push(parseCommand(state));

  while (peek(state).type !== "Eof") {
    const op = peek(state);

    if (op.type === "Pipe") {
      advance(state);
      operators.push("pipe");
      commands.push(parseCommand(state));
    } else if (op.type === "And") {
      advance(state);
      operators.push("and");
      commands.push(parseCommand(state));
    } else if (op.type === "Or") {
      advance(state);
      operators.push("or");
      commands.push(parseCommand(state));
    } else if (op.type === "Semicolon") {
      advance(state);
      // Semicolon separates statements, not pipeline continuation
      break;
    } else {
      break;
    }
  }

  return { commands, operators };
}

/** Parse a single command */
function parseCommand(state: ParserState): Command {
  const name = expect(state, "Word").value;
  const args: CommandArg[] = [];
  const env: Record<string, string> = {};
  const redirectBuild: { stdout?: string; stdin?: string; append?: boolean } = {};

  while (
    peek(state).type !== "Eof" &&
    peek(state).type !== "Pipe" &&
    peek(state).type !== "And" &&
    peek(state).type !== "Or" &&
    peek(state).type !== "Semicolon"
  ) {
    const token = peek(state);

    // Environment variable assignment
    if (token.type === "Word" && peek(state, 1).type === "Equals") {
      const varName = advance(state).value;
      advance(state); // consume =
      const varValue =
        peek(state).type === "String" || peek(state).type === "Word"
          ? advance(state).value
          : "";
      env[varName] = varValue;
      continue;
    }

    // Flags (--flag or -f)
    if (token.type === "Word" && token.value.startsWith("-")) {
      advance(state);
      const flagName = token.value.replace(/^-+/, "");
      // Check if flag has value
      if (peek(state).type === "Word" || peek(state).type === "String") {
        const flagValue = advance(state).value;
        args.push({ _tag: "Flag", name: flagName, value: flagValue });
      } else {
        args.push({ _tag: "Flag", name: flagName });
      }
      continue;
    }

    // Redirections
    if (token.type === "RedirectOut" || token.type === "RedirectAppend") {
      advance(state);
      redirectBuild.append = token.type === "RedirectAppend";
      if (peek(state).type === "Word" || peek(state).type === "String") {
        redirectBuild.stdout = advance(state).value;
      }
      continue;
    }

    if (token.type === "RedirectIn") {
      advance(state);
      if (peek(state).type === "Word" || peek(state).type === "String") {
        redirectBuild.stdin = advance(state).value;
      }
      continue;
    }

    // Positional arguments
    if (token.type === "Word" || token.type === "String") {
      advance(state);
      args.push({ _tag: "Positional", value: token.value });
      continue;
    }

    // Numbers
    if (token.type === "Number") {
      advance(state);
      args.push({
        _tag: "Expression",
        value: token.value.includes(".")
          ? { _tag: "Float", value: Number.parseFloat(token.value) }
          : { _tag: "Int", value: BigInt(token.value) },
      });
      continue;
    }

    // Unknown token, skip
    advance(state);
  }

  // Only include redirect if any property is set
  const redirect = redirectBuild.stdout || redirectBuild.stdin ? redirectBuild as Command["redirect"] : undefined;

  return {
    name,
    args,
    env,
    redirect,
  };
}
