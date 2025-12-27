import { Command } from 'commander';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { build } from './services/build.service';
import { handleServiceResult } from './utils/result.util';

const program = new Command();

program
  .name('ts-build')
  .description('A modern, fast, and feature-rich TypeScript build tool.')
  .version('0.0.1');

program
  .command('build')
  .description('Build the project.')
  .option('-w, --watch', 'Watch for file changes')
  .action(async (options) => {
    p.intro(`${pc.bgCyan(pc.black(' ts-build '))}`);

    const s = p.spinner();
    s.start('Building project...');

    const buildResult = await build(options);

    handleServiceResult(
      buildResult,
      async () => {
        s.message('Generating declaration files...');
        const dtsResult = await generateDts(options.outDir);
        handleServiceResult(
          dtsResult,
          () => {
            s.stop('Build completed successfully.');
            if (options.watch) {
              watch();
            } else {
              p.outro('Thank you for using ts-build!');
            }
          },
          (dtsError) => {
            s.stop('Declaration generation failed.', 1);
            p.note(dtsError, 'Error Details');
          }
        );
      },
      (error) => {
        s.stop('Build failed.', 1);
        p.note(error, 'Error Details');
      }
    );
  });

export async function run(args: string[]) {
  try {
    await program.parseAsync(args);
  } catch (error) {
    p.cancel('An unexpected error occurred.');
    console.error(error);
    process.exit(1);
  }
}
