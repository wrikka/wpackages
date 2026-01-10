import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const merge = (
	path: string,
	branch: string,
	noFastForward?: boolean,
): Effect.Effect<void, GitCommandError> => {
	const cmd = noFastForward ? `merge --no-ff ${branch}` : `merge ${branch}`;
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};
