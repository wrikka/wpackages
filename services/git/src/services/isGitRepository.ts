import { stat } from "node:fs/promises";
import { join } from "node:path";
import { Effect } from "effect";

export const isGitRepository = (path: string): Effect.Effect<boolean, never> => {
    const gitDir = join(path, ".git");
    return Effect.tryPromise({
        try: () => stat(gitDir),
        catch: () => null,
    }).pipe(
        Effect.map((stats) => stats?.isDirectory() ?? false),
        Effect.orElseSucceed(() => false),
    );
};
