import { Data } from "effect";

export class GitCommandError extends Data.TaggedError("GitCommandError")<{
    readonly cause: unknown;
}> {}

export class GitParseError extends Data.TaggedError("GitParseError")<{
    readonly cause: unknown;
    readonly input: string;
}> {}

export type GitError = GitCommandError | GitParseError;
