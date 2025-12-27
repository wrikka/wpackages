import { Octokit } from 'octokit';
import { envConfig } from '@/config/env.config';

if (!envConfig.githubToken) {
  throw new Error('GitHub token is not configured. Please add it to your .env file.');
}

const octokit = new Octokit({ auth: envConfig.githubToken });

async function getAuthenticatedUser() {
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}

export async function getRepoFiles(owner: string, repo: string): Promise<string[]> {
  try {
    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'main', // or the default branch
      recursive: '1',
    });
    return data.tree.filter(item => item.type === 'blob' && item.path).map(item => item.path as string);
  } catch (error) {
    console.error('Error fetching repo files:', error);
    return [];
  }
}

export async function commitAndPushFiles(
  owner: string,
  repo: string,
  files: { path: string; content: string }[],
  commitMessage: string
) {
  try {
    const user = await getAuthenticatedUser();
    const branch = 'main'; // Or get default branch dynamically

    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    const parentSha = refData.object.sha;

    const { data: parentCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: parentSha,
    });

    const tree = await Promise.all(
        files.map(async (file) => {
            const { data } = await octokit.rest.git.createBlob({
                owner,
                repo,
                content: file.content,
                encoding: 'utf-8',
            });
            return {
                path: file.path,
                mode: '100644' as const,
                type: 'blob' as const,
                sha: data.sha,
            };
        })
    );

    const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentCommit.tree.sha,
    });

    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: newTree.sha,
      parents: [parentSha],
      author: {
        name: user.name || 'GitHub Sync CLI',
        email: user.email || 'noreply@github.com',
      },
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    return newCommit.sha;
  } catch (error) {
    console.error('Error committing and pushing files:', error);
    throw error;
  }
}
