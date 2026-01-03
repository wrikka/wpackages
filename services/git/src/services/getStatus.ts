import { Effect } from "effect";
import type { GitStatus } from "../types/git";
import { GitCommandError, GitParseError } from "../errors";
import { runGitCommand } from "./runGitCommand";
import { parseGitStatus } from "../utils/parse.utils";

export const getStatus = (
    path: string,
): Effect.Effect<GitStatus, GitCommandError | GitParseError> =>
    runGitCommand(path, "status --porcelain -b").pipe(
        Effect.flatMap((output) =>
            Effect.try({
                try: () => parseGitStatus(output),
                catch: (cause) => new GitParseError({ cause, input: output }),
            }),
        ),
    );
