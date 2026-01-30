import { Effect } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitReflogEntry } from "../../types/git";
import { parseGitReflog } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const getReflog = (
	path: string,
	limit = 100,
): Effect.Effect<readonly GitReflogEntry[], GitCommandError | GitParseError> =>
	runGitCommand(path, `reflog -n ${limit}`).pipe(
		Effect.flatMap((output) =>
			Effect.try({
				try: () => parseGitReflog(output),
				catch: (cause) => new GitParseError({ cause, input: output }),
			})
		),
	);
