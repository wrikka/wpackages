import { Effect } from "effect";
import type { GitReflogEntry } from "../types/git";
import { GitCommandError, GitParseError } from "../errors";
import { parseGitReflog } from "../utils/parse.utils";
import { runGitCommand } from "./runGitCommand";

export const getReflog = (
    path: string,
    limit = 100,
): Effect.Effect<readonly GitReflogEntry[], GitCommandError | GitParseError> =>
    runGitCommand(path, `reflog -n ${limit}`).pipe(
        Effect.flatMap((output) =>
            Effect.try({
                try: () => parseGitReflog(output),
                catch: (cause) => new GitParseError({ cause, input: output }),
            }),
        ),
    );
