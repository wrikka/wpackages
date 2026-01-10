import { Effect } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitStatus } from "../../types/git";
import { parseGitStatus } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const getStatus = (
	path: string,
): Effect.Effect<GitStatus, GitCommandError | GitParseError> =>
	runGitCommand(path, "status --porcelain -b").pipe(
		Effect.flatMap((output) =>
			Effect.try({
				try: () => parseGitStatus(output),
				catch: (cause) => new GitParseError({ cause, input: output }),
			})
		),
	);
