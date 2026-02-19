/**
 * Parser error types
 */

export class ParseError extends Error {
  constructor(
    message: string,
    public position: number,
    public line: number,
    public column: number
  ) {
    super(`${message} at line ${line}, column ${column}`);
    this.name = "ParseError";
  }
}
