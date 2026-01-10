import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "./runGitCommand";

export const init = (path: string): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, "init").pipe(Effect.as(void 0));
