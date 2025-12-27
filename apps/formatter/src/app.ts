import * as p from '@clack/prompts';
import pc from 'picocolors';
import { format } from './services/formatter.service';

export const runFormatterApp = async () => {
  const args = process.argv.slice(2);
  const files = args.filter((arg) => !arg.startsWith('--'));
  const pathsToFormat = files.length === 0 ? ['.'] : files;

  p.intro(pc.cyan('✨ formatter'));

  const s = p.spinner();
  s.start(`Formatting ${pathsToFormat.join(' ')}...`);

  try {
    await format(pathsToFormat);
    s.stop('✅ Formatting complete.');
  } catch (error) {
    s.stop('❌ Formatting failed.');
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  p.outro(pc.green('All done! ✨'));
};
