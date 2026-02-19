/**
 * Data Validation for wshell
 * Schema validation for structured data
 */
import type { ShellValue, TableValue, RecordValue } from "../types/value.types";
import { str, bool, list, record, int } from "../types/value.types";
import { isTable, isRecord, toString } from "../types/value.types";

// Schema types
export type SchemaType = 
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "array"
  | "object"
  | "any";

// Field schema
export interface FieldSchema {
  type: SchemaType;
  required?: boolean;
  default?: unknown;
  validate?: (value: unknown) => boolean;
}

// Table schema
export interface TableSchema {
  columns: Record<string, FieldSchema>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validate value against schema
export function validateValue(value: ShellValue, schema: FieldSchema): ValidationResult {
  const errors: string[] = [];

  // Check type
  const valueType = getValueType(value);
  if (schema.type !== "any" && valueType !== schema.type) {
    errors.push(`Expected ${schema.type}, got ${valueType}`);
  }

  // Run custom validation
  if (schema.validate && !schema.validate(value)) {
    errors.push("Custom validation failed");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Get type of ShellValue
function getValueType(value: ShellValue): string {
  switch (value._tag) {
    case "String": return "string";
    case "Int":
    case "Float": return "number";
    case "Bool": return "boolean";
    case "Date": return "date";
    case "List": return "array";
    case "Record":
    case "Table": return "object";
    default: return "any";
  }
}

// Validate table against schema
export function validateTable(table: TableValue, schema: TableSchema): ValidationResult {
  const errors: string[] = [];

  for (const [columnName, fieldSchema] of Object.entries(schema.columns)) {
    // Check if column exists
    if (!table.headers.includes(columnName)) {
      if (fieldSchema.required) {
        errors.push(`Required column '${columnName}' missing`);
      }
      continue;
    }

    // Validate each row
    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const value = row?.fields[columnName];
      
      if (!value) {
        if (fieldSchema.required) {
          errors.push(`Row ${i + 1}: Required field '${columnName}' is empty`);
        }
        continue;
      }

      const result = validateValue(value, fieldSchema);
      if (!result.valid) {
        errors.push(`Row ${i + 1}, Column '${columnName}': ${result.errors.join(", ")}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Export validation result as ShellValue
export function exportValidation(result: ValidationResult): ShellValue {
  return record({
    valid: { _tag: "Bool", value: result.valid } as const,
    errors: list(result.errors.map(e => str(e))),
    errorCount: { _tag: "Int", value: BigInt(result.errors.length) } as const,
  });
}

// Common schemas
export const commonSchemas = {
  user: {
    columns: {
      name: { type: "string", required: true },
      age: { type: "number", required: false },
      email: { type: "string", required: true },
    },
  } as TableSchema,
  
  file: {
    columns: {
      name: { type: "string", required: true },
      size: { type: "number", required: true },
      modified: { type: "date", required: true },
    },
  } as TableSchema,
};
