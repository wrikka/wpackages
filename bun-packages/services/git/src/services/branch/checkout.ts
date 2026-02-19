import { Effect } from "effect";
import type { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const checkout = (
	path: string,
	branch: string,
	create?: boolean,
): Effect.Effect<void, GitCommandError> => {
	const command = `checkout ${create ? "-b" : ""} ${branch}`.trim();
	return runGitCommand(path, command).pipe(Effect.asVoid);
};
