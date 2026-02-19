import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ProjectInfo, PackageJson } from '../types/index.js';

export function analyzeProject(cwd: string): ProjectInfo {
  const packageJson = readPackageJson(cwd);
  
  return {
    name: packageJson.name || 'unknown',
    version: packageJson.version || '0.0.0',
    language: detectLanguage(cwd),
    moduleFormat: detectModuleFormat(packageJson),
    bundler: detectBundler(cwd, packageJson),
    packageManager: detectPackageManager(cwd),
    dependenciesCount: Object.keys(packageJson.dependencies || {}).length,
    devDependenciesCount: Object.keys(packageJson.devDependencies || {}).length,
    lastUpdated: getLastUpdated(cwd),
    hasTypeScript: hasTypeScript(cwd),
    hasTests: hasTestFiles(cwd),
    buildTools: detectBuildTools(packageJson),
    frameworks: detectFrameworks(packageJson),
  };
}

function readPackageJson(cwd: string): PackageJson {
  const packageJsonPath = join(cwd, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return {};
  }
  
  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function detectLanguage(cwd: string): 'typescript' | 'javascript' | 'mixed' {
  const hasTS = existsSync(join(cwd, 'tsconfig.json')) || 
                existsSync(join(cwd, 'tsconfig.app.json')) ||
                existsSync(join(cwd, 'tsconfig.node.json'));
  
  const hasJS = !hasTS || existsFiles(cwd, ['.js', '.mjs', '.cjs']);
  
  if (hasTS && hasJS) return 'mixed';
  if (hasTS) return 'typescript';
  return 'javascript';
}

function detectModuleFormat(packageJson: PackageJson): 'esm' | 'cjs' | 'mixed' {
  const hasESM = packageJson.type === 'module' || 
                 hasScriptType(packageJson, 'module');
  const hasCJS = packageJson.main?.endsWith('.cjs') || 
                hasScriptType(packageJson, 'commonjs');
  
  if (hasESM && hasCJS) return 'mixed';
  if (hasESM) return 'esm';
  return 'cjs';
}

function detectBundler(cwd: string, packageJson: PackageJson): ProjectInfo['bundler'] {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  if (deps.vite) return 'vite';
  if (deps.webpack) return 'webpack';
  if (deps.rollup) return 'rollup';
  if (deps.esbuild) return 'esbuild';
  if (deps['@babel/core'] || deps.babel) return 'webpack';
  
  if (existsSync(join(cwd, 'vite.config.js')) ||
      existsSync(join(cwd, 'vite.config.ts')) ||
      existsSync(join(cwd, 'vite.config.mjs'))) {
    return 'vite';
  }
  
  if (existsSync(join(cwd, 'webpack.config.js')) ||
      existsSync(join(cwd, 'webpack.config.ts'))) {
    return 'webpack';
  }
  
  if (existsSync(join(cwd, 'rollup.config.js')) ||
      existsSync(join(cwd, 'rollup.config.ts'))) {
    return 'rollup';
  }
  
  if (existsSync(join(cwd, 'esbuild.config.js')) ||
      existsSync(join(cwd, 'esbuild.js'))) {
    return 'esbuild';
  }
  
  if (existsSync(join(cwd, 'bun.lockb')) ||
      existsSync(join(cwd, 'bun.lock'))) {
    return 'bun';
  }
  
  if (Object.keys(deps).length === 0) return 'none';
  return 'unknown';
}

function detectPackageManager(cwd: string): ProjectInfo['packageManager'] {
  if (existsSync(join(cwd, 'bun.lockb')) || existsSync(join(cwd, 'bun.lock'))) {
    return 'bun';
  }
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  if (existsSync(join(cwd, 'package-lock.json'))) {
    return 'npm';
  }
  return 'unknown';
}

function getLastUpdated(cwd: string): string | undefined {
  try {
    const { statSync } = require('node:fs');
    const packageJsonPath = join(cwd, 'package.json');
    if (existsSync(packageJsonPath)) {
      const stats = statSync(packageJsonPath);
      return stats.mtime.toISOString();
    }
  } catch {
    return undefined;
  }
}

function hasTypeScript(cwd: string): boolean {
  return existsSync(join(cwd, 'tsconfig.json')) ||
         existsSync(join(cwd, 'tsconfig.app.json')) ||
         existsSync(join(cwd, 'tsconfig.node.json'));
}

function hasTestFiles(cwd: string): boolean {
  const testFiles = [
    'test', 'tests', '__tests__', 'spec', 'specs'
  ];
  
  const testExtensions = ['.test.js', '.test.ts', '.spec.js', '.spec.ts'];
  
  return testFiles.some(dir => existsSync(join(cwd, dir))) ||
         existsFiles(cwd, testExtensions);
}

function detectBuildTools(packageJson: PackageJson): string[] {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  const tools: string[] = [];
  
  if (deps.typescript) tools.push('typescript');
  if (deps.babel || deps['@babel/core']) tools.push('babel');
  if (deps.postcss) tools.push('postcss');
  if (deps.tailwindcss) tools.push('tailwind');
  if (deps.sass || deps['node-sass']) tools.push('sass');
  if (deps.less) tools.push('less');
  if (deps.stylus) tools.push('stylus');
  if (deps.eslint) tools.push('eslint');
  if (deps.prettier) tools.push('prettier');
  
  return tools;
}

function detectFrameworks(packageJson: PackageJson): string[] {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  
  const frameworks: string[] = [];
  
  if (deps.react || deps['@types/react']) frameworks.push('react');
  if (deps.vue) frameworks.push('vue');
  if (deps.angular || deps['@angular/core']) frameworks.push('angular');
  if (deps.svelte) frameworks.push('svelte');
  if (deps.solid) frameworks.push('solid');
  if (deps.next) frameworks.push('next.js');
  if (deps.nuxt) frameworks.push('nuxt');
  if (deps.express) frameworks.push('express');
  if (deps.fastify) frameworks.push('fastify');
  if (deps.koa) frameworks.push('koa');
  if (deps['@nestjs/core']) frameworks.push('nestjs');
  
  return frameworks;
}

function hasScriptType(packageJson: PackageJson, type: string): boolean {
  if (!packageJson.scripts) return false;
  
  return Object.values(packageJson.scripts).some(script => 
    typeof script === 'string' && script.includes(type)
  );
}

function existsFiles(cwd: string, extensions: string[]): boolean {
  try {
    const { readdirSync } = require('node:fs');
    const files = readdirSync(cwd);
    return files.some(file => 
      extensions.some(ext => file.endsWith(ext))
    );
  } catch {
    return false;
  }
}
