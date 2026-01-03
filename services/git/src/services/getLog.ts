import { Effect } from "effect";
import type { GitCommit } from "../types/git";
import { GitCommandError, GitParseError } from "../errors";
import { runGitCommand } from "./runGitCommand";
import { parseGitLog } from "../utils/parse.utils";

export const getLog = (
    path: string,
    limit = 100,
): Effect.Effect<readonly GitCommit[], GitCommandError | GitParseError> => {
    const logFormat = "%H|%h|%an|%ae|%at|%s";
    return runGitCommand(path, `log -n ${limit} --pretty=format:'${logFormat}'`).pipe(
        Effect.flatMap((output) =>
            Effect.try({
                try: () => parseGitLog(output),
                catch: (cause) => new GitParseError({ cause, input: output }),
            }),
        ),
    );
};
