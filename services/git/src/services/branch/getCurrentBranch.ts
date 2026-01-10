import { Effect, Option } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const getCurrentBranch = (
	path: string,
): Effect.Effect<Option.Option<string>, GitCommandError> =>
	runGitCommand(path, "rev-parse --abbrev-ref HEAD").pipe(
		Effect.map((branchName) => branchName === "HEAD" ? Option.none<string>() : Option.some(branchName)),
	);
