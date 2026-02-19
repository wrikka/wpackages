#!/usr/bin/env bun

import { parseArgs } from 'util';
import type { CheckOptions } from './types/index.js';
import { checkCommand, updateCommand, recursiveCommand, inspectCommand } from './commands/index.js';

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    cwd: { type: 'string', short: 'C' },
    recursive: { type: 'boolean', short: 'r' },
    write: { type: 'boolean', short: 'w' },
    include: { type: 'string', short: 'n', multiple: true },
    exclude: { type: 'string', short: 'x', multiple: true },
    concurrency: { type: 'string' },
    failOnOutdated: { type: 'boolean' },
    includePeer: { type: 'boolean' },
    includeLocked: { type: 'boolean' },
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
Update Dependencies CLI - Better than taze using bun native API

Usage:
  update-deps [command] [options]

Commands:
  check       Check for outdated dependencies (default)
  update      Update outdated dependencies
  recursive   Check all packages recursively
  inspect     Inspect project information and dependencies

Options:
  -C, --cwd <path>              Specify the current working directory
  -r, --recursive               Recursively search for package.json
  -w, --write                   Write to package.json
  -n, --include <deps>          Only included dependencies will be checked
  -x, --exclude <deps>          Exclude dependencies to be checked
  --concurrency <num>           Number of concurrent requests (default: 10)
  --fail-on-outdated            Exit with code 1 if outdated dependencies found
  --include-peer                Include peerDependencies
  --include-locked              Include locked dependencies & devDependencies
  -h, --help                    Display this message
  -v, --version                 Display version number

Examples:
  update-deps check              Check for outdated dependencies
  update-deps update -w          Update and write to package.json
  update-deps recursive -r        Check all packages recursively
  update-deps inspect            Inspect project information
  update-deps check -C ./apps    Check dependencies in specific directory
  update-deps check -x typescript  Exclude specific package
  update-deps check --concurrency 20  Increase concurrency
`);
  process.exit(0);
}

if (values.version) {
  const packageJson = await import('../package.json', { with: { type: 'json' } });
  console.log(`update-deps v${packageJson.default.version}`);
  process.exit(0);
}

const command = positionals[0] || 'check';
const options: CheckOptions = {
  cwd: values.cwd,
  recursive: values.recursive,
  write: values.write,
  include: values.include,
  exclude: values.exclude,
  concurrency: values.concurrency ? parseInt(values.concurrency) : undefined,
  failOnOutdated: values.failOnOutdated,
  includePeer: values.includePeer,
  includeLocked: values.includeLocked,
};

try {
  switch (command) {
    case 'check':
      await checkCommand(options);
      break;
    case 'update':
      await updateCommand(options);
      break;
    case 'recursive':
      await recursiveCommand(options);
      break;
    case 'inspect':
      await inspectCommand(options);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "update-deps --help" for usage');
      process.exit(1);
  }
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}
