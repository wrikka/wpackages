import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { AppConfig } from '../types/config';
import { runCommand } from './command.service';

export const generateProject = async (config: AppConfig): Promise<string> => {
  const projectDir = path.resolve(process.cwd(), config.name);

  // 1. Scaffold a new Tauri project
  await runCommand(
    `npx @tauri-apps/cli init --app-name ${config.name} --window-title ${config.name} --dist-dir ../dist --dev-path ${config.url} --ci`,
    { cwd: process.cwd() }
  );

  // 2. Update tauri.conf.json
  const confPath = path.join(projectDir, 'src-tauri', 'tauri.conf.json');
  const confContent = await fs.readFile(confPath, 'utf-8');
  const conf = JSON.parse(confContent);

  conf.tauri.windows[0].width = config.width;
  conf.tauri.windows[0].height = config.height;
  conf.tauri.windows[0].resizable = config.resizable;
  conf.tauri.windows[0].titleBarStyle = config.hideMenuBar ? 'Overlay' : 'Visible';
  conf.tauri.identifier = config.identifier;

  await fs.writeFile(confPath, JSON.stringify(conf, null, 2));

  return projectDir;
};

export const buildProject = async (projectDir: string) => {
  await runCommand('bun install', { cwd: projectDir });
  await runCommand('bun run build', { cwd: projectDir });
};
