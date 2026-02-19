/**
 * Configuration service for managing aicommit settings
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { AicommitConfig } from '../types/config';
import { ConfigError } from '../error';
import { createDefaultConfig, validateConfig } from '../config';
import { CONFIG_FILE } from '../constants';

const CONFIG_PATH = join(homedir(), CONFIG_FILE);

export class ConfigService {
  static getConfig(): AicommitConfig {
    if (!existsSync(CONFIG_PATH)) {
      const defaultConfig = createDefaultConfig();
      this.saveConfig(defaultConfig);
      return defaultConfig;
    }

    try {
      const configData = readFileSync(CONFIG_PATH, 'utf-8');
      const config = JSON.parse(configData) as AicommitConfig;
      
      const errors = validateConfig(config);
      if (errors.length > 0) {
        throw new ConfigError(`Invalid configuration: ${errors.join(', ')}`);
      }

      return config;
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError('Error reading config file', error);
    }
  }

  static saveConfig(config: AicommitConfig): void {
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new ConfigError(`Invalid configuration: ${errors.join(', ')}`);
    }

    try {
      writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new ConfigError('Error saving config file', error);
    }
  }

  static updateConfig(updates: Partial<AicommitConfig>): AicommitConfig {
    const config = this.getConfig();
    const updatedConfig = { ...config, ...updates };
    this.saveConfig(updatedConfig);
    return updatedConfig;
  }

  static setConfig<K extends keyof AicommitConfig>(key: K, value: AicommitConfig[K]): AicommitConfig {
    return this.updateConfig({ [key]: value });
  }

  static resetConfig(): AicommitConfig {
    const defaultConfig = createDefaultConfig();
    this.saveConfig(defaultConfig);
    return defaultConfig;
  }
}
