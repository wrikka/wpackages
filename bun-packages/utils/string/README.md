# @wpackages/string

A comprehensive string manipulation and validation library for TypeScript and Bun.

## Features

- 🚀 **Performance Optimized** - Built with Bun runtime in mind
- 🔒 **Type Safe** - Full TypeScript support with strict typing
- 🛡️ **Validation** - Built-in validation schemas and rules
- 🎨 **Formatting** - Advanced string formatting and transformation
- 🔧 **Configurable** - Flexible configuration system
- 📦 **Tree Shakable** - Import only what you need
- 🧪 **Well Tested** - Comprehensive test coverage

## Installation

```bash
bun add @wpackages/string
```

## Quick Start

```typescript
import { StringUtil, CaseUtil, ValidationUtil } from '@wpackages/string';

// Basic string operations
const trimmed = StringUtil.trim('  hello world  ', { trimAll: true });
const truncated = StringUtil.truncate('This is a very long string', 10);

// Case conversion
const camelCase = CaseUtil.toCamelCase('hello world');
const snakeCase = CaseUtil.toSnakeCase('HelloWorld');

// Validation
const isValidEmail = ValidationUtil.isEmail('user@example.com');
const result = ValidationUtil.validate('username', {
  required: true,
  minLength: 3,
  maxLength: 20
});
```

## API Documentation

### Core Utilities

#### StringUtil

Core string manipulation functions:

```typescript
import { StringUtil } from '@wpackages/string';

// Trimming
StringUtil.trim(input, { trimAll: true });
StringUtil.trim(input, { trimStart: true });
StringUtil.trim(input, { trimEnd: true });

// Padding
StringUtil.pad(input, { padStart: true, targetLength: 10 });
StringUtil.pad(input, { padEnd: true, targetLength: 10 });
StringUtil.pad(input, { padStart: true, padEnd: true, targetLength: 10 });

// Other utilities
StringUtil.truncate(input, maxLength, suffix);
StringUtil.reverse(input);
StringUtil.isEmpty(input);
StringUtil.length(input);
StringUtil.wordCount(input);
StringUtil.charCount(input);
StringUtil.extractNumbers(input);
StringUtil.extractLetters(input);
StringUtil.isASCII(input);
StringUtil.toFilename(input);
```

#### CaseUtil

String case conversion utilities:

```typescript
import { CaseUtil } from '@wpackages/string';

// Case conversion
CaseUtil.toCamelCase('hello world'); // 'helloWorld'
CaseUtil.toPascalCase('hello world'); // 'HelloWorld'
CaseUtil.toSnakeCase('hello world'); // 'hello_world'
CaseUtil.toKebabCase('hello world'); // 'hello-world'
CaseUtil.toUpperSnakeCase('hello world'); // 'HELLO_WORLD'

// Case detection
CaseUtil.isCamelCase('helloWorld');
CaseUtil.isPascalCase('HelloWorld');
CaseUtil.isSnakeCase('hello_world');
CaseUtil.isKebabCase('hello-world');
CaseUtil.detectCase('helloWorld'); // 'camelCase'

// Text manipulation
CaseUtil.capitalize('hello world'); // 'Hello World'
CaseUtil.splitByCase('helloWorld'); // ['hello', 'World']
```

#### FormatUtil

String formatting and cleanup utilities:

```typescript
import { FormatUtil } from '@wpackages/string';

// HTML and special characters
FormatUtil.stripHtml('<p>Hello <b>world</b></p>'); // 'Hello world'
FormatUtil.escapeHtml('<script>alert("xss")</script>'); // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
FormatUtil.unescapeHtml('&amp;lt;script&amp;gt;'); // '<script>'

// Content extraction
FormatUtil.extractUrls('Check https://example.com for more info');
FormatUtil.extractEmails('Contact user@example.com');
FormatUtil.extractPhoneNumbers('Call 555-123-4567');
FormatUtil.extractNumbers('Order #12345');

// Whitespace handling
FormatUtil.normalizeWhitespace('  Hello   world  \n  '); // 'Hello world'
FormatUtil.removeAllWhitespace('Hello world'); // 'Helloworld'
FormatUtil.stripEmoji('Hello 🌍 world'); // 'Hello  world'

// Unicode handling
FormatUtil.normalizeUnicode('café'); // 'cafe'
```

#### ValidationUtil

String validation utilities:

```typescript
import { ValidationUtil } from '@wpackages/string';

// Built-in validators
ValidationUtil.isEmail('user@example.com');
ValidationUtil.isUrl('https://example.com');
ValidationUtil.isPhone('555-123-4567');
ValidationUtil.isNumeric('12345');
ValidationUtil.isAlpha('hello');
ValidationUtil.isAlphanumeric('hello123');
ValidationUtil.isUUID('550e8400-e29b-41d4-a716-446655440000');
ValidationUtil.isJSON('{"key": "value"}');
ValidationUtil.isBase64('SGVsbG8gV29ybGQ=');

// Custom validation
const result = ValidationUtil.validate('input', {
  required: true,
  minLength: 5,
  maxLength: 50,
  pattern: /^[a-zA-Z0-9]+$/,
  rules: [
    {
      name: 'custom',
      validator: (value) => value.includes('required'),
      message: 'Must contain "required"'
    }
  ]
});

// String checks
ValidationUtil.isEmpty(input);
ValidationUtil.contains(input, 'substring');
ValidationUtil.startsWith(input, 'prefix');
ValidationUtil.endsWith(input, 'suffix');
ValidationUtil.isASCII(input);
```

#### TransformUtil

String transformation utilities:

```typescript
import { TransformUtil } from '@wpackages/string';

// Transformers
const prefix = TransformUtil.prefix('Hello ');
const suffix = TransformUtil.suffix(' World');
const wrap = TransformUtil.wrap('*');
const slug = TransformUtil.toSlug('-');
const mask = TransformUtil.toMask(4, '*');

// Pipeline transformations
const processor = TransformUtil.pipe(input, [
  prefix,
  slug,
  wrap
]);

// Comparators
const compare = TransformUtil.compare(); // case-sensitive
const compareIgnoreCase = TransformUtil.compare(false);
const compareByLength = TransformUtil.compareByLength();
const compareNumeric = TransformUtil.compareNumeric();

// Advanced transformations
TransformUtil.toSlug()(input);
TransformUtil.toInitials(3)(input);
TransformUtil.toAcronym()(input);
TransformUtil.toHash()(input);
TransformUtil.toMask(4)(input);
TransformUtil.toTitleCase()(input);
TransformUtil.toAlternatingCase()(input);
TransformUtil.toRandomCase()(input);
```

### High-Level Library

#### StringLib

High-level string processing functions:

```typescript
import { StringLib } from '@wpackages/string';

// Comprehensive processing
const processed = StringLib.process('  Hello World  ', {
  trim: true,
  normalize: true,
  case: 'camel',
  truncate: { length: 20 },
  mask: { visible: 4 }
});

// Create reusable processor
const processor = StringLib.createProcessor({
  trim: true,
  case: 'snake',
  normalize: true
});
const result1 = processor('Hello World');
const result2 = processor('Another Input');

// String similarity
const similarity = StringLib.similarity('hello', 'hallo'); // 0.8
const distance = StringLib.levenshteinDistance('hello', 'hallo'); // 1

// Find best match
const match = StringLib.findBestMatch('input', ['option1', 'option2', 'option3']);

// Generate variations
const variations = StringLib.generateVariations('Hello World');

// Extract information
const info = StringLib.extractInfo('Hello @user check https://example.com #tag');

// Sanitize string
const safe = StringLib.sanitize(input, {
  allowHtml: false,
  allowUrls: false,
  maxLength: 100
});
```

### Error Handling

#### StringError

Custom error class for string operations:

```typescript
import { StringError } from '@wpackages/string';

// Create custom errors
throw StringError.empty('username', '');
throw StringError.invalidLength({ min: 5, max: 20 }, 3, 'username');
throw StringError.invalidFormat('email', 'email', 'invalid-email');
throw StringError.invalidCharacters('!@#', 'username', 'user!@#');
throw StringError.validationFailed(['required', 'invalid-format'], 'field');

// Error properties
error.code; // StringErrorCode
error.field; // string | undefined
error.value; // string | undefined
error.timestamp; // Date
error.toJSON(); // Serialized error
```

#### ErrorHandler

Error handling utilities:

```typescript
import { ErrorHandler } from '@wpackages/string';

// Handle validation results
ErrorHandler.handleValidation(result, 'field');

// Wrap functions with error handling
const safeFunction = ErrorHandler.wrap(riskyFunction, {
  field: 'username',
  rethrow: false,
  onError: (error) => console.error(error)
});

// Safe function that returns result object
const safeFn = ErrorHandler.safe(riskyFunction);
const { success, result, error } = safeFn(input);

// Retry with exponential backoff
await ErrorHandler.retry(asyncFunction, {
  maxAttempts: 3,
  baseDelay: 1000,
  onRetry: (attempt, error) => console.log(`Retry ${attempt}`)
});

// Circuit breaker
const stableFunction = ErrorHandler.circuitBreaker(unstableFunction, {
  failureThreshold: 5,
  resetTimeout: 60000
});

// Rate limiting
const rateLimited = ErrorHandler.rateLimit(functionToLimit, {
  maxCalls: 10,
  windowMs: 1000
});
```

### Configuration

#### StringConfigManager

Configuration management for string operations:

```typescript
import { StringConfigManager } from '@wpackages/string';

// Get current config
const config = StringConfigManager.getConfig();

// Update config
StringConfigManager.updateConfig({
  maxLength: 500,
  truncateSuffix: '...',
  enableUnicodeNormalization: true
});

// Use presets
StringConfigManager.applyPreset('strict');
StringConfigManager.applyPreset('lenient');
StringConfigManager.applyPreset('url-friendly');
StringConfigManager.applyPreset('database-friendly');

// Create custom preset
StringConfigManager.createPreset('custom', {
  maxLength: 100,
  enableValidation: true,
  defaultCase: { kebabCase: true }
});
```

#### ValidationConfigManager

Validation configuration and schemas:

```typescript
import { ValidationConfigManager } from '@wpackages/string';

// Use predefined schemas
const emailSchema = ValidationConfigManager.getSchema('email');
const passwordSchema = ValidationConfigManager.getSchema('password');

// Register custom schema
ValidationConfigManager.registerSchema('customField', {
  required: true,
  minLength: 5,
  rules: [
    {
      name: 'custom',
      validator: (value) => value.includes('required'),
      message: 'Must contain "required"'
    }
  ]
});

// Create schema from preset
const customSchema = ValidationConfigManager.createSchemaFromPreset('email', {
  maxLength: 100
});

// Register custom validation rule
ValidationConfigManager.registerRule('customRule', (value) => {
  return value.startsWith('prefix');
});
```

## Configuration

### Environment Variables

```bash
# Enable/disable features
STRING_ENABLE_VALIDATION=true
STRING_ENABLE_ERROR_HANDLING=true
STRING_ENABLE_UNICODE_NORMALIZATION=true

# Default settings
STRING_MAX_LENGTH=1000
STRING_TRUNCATE_SUFFIX=...
STRING_PAD_STRING=_
```

### Configuration Files

```json
{
  "string": {
    "maxLength": 1000,
    "truncateSuffix": "...",
    "padString": " ",
    "enableUnicodeNormalization": true,
    "enableErrorHandling": true,
    "enableValidation": true
  }
}
```

## Examples

### Email Validation

```typescript
import { ValidationUtil, ValidationConfigManager } from '@wpackages/string';

// Use built-in schema
const emailSchema = ValidationConfigManager.getSchema('email');
const result = ValidationUtil.validate('user@example.com', emailSchema);

if (result.isValid) {
  console.log('Valid email:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

### String Processing Pipeline

```typescript
import { StringLib, TransformUtil } from '@wpackages/string';

// Create processing pipeline
const processor = TransformUtil.pipe(input, [
  TransformUtil.prefix('User: '),
  TransformUtil.toSlug('-'),
  TransformUtil.wrap('['),
  TransformUtil.suffix(']')
]);

// Or use StringLib.process
const processed = StringLib.process('Hello World User', {
  trim: true,
  normalize: true,
  case: 'kebab',
  truncate: { length: 20 }
});
```

### Safe String Operations

```typescript
import { ErrorHandler, StringUtil } from '@wpackages/string';

// Wrap operations with error handling
const safeTruncate = ErrorHandler.safe(
  (input: string) => StringUtil.truncate(input, 10),
  ''
);

const { success, result, error } = safeTruncate('very long string');
if (success) {
  console.log('Result:', result);
} else {
  console.error('Error:', error?.message);
}
```

## Performance

This library is optimized for performance:

- **Tree Shakable**: Import only what you need
- **Zero Dependencies**: No external runtime dependencies
- **Optimized Algorithms**: Efficient string operations
- **Memory Efficient**: Minimal memory footprint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [WPackages Team](https://github.com/wpackages)

## Related Packages

- [@wpackages/utils](https://github.com/wpackages/utils) - Monorepo containing all utility packages
- [@wpackages/number](https://github.com/wpackages/number) - Number manipulation utilities
- [@wpackages/date](https://github.com/wpackages/date) - Date manipulation utilities
