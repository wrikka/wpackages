import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const getConfig = (
	path: string,
	key: string,
): Effect.Effect<string, GitCommandError> =>
	runGitCommand(path, `config --get ${key}`);

export const setConfig = (
	path: string,
	key: string,
	value: string,
	global?: boolean,
): Effect.Effect<void, GitCommandError> => {
	const cmd = global ? `config --global ${key} "${value}"` : `config ${key} "${value}"`;
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};
