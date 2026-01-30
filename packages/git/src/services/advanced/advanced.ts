import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const rebase = (
	path: string,
	branch: string,
	interactive?: boolean,
): Effect.Effect<void, GitCommandError> => {
	let cmd = `rebase ${branch}`;
	if (interactive) {
		cmd += " -i";
	}
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const cherryPick = (
	path: string,
	hash: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `cherry-pick ${hash}`).pipe(Effect.as(void 0));

export const revert = (
	path: string,
	hash: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `revert ${hash}`).pipe(Effect.as(void 0));
