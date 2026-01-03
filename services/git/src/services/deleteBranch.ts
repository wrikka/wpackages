import { Effect } from "effect";
import { runGitCommand } from "./runGitCommand";
import type { GitCommandError } from "../errors";

export const deleteBranch = (
    path: string,
    name: string,
    force?: boolean,
): Effect.Effect<void, GitCommandError> => 
    runGitCommand(path, `branch ${force ? '-D' : '-d'} ${name}`).pipe(Effect.asVoid);
