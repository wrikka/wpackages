/**
 * Basic usage examples for @wpackages/string
 */

import {
  StringUtil,
  CaseUtil,
  FormatUtil,
  ValidationUtil,
  TransformUtil,
  StringLib,
  StringError,
  StringConfigManager
} from '../src';

console.log('=== String Utility Examples ===\n');

// Basic string operations
console.log('1. Basic String Operations:');
const text = '  Hello World  ';
console.log(`Original: "${text}"`);
console.log(`Trimmed: "${StringUtil.trim(text, { trimAll: true })}"`);
console.log(`Truncated: "${StringUtil.truncate('This is a very long string', 10)}"`);
console.log(`Reversed: "${StringUtil.reverse('hello')}"`);
console.log(`Word count: ${StringUtil.wordCount('Hello world from TypeScript')}`);
console.log(`Is empty: ${StringUtil.isEmpty('   ')}`);
console.log(`Length: ${StringUtil.length('café')}`);
console.log();

// Case conversion
console.log('2. Case Conversion:');
const input = 'hello world example';
console.log(`Original: "${input}"`);
console.log(`Camel case: "${CaseUtil.toCamelCase(input)}"`);
console.log(`Pascal case: "${CaseUtil.toPascalCase(input)}"`);
console.log(`Snake case: "${CaseUtil.toSnakeCase(input)}"`);
console.log(`Kebab case: "${CaseUtil.toKebabCase(input)}"`);
console.log(`Upper snake case: "${CaseUtil.toUpperSnakeCase(input)}"`);
console.log(`Capitalized: "${CaseUtil.capitalize(input)}"`);
console.log();

// Case detection
console.log('3. Case Detection:');
const testStrings = ['helloWorld', 'HelloWorld', 'hello_world', 'hello-world'];
testStrings.forEach(str => {
  console.log(`"${str}" is ${CaseUtil.detectCase(str)}`);
});
console.log();

// String formatting
console.log('4. String Formatting:');
const htmlText = '<p>Hello <b>world</b>!</p>';
console.log(`Original: "${htmlText}"`);
console.log(`Strip HTML: "${FormatUtil.stripHtml(htmlText)}"`);
console.log(`Escape HTML: "${FormatUtil.escapeHtml(htmlText)}"`);
console.log(`Normalize whitespace: "${FormatUtil.normalizeWhitespace('  Hello   world  \n  test  ')}"`);
console.log(`To slug: "${TransformUtil.toSlug()(input)}"`);
console.log(`To initials: "${TransformUtil.toInitials()(input)}"`);
console.log(`To mask: "${TransformUtil.toMask(4)('creditcard1234567890')}"`);
console.log();

// Validation
console.log('5. Validation:');
const testEmail = 'user@example.com';
const testPhone = '555-123-4567';
const testUrl = 'https://example.com';

console.log(`"${testEmail}" is email: ${ValidationUtil.isEmail(testEmail)}`);
console.log(`"${testPhone}" is phone: ${ValidationUtil.isPhone(testPhone)}`);
console.log(`"${testUrl}" is URL: ${ValidationUtil.isUrl(testUrl)}`);
console.log(`"12345" is numeric: ${ValidationUtil.isNumeric('12345')}`);
console.log(`"hello" is alpha: ${ValidationUtil.isAlpha('hello')}`);
console.log(`"hello123" is alphanumeric: ${ValidationUtil.isAlphanumeric('hello123')}`);
console.log();

// Advanced validation with schema
console.log('6. Advanced Validation:');
const validationResult = ValidationUtil.validate('username123', {
  required: true,
  minLength: 5,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9]+$/,
  rules: [
    {
      name: 'containsNumber',
      validator: (value) => /\d/.test(value),
      message: 'Must contain at least one number'
    }
  ]
});

console.log('Validation result:', validationResult);
console.log();

// String processing pipeline
console.log('7. String Processing Pipeline:');
const processor = TransformUtil.pipe('  Hello World Example  ', [
  (str) => StringUtil.trim(str, { trimAll: true }),
  (str) => CaseUtil.toCamelCase(str),
  (str) => TransformUtil.prefix('User: ')(str),
  (str) => TransformUtil.wrap('[')(str)
]);
console.log(`Pipeline result: "${processor}"`);
console.log();

// High-level string library
console.log('8. High-Level String Library:');
const processed = StringLib.process('  Hello World Example  ', {
  trim: true,
  normalize: true,
  case: 'snake',
  truncate: { length: 20 }
});
console.log(`Processed: "${processed}"`);

// String similarity
const similarity = StringLib.similarity('hello', 'hallo');
console.log(`Similarity between 'hello' and 'hallo': ${similarity.toFixed(2)}`);

// Best match
const options = ['apple', 'banana', 'orange', 'grape'];
const match = StringLib.findBestMatch('aple', options);
console.log(`Best match for 'aple': ${match?.match} (score: ${match?.score.toFixed(2)})`);

// Generate variations
const variations = StringLib.generateVariations('Hello World');
console.log('Variations of "Hello World":', variations.slice(0, 5)); // Show first 5
console.log();

// Error handling
console.log('9. Error Handling:');
try {
  // This will throw an error
  ValidationUtil.validate('', { required: true });
} catch (error) {
  if (error instanceof StringError) {
    console.log(`StringError: ${error.message}`);
    console.log(`Code: ${error.code}`);
    console.log(`Timestamp: ${error.timestamp.toISOString()}`);
  }
}
console.log();

// Configuration
console.log('10. Configuration:');
console.log('Current config:', StringConfigManager.getConfig());

// Apply preset
StringConfigManager.applyPreset('strict');
console.log('After applying strict preset:', StringConfigManager.getConfig());

// Update specific config
StringConfigManager.set('maxLength', 500);
console.log('After updating maxLength:', StringConfigManager.get('maxLength'));
console.log();

// Extract information
console.log('11. Information Extraction:');
const complexText = 'Hello @user! Check https://example.com #awesome for more info. Contact me at user@example.com or call 555-123-4567.';
const info = StringLib.extractInfo(complexText);
console.log('Extracted info:', info);
console.log();

// Sanitization
console.log('12. String Sanitization:');
const unsafeText = '<script>alert("xss")</script> Hello World!';
const safe = StringLib.sanitize(unsafeText, {
  allowHtml: false,
  allowUrls: false,
  maxLength: 50
});
console.log(`Original: "${unsafeText}"`);
console.log(`Sanitized: "${safe}"`);
console.log();

console.log('=== Examples Complete ===');
