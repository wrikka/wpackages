import type { LinterConfig } from './src/core/config-loader';
import { oxlintPlugin } from './src/plugins/oxlint';
import { astGrepPlugin } from './src/plugins/ast-grep';

const config: LinterConfig = {
  plugins: [
    oxlintPlugin,
    astGrepPlugin,
  ],
  astGrep: {
    rules: [
      {
        id: 'no-console-log',
        message: '`console.log` is not allowed.',
        severity: 'error',
        rule: {
          pattern: 'console.log($$$)',
          kind: 'pattern',
        },
      },
    ],
  },
};

export default config;
