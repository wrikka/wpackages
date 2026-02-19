/**
 * Legacy git utilities - use GitService instead
 * @deprecated Use GitService from '../services/git.service'
 */

import { GitService } from '../services/git.service';

export const getStagedDiff = GitService.getStagedDiff;
export const getCurrentBranch = GitService.getCurrentBranch;
export const commitWithMessage = GitService.commitWithMessage;

export function runCommand(command: string): string {
  try {
    const { execSync } = require('child_process');
    return execSync(command, { stdio: 'pipe' }).toString().trim();
  } catch (error: any) {
    throw new Error(`Error executing command: ${command}\n${error.stderr?.toString() || error.message}`);
  }
}

export function getCommitHistory(limit: number = 100): string[] {
  try {
    const commits = runCommand(`git log -n ${limit} --pretty=format:"%s"`);
    return commits.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}
