import type { CheckOptions } from '../types/index.js';
import { checkDependencies, updateDependencies, checkDependenciesRecursive } from '../app/dependency-service.js';
import { inspectProject } from '../app/inspect-service.js';
import { displayCheckResult, displayUpdateResult, displayRecursiveResult, displayError, displayInspectResult } from '../adapters/ui.js';

export async function checkCommand(options: CheckOptions): Promise<void> {
  try {
    const result = await checkDependencies(options);
    displayCheckResult(result);
  } catch (error) {
    displayError(error as Error);
  }
}

export async function updateCommand(options: CheckOptions): Promise<void> {
  try {
    const result = await checkDependencies(options);

    if (result.outdatedCount === 0) {
      displayCheckResult(result);
      return;
    }

    await updateDependencies(options);
    displayUpdateResult(result.outdatedCount);
  } catch (error) {
    displayError(error as Error);
  }
}

export async function recursiveCommand(options: CheckOptions): Promise<void> {
  try {
    const results = await checkDependenciesRecursive(options);
    displayRecursiveResult(results);
  } catch (error) {
    displayError(error as Error);
  }
}

export async function inspectCommand(options: CheckOptions): Promise<void> {
  try {
    const result = await inspectProject(options);
    displayInspectResult(result);
  } catch (error) {
    displayError(error as Error);
  }
}
