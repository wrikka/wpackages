import { loadConfig } from 'c12';
import { Effect } from 'effect';
import type { CliConfig } from '../types';
import { config as defaultConfig } from '../config/cli.config';

export const loadCliConfig = () =>
  Effect.tryPromise({
    try: async () => {
      const { config: userConfig } = await loadConfig<Partial<CliConfig>>({
        name: defaultConfig.name,
      });

      if (!userConfig) {
        return defaultConfig;
      }

      // Deep merge commands, and shallow merge the rest
      return {
        ...defaultConfig,
        ...userConfig,
        commands: [
          ...defaultConfig.commands,
          ...(userConfig.commands || []),
        ],
      };
    },
    catch: (error: unknown) => new Error(`Failed to load configuration: ${error}`),
  });
