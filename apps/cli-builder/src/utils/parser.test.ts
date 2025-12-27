import { describe, expect, it } from 'vitest';
import type { CliConfig } from '../types';
import { parseArguments } from './parser';

const config: CliConfig = {
  name: 'test-cli',
  version: '1.0.0',
  commands: [
    {
      name: 'test-command',
      options: [
        { name: '--name', shorthand: '-n', required: true },
        { name: '--force', shorthand: '-f' },
        { name: '--default-val', defaultValue: 'default' },
      ],
      action: () => {},
    },
  ],
};

describe('parseArguments', () => {
  it('should parse long-form arguments', () => {
    const argv = ['node', 'script.ts', 'test-command', '--name', 'test-name', '--force'];
    const { command, args } = parseArguments(argv, config);
    expect(command.name).toBe('test-command');
    expect(args).toEqual({ name: 'test-name', force: true, 'default-val': 'default' });
  });

  it('should parse shorthand arguments', () => {
    const argv = ['node', 'script.ts', 'test-command', '-n', 'test-name', '-f'];
    const { command, args } = parseArguments(argv, config);
    expect(command.name).toBe('test-command');
    expect(args).toEqual({ name: 'test-name', force: true, 'default-val': 'default' });
  });

  it('should throw an error for missing required arguments', () => {
    const argv = ['node', 'script.ts', 'test-command'];
    expect(() => parseArguments(argv, config)).toThrow('Missing required option: --name');
  });

  it('should use default values', () => {
    const argv = ['node', 'script.ts', 'test-command', '--name', 'test'];
    const { args } = parseArguments(argv, config);
    expect(args['default-val']).toBe('default');
  });

  it('should throw an error for unknown commands', () => {
    const argv = ['node', 'script.ts', 'unknown-command'];
    expect(() => parseArguments(argv, config)).toThrow('Command not found: unknown-command');
  });
});
