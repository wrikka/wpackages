import { Effect } from 'effect';
import { createCli, loadCliConfig } from './services';

const program = loadCliConfig().pipe(
  Effect.flatMap(config => createCli(config))
);

Effect.runPromise(program);
