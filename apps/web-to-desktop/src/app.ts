import * as p from '@clack/prompts';
import pc from 'picocolors';
import { getAppConfigFromCli } from './components/prompts.component';
import { generateIdentifier, sanitizeName } from './utils/string.utils';
import { buildProject, generateProject } from './services/tauri.service';

export const runWebApp = async () => {
  p.intro(pc.cyan("✨ Welcome to web-to-desktop"));

  const options = await getAppConfigFromCli();

  const config = {
    ...options,
    name: sanitizeName(options.name),
    identifier: generateIdentifier(options.name),
  };

  const s = p.spinner();
  s.start("Generating project...");

  try {
    const projectDir = await generateProject(config);
    s.stop("Project generated!");
    p.log.info(`Project created at: ${projectDir}`);

    if (options.build) {
      s.start("Building project...");
      await buildProject(projectDir);
      s.stop("Project built!");
    }

    p.outro(pc.green("All done! ✨"));
  } catch (error) {
    s.stop("An error occurred.");
    p.log.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
