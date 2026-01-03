import { Effect } from "effect";
import type { GitDiff } from "../types/git";
import { GitCommandError, GitParseError } from "../errors";
import { parseGitDiff } from "../utils/parse.utils";
import { runGitCommand } from "./runGitCommand";

export const getDiff = (
    path: string,
    file: string,
    staged: boolean,
): Effect.Effect<readonly GitDiff[], GitCommandError | GitParseError> => {
    const command = `diff ${staged ? '--staged' : ''} -- "${file}"`;
    return runGitCommand(path, command).pipe(
        Effect.flatMap((output) =>
            Effect.try({
                try: () => parseGitDiff(output),
                catch: (cause) => new GitParseError({ cause, input: output }),
            }),
        ),
    );
};
