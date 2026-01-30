import { Effect } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitBranch } from "../../types/git";
import { parseGitBranches } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const getBranches = (
	path: string,
): Effect.Effect<readonly GitBranch[], GitCommandError | GitParseError> =>
	runGitCommand(path, "branch -v --no-abbrev").pipe(
		Effect.flatMap((output) =>
			Effect.try({
				try: () => parseGitBranches(output),
				catch: (cause) => new GitParseError({ cause, input: output }),
			})
		),
	);
