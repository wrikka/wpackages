import { Effect } from "effect";
import { GitCommandError } from "../../errors";
import { runGitCommand } from "../core/runGitCommand";

export const tag = (
	path: string,
	name: string,
	message?: string,
	hash?: string,
): Effect.Effect<void, GitCommandError> => {
	let cmd = `tag ${name}`;
	if (hash) {
		cmd += ` ${hash}`;
	}
	if (message) {
		const sanitizedMessage = message.replace(/'/g, "'\\''");
		cmd += ` -m '${sanitizedMessage}'`;
	}
	return runGitCommand(path, cmd).pipe(Effect.as(void 0));
};

export const deleteTag = (
	path: string,
	name: string,
): Effect.Effect<void, GitCommandError> =>
	runGitCommand(path, `tag -d ${name}`).pipe(Effect.as(void 0));

export const listTags = (
	path: string,
): Effect.Effect<readonly string[], GitCommandError> =>
	runGitCommand(path, "tag").pipe(
		Effect.map((output) => output.split("\n").filter((tag) => tag.length > 0)),
	);
