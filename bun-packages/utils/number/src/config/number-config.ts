/**
 * Configuration management for number utilities
 */

import type { NumberFormatOptions, PrecisionOptions } from '../types'
import { DEFAULT_FORMATTING } from '../constants'

/**
 * Global configuration interface
 */
export interface NumberConfig {
  formatting: NumberFormatOptions
  precision: PrecisionOptions
  validation: {
    strictMode: boolean
    allowNaN: boolean
    allowInfinity: boolean
  }
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: NumberConfig = {
  formatting: DEFAULT_FORMATTING,
  precision: {
    decimalPlaces: 2,
    roundingMode: 'nearest',
  },
  validation: {
    strictMode: true,
    allowNaN: false,
    allowInfinity: false,
  },
}

/**
 * Configuration manager
 */
class ConfigManager {
  private config: NumberConfig = { ...DEFAULT_CONFIG }

  /**
   * Get current configuration
   */
  getConfig(): NumberConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<NumberConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      formatting: {
        ...this.config.formatting,
        ...updates.formatting,
      },
      precision: {
        ...this.config.precision,
        ...updates.precision,
      },
      validation: {
        ...this.config.validation,
        ...updates.validation,
      },
    }
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG }
  }

  /**
   * Get specific configuration section
   */
  getFormatting(): NumberFormatOptions {
    return { ...this.config.formatting }
  }

  getPrecision(): PrecisionOptions {
    return { ...this.config.precision }
  }

  getValidation() {
    return { ...this.config.validation }
  }
}

/**
 * Global configuration instance
 */
export const config = new ConfigManager()

/**
 * Configure number utilities globally
 */
export function configureNumberUtils(updates: Partial<NumberConfig>): void {
  config.updateConfig(updates)
}
