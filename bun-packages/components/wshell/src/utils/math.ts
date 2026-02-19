/**
 * Math Expressions for wshell
 * Inline calculations
 */
import type { ShellValue } from "../types/value.types";
import { float, int, str } from "../types/value.types";

// Evaluate math expression
export function evaluateMath(expression: string): ShellValue {
  try {
    // Clean and validate expression
    const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, "");
    
    if (!cleanExpr) {
      return str("Error: Invalid expression");
    }

    // Use Function constructor for safe evaluation
    const result = new Function(`return (${cleanExpr})`)();
    
    if (typeof result !== "number" || isNaN(result)) {
      return str("Error: Invalid result");
    }

    // Return as Int or Float
    if (Number.isInteger(result)) {
      return { _tag: "Int", value: BigInt(result) } as const;
    }
    return { _tag: "Float", value: result } as const;
  } catch {
    return str("Error: Evaluation failed");
  }
}

// Math functions
export const mathFunctions = {
  abs: (x: number) => Math.abs(x),
  floor: (x: number) => Math.floor(x),
  ceil: (x: number) => Math.ceil(x),
  round: (x: number) => Math.round(x),
  sqrt: (x: number) => Math.sqrt(x),
  pow: (x: number, y: number) => Math.pow(x, y),
  min: (...args: number[]) => Math.min(...args),
  max: (...args: number[]) => Math.max(...args),
  random: () => Math.random(),
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  tan: (x: number) => Math.tan(x),
  log: (x: number) => Math.log(x),
  log10: (x: number) => Math.log10(x),
  exp: (x: number) => Math.exp(x),
  pi: () => Math.PI,
  e: () => Math.E,
};

// Evaluate with functions
export function evaluateMathAdvanced(expression: string): ShellValue {
  try {
    // Replace math function names with actual calls
    let processedExpr = expression;
    
    for (const [name, fn] of Object.entries(mathFunctions)) {
      if (name === "pi" || name === "e") {
        processedExpr = processedExpr.replace(
          new RegExp(`\\b${name}\\b`, "g"),
          String(fn())
        );
      } else {
        // Handle function calls like "abs(-5)"
        const regex = new RegExp(`\\b${name}\\s*\\(([^)]+)\\)`, "g");
        processedExpr = processedExpr.replace(regex, (match, args) => {
          const argValues = args.split(",").map((a: string) => parseFloat(a.trim()));
          const result = (fn as (...args: number[]) => number)(...argValues);
          return String(result);
        });
      }
    }
    
    return evaluateMath(processedExpr);
  } catch {
    return str("Error: Advanced evaluation failed");
  }
}
