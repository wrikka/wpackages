/**
 * Tokenizer - converts input string into tokens
 */
import { Effect } from "effect";
import type { Token } from "../types/command.types";
import { ParseError } from "./parser.errors";

/** Tokenizer state */
interface TokenizerState {
  input: string;
  position: number;
  line: number;
  column: number;
}

/** Create initial tokenizer state */
function createState(input: string): TokenizerState {
  return { input, position: 0, line: 1, column: 1 };
}

/** Peek at character without advancing */
function peek(state: TokenizerState, offset = 0): string {
  return state.input[state.position + offset] ?? "\0";
}

/** Advance and return character */
function advance(state: TokenizerState): string {
  const char = state.input[state.position++];
  if (char === "\n") {
    state.line++;
    state.column = 1;
  } else {
    state.column++;
  }
  return char;
}

/** Check if at end of input */
function isAtEnd(state: TokenizerState): boolean {
  return state.position >= state.input.length;
}

/** Tokenize input string into tokens */
export function tokenize(input: string): Effect.Effect<Token[], ParseError> {
  return Effect.try({
    try: () => {
      const state = createState(input);
      const tokens: Token[] = [];

      while (!isAtEnd(state)) {
        const char = peek(state);
        const startPos = state.position;
        const startLine = state.line;
        const startCol = state.column;

        // Skip whitespace
        if (/\s/.test(char)) {
          advance(state);
          continue;
        }

        // Comments
        if (char === "#") {
          while (peek(state) !== "\n" && peek(state) !== "\0") {
            advance(state);
          }
          continue;
        }

        // Handle different token types
        const token = readToken(char, state, startPos, startLine, startCol);
        if (token) {
          tokens.push(token);
        }
      }

      // EOF token
      tokens.push({
        type: "Eof",
        value: "",
        position: input.length,
        line: state.line,
        column: state.column,
      });

      return tokens;
    },
    catch: (error) => new ParseError(String(error), 0, 1, 1),
  });
}

/** Read a single token from input */
function readToken(
  char: string,
  state: TokenizerState,
  startPos: number,
  startLine: number,
  startCol: number
): Token | null {
  // Strings (double quoted)
  if (char === '"') {
    return readString(state, startPos, startLine, startCol, '"');
  }

  // Strings (single quoted - raw)
  if (char === "'") {
    return readString(state, startPos, startLine, startCol, "'");
  }

  // Template strings (backtick)
  if (char === "`") {
    return readString(state, startPos, startLine, startCol, "`");
  }

  // Numbers
  if (/\d/.test(char) || (char === "-" && /\d/.test(peek(state, 1)))) {
    return readNumber(state, startPos, startLine, startCol);
  }

  // Operators and symbols
  const symbolToken = readSymbol(state, startPos, startLine, startCol);
  if (symbolToken) return symbolToken;

  // Words (commands, arguments)
  if (/[^\s|<>;(){}\[\],:=&$@#]/.test(char)) {
    return readWord(state, startPos, startLine, startCol);
  }

  // Unknown character - skip
  advance(state);
  return null;
}

/** Read a string token */
function readString(
  state: TokenizerState,
  startPos: number,
  startLine: number,
  startCol: number,
  quote: string
): Token {
  advance(state); // opening quote
  let value = "";

  while (peek(state) !== quote && peek(state) !== "\0") {
    if (quote === '"' && peek(state) === "\\") {
      advance(state);
      value += advance(state);
    } else {
      value += advance(state);
    }
  }

  if (peek(state) === quote) {
    advance(state); // closing quote
  }

  return {
    type: "String",
    value,
    position: startPos,
    line: startLine,
    column: startCol,
  };
}

/** Read a number token */
function readNumber(
  state: TokenizerState,
  startPos: number,
  startLine: number,
  startCol: number
): Token {
  let value = "";
  if (peek(state) === "-") {
    value += advance(state);
  }
  while (/[\d.]/.test(peek(state))) {
    value += advance(state);
  }

  return {
    type: "Number",
    value,
    position: startPos,
    line: startLine,
    column: startCol,
  };
}

/** Read a word token */
function readWord(
  state: TokenizerState,
  startPos: number,
  startLine: number,
  startCol: number
): Token {
  let value = "";
  while (/[^\s|<>;(){}\[\],:=&$@#]/.test(peek(state))) {
    value += advance(state);
  }

  return {
    type: "Word",
    value,
    position: startPos,
    line: startLine,
    column: startCol,
  };
}

/** Read symbol tokens (operators, delimiters) */
function readSymbol(
  state: TokenizerState,
  startPos: number,
  startLine: number,
  startCol: number
): Token | null {
  const char = peek(state);
  const twoChar = char + peek(state, 1);

  const symbols: Record<string, Token["type"]> = {
    "||": "Or",
    "&&": "And",
    ">>": "RedirectAppend",
  };

  const singleSymbols: Record<string, Token["type"]> = {
    "|": "Pipe",
    ">": "RedirectOut",
    "<": "RedirectIn",
    ";": "Semicolon",
    "(": "LParen",
    ")": "RParen",
    "{": "LBrace",
    "}": "RBrace",
    "[": "LBracket",
    "]": "RBracket",
    ",": "Comma",
    ":": "Colon",
    "=": "Equals",
    "$": "Dollar",
    "@": "At",
  };

  if (symbols[twoChar]) {
    advance(state);
    advance(state);
    return {
      type: symbols[twoChar],
      value: twoChar,
      position: startPos,
      line: startLine,
      column: startCol,
    };
  }

  if (singleSymbols[char]) {
    advance(state);
    return {
      type: singleSymbols[char],
      value: char,
      position: startPos,
      line: startLine,
      column: startCol,
    };
  }

  return null;
}
