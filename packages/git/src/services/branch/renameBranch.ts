import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const renameBranch = (
	path: string,
	oldName: string,
	newName: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `branch -m ${oldName} ${newName}`).pipe(Effect.as(void 0));
