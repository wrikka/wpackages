import { Effect } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitBlameLine } from "../../types/git";
import { parseGitBlame } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const getBlame = (
	path: string,
	file: string,
): Effect.Effect<readonly GitBlameLine[], GitCommandError | GitParseError> =>
	runGitCommand(path, `blame -p -- "${file}"`).pipe(
		Effect.flatMap((output) =>
			Effect.try({
				try: () => parseGitBlame(output),
				catch: (cause) => new GitParseError({ cause, input: output }),
			})
		),
	);
