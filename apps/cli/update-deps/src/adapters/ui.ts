import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import type { DependencyInfo, UpdateResult } from '../types/index.js';

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `~${days}d`;
  if (hours > 0) return `~${hours}h`;
  if (minutes > 0) return `~${minutes}m`;
  return `~${seconds}s`;
}

export function formatTimeDiff(days: number): string {
  if (days < 30) return `~${Math.floor(days)}d`;
  if (days < 365) return `~${Math.floor(days / 30)}mo`;
  return `~${Math.floor(days / 365)}y`;
}

export function createDependencyTable(dependencies: DependencyInfo[]): string {
  if (dependencies.length === 0) return '';
  
  const table = new Table({
    head: [
      chalk.cyan('Package'),
      chalk.cyan('Current'),
      chalk.cyan('Latest'),
      chalk.cyan('Time'),
      chalk.cyan('Type'),
    ],
    colWidths: [30, 15, 15, 10, 15],
  });
  
  for (const dep of dependencies) {
    const timeDiff = dep.timeDiff ? formatTimeDiff(dep.timeDiff) : '-';
    const breaking = dep.breaking ? chalk.red('⚠️ ') : '';
    const packageName = breaking + chalk.green(dep.name);
    
    table.push([
      packageName,
      chalk.yellow(dep.currentVersion),
      chalk.green(dep.latestVersion),
      chalk.gray(timeDiff),
      chalk.blue(dep.type),
    ]);
  }
  
  return table.toString();
}

export function displayCheckResult(result: UpdateResult, packageName?: string): void {
  const spinner = ora('Checking dependencies...').start();
  
  setTimeout(() => {
    spinner.stop();
    
    if (result.outdatedCount === 0) {
      console.log(chalk.green('✅ All dependencies are up to date!'));
      return;
    }
    
    if (packageName) {
      console.log(chalk.bold.cyan(`${packageName} - ${result.outdatedCount} outdated`));
    }
    
    console.log();
    
    const grouped = result.dependencies.reduce((acc, dep) => {
      if (!dep.outdated) return acc;
      if (!acc[dep.type]) acc[dep.type] = [];
      acc[dep.type].push(dep);
      return acc;
    }, {} as Record<string, DependencyInfo[]>);
    
    for (const [type, deps] of Object.entries(grouped)) {
      if (deps.length === 0) continue;
      
      console.log(chalk.bold.blue(type));
      console.log(createDependencyTable(deps));
      console.log();
    }
    
    if (result.hasBreakingChanges) {
      console.log(chalk.yellow('⚠️  Some updates have breaking changes!'));
    }
    
    console.log(chalk.gray(`dependencies are already up-to-date in ${result.totalCount} packages`));
  }, 500);
}

export function displayUpdateResult(updatedCount: number): void {
  const spinner = ora('Updating dependencies...').start();
  
  spinner.stop();
  console.log(chalk.green(`✓ Updated ${updatedCount} dependencies`));
  console.log(chalk.gray('ℹ changes written to package.json'));
  console.log(chalk.gray('installing...'));
}

export function displayRecursiveResult(results: Map<string, UpdateResult>): void {
  const spinner = ora('Checking all packages...').start();
  
  spinner.stop();
  
  let totalOutdated = 0;
  
  for (const [dir, result] of results.entries()) {
    if (result.outdatedCount === 0) continue;
    
    const packageName = dir.split('\\').pop() || dir.split('/').pop() || dir;
    console.log(chalk.bold.cyan(`${packageName} - ${result.outdatedCount} outdated`));
    
    const outdatedDeps = result.dependencies.filter((dep) => dep.outdated);
    console.log(createDependencyTable(outdatedDeps));
    console.log();
    
    totalOutdated += result.outdatedCount;
  }
  
  if (totalOutdated === 0) {
    console.log(chalk.green('✅ All dependencies are up to date!'));
    return;
  }
  
  console.log(chalk.gray(`dependencies are already up-to-date in ${results.size} packages`));
}

export function displayError(error: Error): void {
  console.error(chalk.red('✗ Error:'), error.message);
}

export function displayInfo(message: string): void {
  console.log(chalk.gray(`ℹ ${message}`));
}

export function displaySuccess(message: string): void {
  console.log(chalk.green(`✓ ${message}`));
}

export function displayWarning(message: string): void {
  console.log(chalk.yellow(`⚠ ${message}`));
}
