import { ValidationSchema } from '../types/validation.type';
import { COMMON_VALIDATION_RULES } from '../constants/validation.constants';

/**
 * Default validation configurations
 */

export interface ValidationConfig {
  enableAutoValidation: boolean;
  throwOnValidationError: boolean;
  defaultRules: string[];
  customRules: Record<string, (value: string) => boolean>;
  schemas: Record<string, ValidationSchema>;
}

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  enableAutoValidation: true,
  throwOnValidationError: true,
  defaultRules: ['required'],
  customRules: {},
  schemas: {}
};

/**
 * Predefined validation schemas
 */

export const COMMON_SCHEMAS: Record<string, ValidationSchema> = {
  email: {
    rules: [COMMON_VALIDATION_RULES.EMAIL],
    required: true,
    maxLength: 254
  },
  username: {
    rules: [COMMON_VALIDATION_RULES.ALPHANUMERIC],
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    rules: [],
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  },
  phone: {
    rules: [COMMON_VALIDATION_RULES.PHONE],
    required: true,
    minLength: 10,
    maxLength: 15
  },
  url: {
    rules: [COMMON_VALIDATION_RULES.URL],
    required: false,
    maxLength: 2048
  },
  name: {
    rules: [COMMON_VALIDATION_RULES.ALPHA],
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/
  },
  zipcode: {
    rules: [COMMON_VALIDATION_RULES.ALPHANUMERIC],
    required: true,
    minLength: 5,
    maxLength: 10,
    pattern: /^[a-zA-Z0-9\s-]+$/
  },
  creditcard: {
    rules: [],
    required: true,
    minLength: 13,
    maxLength: 19,
    pattern: /^\d{13,19}$/
  },
  ssn: {
    rules: [COMMON_VALIDATION_RULES.NUMERIC],
    required: true,
    minLength: 9,
    maxLength: 11,
    pattern: /^\d{3}-?\d{2}-?\d{4}$/
  },
  hexcolor: {
    rules: [],
    required: false,
    minLength: 4,
    maxLength: 7,
    pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  ip: {
    rules: [],
    required: true,
    pattern: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  },
  ipv6: {
    rules: [],
    required: true,
    pattern: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  },
  uuid: {
    rules: [],
    required: true,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
  slug: {
    rules: [],
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-z0-9-]+$/
  },
  htmlid: {
    rules: [],
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z][\w:-]*$/
  },
  cssclass: {
    rules: [],
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z][\w-]*$/
  },
  json: {
    rules: [],
    required: false,
    validator: (value: string) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }
  },
  base64: {
    rules: [],
    required: false,
    pattern: /^[A-Za-z0-9+/]*={0,2}$/
  },
  latitude: {
    rules: [],
    required: true,
    pattern: /^-?90(?:\.\d+)?$|^ -?(?:[1-8]?\d(?:\.\d+)?|\d(?:\.\d+)?)$/
  },
  longitude: {
    rules: [],
    required: true,
    pattern: /^-?180(?:\.\d+)?$|^ -?(?:1[0-7]\d|\d{1,2})(?:\.\d+)?$/
  }
};

/**
 * Validation configuration manager
 */

export class ValidationConfigManager {
  private static config: ValidationConfig = { ...DEFAULT_VALIDATION_CONFIG };
  private static schemas: Record<string, ValidationSchema> = { ...COMMON_SCHEMAS };

  /**
   * Gets current validation configuration
   */
  static getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Updates validation configuration
   */
  static updateConfig(updates: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Resets validation configuration to defaults
   */
  static resetConfig(): void {
    this.config = { ...DEFAULT_VALIDATION_CONFIG };
  }

  /**
   * Gets validation schema by name
   */
  static getSchema(name: string): ValidationSchema | undefined {
    return this.config.schemas[name] || this.schemas[name];
  }

  /**
   * Registers a validation schema
   */
  static registerSchema(name: string, schema: ValidationSchema): void {
    this.config.schemas[name] = schema;
  }

  /**
   * Registers multiple validation schemas
   */
  static registerSchemas(schemas: Record<string, ValidationSchema>): void {
    Object.assign(this.config.schemas, schemas);
  }

  /**
   * Removes a validation schema
   */
  static removeSchema(name: string): void {
    delete this.config.schemas[name];
  }

  /**
   * Lists all available schemas
   */
  static listSchemas(): string[] {
    return [...Object.keys(this.schemas), ...Object.keys(this.config.schemas)];
  }

  /**
   * Registers a custom validation rule
   */
  static registerRule(name: string, validator: (value: string) => boolean): void {
    this.config.customRules[name] = validator;
  }

  /**
   * Gets a custom validation rule
   */
  static getRule(name: string): ((value: string) => boolean) | undefined {
    return this.config.customRules[name];
  }

  /**
   * Removes a custom validation rule
   */
  static removeRule(name: string): void {
    delete this.config.customRules[name];
  }

  /**
   * Lists all custom rules
   */
  static listRules(): string[] {
    return Object.keys(this.config.customRules);
  }

  /**
   * Creates a validation schema from preset
   */
  static createSchemaFromPreset(presetName: string, overrides: Partial<ValidationSchema> = {}): ValidationSchema {
    const preset = this.getSchema(presetName);
    if (!preset) {
      throw new Error(`Validation schema preset '${presetName}' not found`);
    }
    return { ...preset, ...overrides };
  }

  /**
   * Validates if a schema name exists
   */
  static hasSchema(name: string): boolean {
    return name in this.config.schemas || name in this.schemas;
  }

  /**
   * Gets all schemas (built-in and custom)
   */
  static getAllSchemas(): Record<string, ValidationSchema> {
    return { ...this.schemas, ...this.config.schemas };
  }
}
