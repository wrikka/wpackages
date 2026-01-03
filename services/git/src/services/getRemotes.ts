import { Effect } from "effect";
import type { GitRemote } from "../types/git";
import { GitCommandError, GitParseError } from "../errors";
import { parseGitRemotes } from "../utils/parse.utils";
import { runGitCommand } from "./runGitCommand";

export const getRemotes = (
    path: string,
): Effect.Effect<readonly GitRemote[], GitCommandError | GitParseError> =>
    runGitCommand(path, "remote -v").pipe(
        Effect.flatMap((output) =>
            Effect.try({
                try: () => parseGitRemotes(output),
                catch: (cause) => new GitParseError({ cause, input: output }),
            }),
        ),
    );
