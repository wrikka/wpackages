import { Effect } from "effect";
import type { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const deleteBranch = (
	path: string,
	name: string,
	force?: boolean,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `branch ${force ? "-D" : "-d"} ${name}`).pipe(Effect.asVoid);
