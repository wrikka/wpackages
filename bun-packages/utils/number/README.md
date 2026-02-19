# @wpackages/number

Comprehensive number utilities for TypeScript projects.

## Installation

```bash
bun add @wpackages/number
```

## Features

- **Number Validation**: Validate numbers with range checking
- **Formatting**: Format numbers with custom decimal places and separators
- **Base Conversion**: Convert between different number systems (binary, octal, decimal, hexadecimal)
- **Mathematical Operations**: GCD, LCM, prime numbers, factorial
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { 
  isNumber, 
  formatNumber, 
  validateNumber, 
  convertBase,
  gcd, 
  lcm, 
  isPrime 
} from '@wpackages/number'

// Number validation
const isValid = isNumber(42) // true
const validation = validateNumber(25, { min: 1, max: 100 })

// Formatting
const formatted = formatNumber(1234.567, { 
  decimals: 2, 
  thousandsSeparator: ',' 
}) // "1,234.57"

// Base conversion
const hex = convertBase(255, { toBase: 16 }) // "FF"
const binary = convertBase('1010', { fromBase: 2, toBase: 10 }) // "10"

// Mathematical operations
const greatestCommonDivisor = gcd(48, 18) // 6
const leastCommonMultiple = lcm(12, 18) // 36
const primeCheck = isPrime(17) // true
```

## API

### Validation

- `isNumber(value: unknown): value is number`
- `isNumeric(value: unknown): value is Numeric`
- `validateNumber(value: unknown, options?: RangeOptions): ValidationResult`

### Formatting

- `formatNumber(value: number, options?: NumberFormatOptions): string`
- `clamp(value: number, min: number, max: number): number`

### Conversion

- `convertBase(value: Numeric, options?: ConversionOptions): string`
- `toNumber(value: string, defaultValue?: number): number`

### Mathematical Operations

- `gcd(a: number, b: number): number`
- `lcm(a: number, b: number): number`
- `isPrime(n: number): boolean`
- `getPrimeFactors(n: number): number[]`
- `factorial(n: number): number`

### Utilities

- `randomBetween(min: number, max: number): number`
- `percentage(value: number, total: number, decimals?: number): number`
- `round(value: number, options?: PrecisionOptions): number`

## License

MIT
