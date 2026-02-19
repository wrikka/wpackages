import { Effect, Option } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitCommit } from "../../types/git";
import { parseSingleCommit } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const getCommitDetails = (
	path: string,
	hash: string,
): Effect.Effect<GitCommit, GitCommandError | GitParseError> => {
	const logFormat = "%H|%h|%an|%ae|%at|%s%n%b";
	return runGitCommand(path, `show --quiet --pretty=format:'${logFormat}' ${hash}`).pipe(
		Effect.flatMap((output) =>
			Option.fromNullable(parseSingleCommit(output)).pipe(
				Effect.mapError(() => new GitParseError({ cause: "Failed to parse commit details.", input: output })),
			)
		),
	);
};
