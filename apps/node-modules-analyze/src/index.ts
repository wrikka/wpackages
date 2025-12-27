import cac from 'cac';
import { resolve } from 'node:path';
import { startInteractiveSession } from './app/interactive';
import { analyzeProject } from './services/analyzer.service';

const cli = cac('node-modules-analyze');

cli
  .command('[path]', 'Analyze a node_modules directory')
  .option('--json', 'Output the result as JSON')
  .action(async (path = '.', options) => {
    const projectPath = resolve(process.cwd(), path);

    if (options.json) {
      const report = await analyzeProject(projectPath);
      console.log(JSON.stringify(report, null, 2));
    } else {
      await startInteractiveSession(projectPath);
    }
  });

cli.help();
cli.version('0.0.1');

(async () => {
  try {
    cli.parse();
  } catch (error) {
    // Handle potential errors from cac parsing, though it's rare for this setup
    console.error(`An unexpected error occurred: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
})();
