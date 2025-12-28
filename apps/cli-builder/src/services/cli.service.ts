import { parseArguments } from '../utils';
import type { CliConfig } from '../types';
import { generateHelp } from '../components';

export const createCli = async (config: CliConfig): Promise<void> => {
  console.log('[Debug] Loaded config with commands:', config.commands.map(c => c.name));

  if (process.argv.length <= 2) {
    console.log('Entering prompt mode (currently a no-op in this debug version).');
    return;
  }

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(generateHelp(config));
    return;
  }

  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(config.version);
    return;
  }

  try {
    const { command, args } = parseArguments(process.argv, config);
    console.log(`[Debug] Parsed command: ${command.name}`);

    if (command.action) {
      console.log(`[Debug] Action found for command: ${command.name}. Executing...`);
      console.log('[Debug] Action function source:', command.action.toString());
      command.action(args);
    } else {
      console.log(generateHelp({ ...config, commands: command.subCommands || [] }));
    }
  } catch (error) {
    console.error(`[Error] Caught in createCli:`, error);
    process.exit(1);
  }
};
