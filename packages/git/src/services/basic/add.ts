import { Effect } from "effect";
import type { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const add = (
	path: string,
	files: readonly string[],
): Effect.Effect<void, GitCommandError> => runGitCommand(path, `add ${files.join(" ")}`).pipe(Effect.asVoid);
