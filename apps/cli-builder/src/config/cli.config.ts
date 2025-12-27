import type { CliConfig } from '../types';
import { Console } from 'effect';

export const config: CliConfig = {
  name: 'my-cli',
  version: '0.0.1',
  before: () => Console.log('Running Global Before Hook...'),
  after: () => Console.log('Running Global After Hook...'),
  commands: [
    {
      name: 'hello',
      description: 'Prints a greeting',
      options: [
        {
          name: '--name',
          shorthand: '-n',
          description: 'The name to greet',
          defaultValue: 'World',
        },
      ],
      action: args => {
        Console.log(`Hello, ${args.name}!`);
      },
      before: () => Console.log('Running Command-Specific Before Hook for hello...'),
      after: () => Console.log('Running Command-Specific After Hook for hello...'),
    },
    {
      name: 'git',
      description: 'A git-like command',
      subCommands: [
        {
          name: 'remote',
          description: 'Manage remotes',
          subCommands: [
            {
              name: 'add',
              description: 'Add a new remote',
              options: [
                { name: '--name', required: true },
                { name: '--url', required: true },
              ],
              action: args => {
                Console.log(`Adding remote ${args.name} with url ${args.url}`);
              },
            },
          ],
        },
      ],
    },
  ],
};
