import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AicommitConfig } from '../types/config';

const CONFIG_FILE = '.aicommitrc.json';
const CONFIG_PATH = join(homedir(), CONFIG_FILE);

export function getConfig(): AicommitConfig {
  if (!existsSync(CONFIG_PATH)) {
    // Create default config if it doesn't exist
    const { defaultConfig } = require('../types/config');
    writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  try {
    const configData = readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(configData) as AicommitConfig;
  } catch (error) {
    console.error('Error reading config file:', error);
    const { defaultConfig } = require('../types/config');
    return defaultConfig;
  }
}

export function setConfig(key: keyof AicommitConfig, value: any): void {
  const config = getConfig();
  (config as any)[key] = value;
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function updateConfig(updates: Partial<AicommitConfig>): void {
  const config = getConfig();
  const updatedConfig = { ...config, ...updates };
  writeFileSync(CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));
}
