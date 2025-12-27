import git from 'isomorphic-git';
import fs from 'node:fs';

// Mapping from isomorphic-git status to git status short format
function toShortStatus(row: (string | number)[]): { status: string; path: string } | null {
  const [filepath, head, workdir, stage] = row;
  const path = filepath as string;

  // Untracked
  if (head === 0 && workdir === 2 && stage === 0) return { status: '??', path };
  // Added
  if (head === 0 && workdir === 2 && stage === 2) return { status: 'A', path };
  // Modified
  if (head === 1 && workdir === 2 && stage === 1) return { status: 'M', path };
  // Deleted
  if (head === 1 && workdir === 0 && stage === 1) return { status: 'D', path };

  return null;
}

export default defineEventHandler(async () => {
  const dir = process.cwd();
  try {
    const branch = await git.currentBranch({ fs, dir });
    const matrix = await git.statusMatrix({ fs, dir });

    const files = matrix
      .map(toShortStatus)
      .filter((file): file is { status: string; path: string } => file !== null);

    return {
      branch: branch || 'HEAD',
      files,
    };
  } catch (error: unknown) {
     // If it's not a git repository, return a clean state.
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'NotFoundError') {
      return {
        branch: 'N/A',
        files: [],
      };
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get git status',
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
