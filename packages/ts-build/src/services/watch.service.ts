import chokidar from 'chokidar';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { build } from './build.service';
import { generateDts } from './dts.service';
import { handleServiceResult } from '../utils/result.util';

export function watch() {
  p.log.info('Starting watch mode...');

  const watcher = chokidar.watch('src/**/*.ts', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });

  let isBuilding = false;

  const rebuild = async (path: string) => {
    if (isBuilding) return;
    isBuilding = true;

    p.log.info(`File changed: ${pc.yellow(path)}. Rebuilding...`);
    const s = p.spinner();
    s.start('Rebuilding project');

    const buildResult = await build({ watch: true });
    handleServiceResult(
      buildResult,
      async () => {
        s.message('Generating declaration files...');
        const dtsResult = await generateDts();
        handleServiceResult(
          dtsResult,
          () => s.stop('Rebuild completed successfully.'),
          (dtsError) => {
            s.stop('Declaration generation failed.', 1);
            p.note(dtsError, 'Error Details');
          }
        );
      },
      (error) => {
        s.stop('Rebuild failed.', 1);
        p.note(error, 'Error Details');
      }
    );
    isBuilding = false;
  };

  watcher
    .on('add', path => rebuild(path))
    .on('change', path => rebuild(path))
    .on('unlink', path => rebuild(path));
}
