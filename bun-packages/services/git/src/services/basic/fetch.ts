import { Effect } from "effect";
import type { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const fetch = (
	path: string,
	remote?: string,
	branch?: string,
): Effect.Effect<void, GitCommandError> => {
	const command = `fetch ${remote || ""} ${branch || ""}`.trim();
	return runGitCommand(path, command).pipe(Effect.asVoid);
};
