import { execSync } from 'node:child_process';

export function runCommand(command: string): string {
  try {
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error: any) {
    throw new Error(`Error executing command: ${command}\n${error.stderr.toString()}`);
  }
}

export function getStagedDiff(): string {
  const diff = runCommand('git diff --staged');
  if (!diff) {
    throw new Error('No staged changes found. Stage your changes before running aicommit.');
  }
  return diff;
}

export function getCurrentBranch(): string {
  return runCommand('git rev-parse --abbrev-ref HEAD');
}

export function getCommitHistory(limit: number = 100): string[] {
  try {
    const commits = runCommand(`git log -n ${limit} --pretty=format:"%s"`);
    return commits.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

export function commitWithMessage(message: string): void {
  runCommand(`git commit -m "${message}"`);
}
