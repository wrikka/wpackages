import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const addRemote = (
	path: string,
	name: string,
	url: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `remote add ${name} ${url}`).pipe(Effect.as(void 0));

export const removeRemote = (
	path: string,
	name: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `remote remove ${name}`).pipe(Effect.as(void 0));

export const renameRemote = (
	path: string,
	oldName: string,
	newName: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `remote rename ${oldName} ${newName}`).pipe(Effect.as(void 0));
