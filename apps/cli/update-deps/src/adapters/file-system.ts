import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { PackageJson } from '../types/index.js';
import { ConfigError } from '../error.js';

export function readPackageJson(cwd: string = process.cwd()): PackageJson {
  const packagePath = join(cwd, 'package.json');
  
  try {
    const content = readFileSync(packagePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new ConfigError(`Failed to read package.json at ${packagePath}`);
  }
}

export function writePackageJson(packageJson: PackageJson, cwd: string = process.cwd()): void {
  const packagePath = join(cwd, 'package.json');
  
  try {
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  } catch (error) {
    throw new ConfigError(`Failed to write package.json at ${packagePath}`);
  }
}

export function findPackageJsons(cwd: string = process.cwd()): string[] {
  const packageJsons: string[] = [];
  
  function scan(dir: string) {
    try {
      const entries = readdirSync(dir);
      
      for (const entry of entries) {
        const path = join(dir, entry);
        const stat = statSync(path);
        
        if (stat.isDirectory()) {
          if (entry === 'node_modules' || entry.startsWith('.')) continue;
          scan(path);
        } else if (entry === 'package.json') {
          packageJsons.push(dir);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan directory: ${dir}`);
    }
  }
  
  scan(cwd);
  return packageJsons;
}
