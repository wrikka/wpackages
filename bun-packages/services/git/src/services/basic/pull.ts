import { Effect } from "effect";
import type { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const pull = (
	path: string,
	remote?: string,
	branch?: string,
	rebase?: boolean,
): Effect.Effect<void, GitCommandError> => {
	const command = `pull ${remote || ""} ${branch || ""} ${rebase ? "--rebase" : ""}`.trim();
	return runGitCommand(path, command).pipe(Effect.asVoid);
};
