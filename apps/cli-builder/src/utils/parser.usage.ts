import type { CliConfig } from '../types';
import { parseArguments } from './parser';

// This is an example of how to use the parseArguments function.

const config: CliConfig = {
  name: 'test-cli',
  version: '1.0.0',
  commands: [
    {
      name: 'test-command',
      options: [{ name: '--name', required: true }],
      action: () => {},
    },
  ],
};

const argv = ['node', 'script.ts', 'test-command', '--name', 'example'];

const { command, args } = parseArguments(argv, config);

console.log('Command:', command.name);
console.log('Arguments:', args);
