import { StringCaseOptions, StringFormatOptions } from '../types/string.type';

/**
 * Default configuration for string operations
 */

export interface StringConfig {
  defaultCase: StringCaseOptions;
  defaultFormat: StringFormatOptions;
  maxLength: number;
  truncateSuffix: string;
  padString: string;
  enableUnicodeNormalization: boolean;
  enableErrorHandling: boolean;
  enableValidation: boolean;
}

export const DEFAULT_STRING_CONFIG: StringConfig = {
  defaultCase: {
    lowercase: false,
    uppercase: false,
    capitalize: false,
    camelCase: false,
    pascalCase: false,
    snakeCase: false,
    kebabCase: false
  },
  defaultFormat: {
    removeWhitespace: false,
    removeSpecialChars: false,
    normalizeUnicode: false
  },
  maxLength: 1000,
  truncateSuffix: '...',
  padString: ' ',
  enableUnicodeNormalization: true,
  enableErrorHandling: true,
  enableValidation: true
};

/**
 * Configuration manager for string operations
 */

export class StringConfigManager {
  private static config: StringConfig = { ...DEFAULT_STRING_CONFIG };

  /**
   * Gets current configuration
   */
  static getConfig(): StringConfig {
    return { ...this.config };
  }

  /**
   * Updates configuration
   */
  static updateConfig(updates: Partial<StringConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Resets configuration to defaults
   */
  static resetConfig(): void {
    this.config = { ...DEFAULT_STRING_CONFIG };
  }

  /**
   * Gets specific configuration value
   */
  static get<K extends keyof StringConfig>(key: K): StringConfig[K] {
    return this.config[key];
  }

  /**
   * Sets specific configuration value
   */
  static set<K extends keyof StringConfig>(key: K, value: StringConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Creates configuration preset
   */
  static createPreset(name: string, config: Partial<StringConfig>): void {
    // Store presets for later use (could be extended to use external storage)
    (StringConfigManager as any).presets = (StringConfigManager as any).presets || {};
    (StringConfigManager as any).presets[name] = config;
  }

  /**
   * Applies configuration preset
   */
  static applyPreset(name: string): void {
    const presets = (StringConfigManager as any).presets || {};
    if (presets[name]) {
      this.updateConfig(presets[name]);
    } else {
      throw new Error(`Preset '${name}' not found`);
    }
  }

  /**
   * Lists available presets
   */
  static listPresets(): string[] {
    const presets = (StringConfigManager as any).presets || {};
    return Object.keys(presets);
  }
}

// Initialize common presets
StringConfigManager.createPreset('strict', {
  enableValidation: true,
  enableErrorHandling: true,
  maxLength: 100,
  defaultFormat: {
    normalizeUnicode: true
  }
});

StringConfigManager.createPreset('lenient', {
  enableValidation: false,
  enableErrorHandling: false,
  maxLength: 10000
});

StringConfigManager.createPreset('url-friendly', {
  defaultCase: {
    kebabCase: true
  },
  defaultFormat: {
    removeSpecialChars: true,
    normalizeUnicode: true
  }
});

StringConfigManager.createPreset('database-friendly', {
  defaultCase: {
    snakeCase: true
  },
  defaultFormat: {
    removeSpecialChars: true
  }
});
