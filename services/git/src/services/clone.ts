import { Effect } from "effect";
import { GitCommandError } from "../errors";
import { runGitCommand } from "./runGitCommand";

export const clone = (
    url: string,
    destination: string,
): Effect.Effect<void, GitCommandError> =>
    runGitCommand(destination, `clone ${url} .`).pipe(Effect.asVoid);
