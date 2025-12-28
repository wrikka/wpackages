import { Effect } from 'effect';
import { createCli, loadCliConfig } from './services';

const configEffect = loadCliConfig();

Effect.runPromise(configEffect)
  .then(createCli)
  .catch(error => {
    // Errors from createCli are handled internally with process.exit,
    // so this catch is primarily for config loading errors.
    console.error('[App Error] Failed to load configuration:', error);
    process.exit(1);
  });
