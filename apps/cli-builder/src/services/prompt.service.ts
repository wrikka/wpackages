import * as p from '@clack/prompts';
import { Effect } from 'effect';
import type { Command, Option } from '../types';

const askForOption = (option: Option) => {
  return p.text({
    message: option.description || `Enter value for ${option.name}`,
    placeholder: String(option.defaultValue || ''),
    defaultValue: String(option.defaultValue || ''),
    validate: (input: string) => {
      if (option.required && !input) {
        return 'This field is required';
      }
    },
  });
};

export const runPromptMode = (commands: Command[]) =>
  Effect.tryPromise(async () => {
    p.intro('Welcome to the CLI!');

    const selectedCommandName = await p.select({
      message: 'Which command would you like to run?',
      options: commands.map(c => ({ value: c.name, label: c.name, hint: c.description })),
    });

    if (p.isCancel(selectedCommandName)) {
      p.cancel('Operation cancelled.');
      return;
    }

    const command = commands.find(c => c.name === selectedCommandName);
    if (!command) {
      throw new Error('Command not found');
    }

    const args: Record<string, any> = {};
    if (command.options && command.options.length > 0) {
        const group = await p.group(
            command.options.reduce((acc, opt) => {
                const key = opt.name.replace(/^--/, '');
                acc[key] = () => askForOption(opt);
                return acc;
            }, {} as Record<string, () => Promise<string | symbol>>),
            {
                onCancel: () => {
                    p.cancel('Operation cancelled.');
                    process.exit(0);
                },
            }
        );
        Object.assign(args, group);
    }

    p.outro('Running command...');
    command.action(args);
  });
