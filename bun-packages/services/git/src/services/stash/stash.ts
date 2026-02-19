import { Effect } from "effect";
import { GitCommandError, GitParseError } from "../../errors";
import type { GitStash } from "../../types/git";
import { parseGitStashes } from "../../utils/parse.utils";
import { runGitCommand } from "../core/runGitCommand";

export const stash = (
	path: string,
	message?: string,
	includeUntracked?: boolean,
): Effect.Effect<void, GitCommandError> => {
	let cmd = "stash";
	if (message) {
		const sanitizedMessage = message.replace(/'/g, "'\\''");
		cmd += ` push -m '${sanitizedMessage}'`;
	} else {
		cmd += " push";
	}
	if (includeUntracked) {
		cmd += " -u";
	}
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const stashList = (
	path: string,
): Effect.Effect<readonly GitStash[], GitCommandError | GitParseError> =>
	runGitCommand(path, "stash list").pipe(
		Effect.flatMap((output) =>
			Effect.try({
				try: () => parseGitStashes(output),
				catch: (cause) => new GitParseError({ cause, input: output }),
			})
		),
	);

export const stashPop = (
	path: string,
	index?: number,
): Effect.Effect<void, GitCommandError> => {
	const cmd = index !== undefined ? `stash pop stash@{${index}}` : "stash pop";
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const stashApply = (
	path: string,
	index?: number,
): Effect.Effect<void, GitCommandError> => {
	const cmd = index !== undefined ? `stash apply stash@{${index}}` : "stash apply";
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const stashDrop = (
	path: string,
	index?: number,
): Effect.Effect<void, GitCommandError> => {
	const cmd = index !== undefined ? `stash drop stash@{${index}}` : "stash drop";
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const stashClear = (path: string): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, "stash clear").pipe(Effect.as(void 0));
