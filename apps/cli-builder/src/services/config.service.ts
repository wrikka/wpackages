import { loadConfig } from '@wts/config-manager';
import { Effect } from 'effect';
import { Schema } from '@effect/schema';
import type { CliConfig } from '../types';
import { CommandSchema } from '../types/schema';
import { config as defaultConfig } from '../config/cli.config';

const CliConfigSchema = Schema.Struct({
  name: Schema.String,
  version: Schema.String,
  commands: Schema.Array(CommandSchema),
  before: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
  after: Schema.optional(Schema.Any as Schema.Schema<(args: Record<string, any>) => void | Promise<void>>),
});

export const loadCliConfig = (): Effect.Effect<CliConfig, Error> =>
  Effect.tryPromise({
    try: async () => {
      const { config: loadedConfig } = await loadConfig<CliConfig>({
        name: defaultConfig.name,
        defaults: defaultConfig,
      });
      return loadedConfig;
    },
    catch: (error: unknown) => new Error(`Failed to load configuration file: ${error}`),
  }).pipe(
    Effect.flatMap(mergedConfig =>
      Schema.decodeUnknown(CliConfigSchema)(mergedConfig).pipe(
        Effect.mapError(
          parseError => new Error(`Invalid configuration: ${JSON.stringify(parseError, null, 2)}`)
        )
      )
    )
  );
