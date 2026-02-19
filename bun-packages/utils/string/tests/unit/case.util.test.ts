import { describe, it, expect } from 'bun:test';
import { CaseUtil } from '../../src/utils/case.util';

describe('CaseUtil', () => {
  describe('convert', () => {
    it('should convert to uppercase', () => {
      expect(CaseUtil.convert('hello world', { uppercase: true })).toBe('HELLO WORLD');
    });

    it('should convert to lowercase', () => {
      expect(CaseUtil.convert('HELLO WORLD', { lowercase: true })).toBe('hello world');
    });

    it('should capitalize', () => {
      expect(CaseUtil.convert('hello world', { capitalize: true })).toBe('Hello World');
    });

    it('should convert to camelCase', () => {
      expect(CaseUtil.convert('hello world', { camelCase: true })).toBe('helloWorld');
    });

    it('should convert to PascalCase', () => {
      expect(CaseUtil.convert('hello world', { pascalCase: true })).toBe('HelloWorld');
    });

    it('should convert to snake_case', () => {
      expect(CaseUtil.convert('hello world', { snakeCase: true })).toBe('hello_world');
    });

    it('should convert to kebab-case', () => {
      expect(CaseUtil.convert('hello world', { kebabCase: true })).toBe('hello-world');
    });

    it('should handle multiple conversions', () => {
      expect(CaseUtil.convert('Hello World', { lowercase: true, snakeCase: true })).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.convert('', { uppercase: true })).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of each word', () => {
      expect(CaseUtil.capitalize('hello world')).toBe('Hello World');
      expect(CaseUtil.capitalize('hello world test')).toBe('Hello World Test');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.capitalize('')).toBe('');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(CaseUtil.toCamelCase('hello world')).toBe('helloWorld');
      expect(CaseUtil.toCamelCase('Hello World')).toBe('helloWorld');
      expect(CaseUtil.toCamelCase('hello-world')).toBe('helloWorld');
      expect(CaseUtil.toCamelCase('hello_world')).toBe('helloWorld');
      expect(CaseUtil.toCamelCase('HelloWorld')).toBe('helloWorld');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.toCamelCase('')).toBe('');
    });
  });

  describe('toPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(CaseUtil.toPascalCase('hello world')).toBe('HelloWorld');
      expect(CaseUtil.toPascalCase('Hello World')).toBe('HelloWorld');
      expect(CaseUtil.toPascalCase('hello-world')).toBe('HelloWorld');
      expect(CaseUtil.toPascalCase('hello_world')).toBe('HelloWorld');
      expect(CaseUtil.toPascalCase('helloWorld')).toBe('HelloWorld');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.toPascalCase('')).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert to snake_case', () => {
      expect(CaseUtil.toSnakeCase('hello world')).toBe('hello_world');
      expect(CaseUtil.toSnakeCase('Hello World')).toBe('hello_world');
      expect(CaseUtil.toSnakeCase('hello-world')).toBe('hello_world');
      expect(CaseUtil.toSnakeCase('helloWorld')).toBe('hello_world');
      expect(CaseUtil.toSnakeCase('HelloWorld')).toBe('hello_world');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.toSnakeCase('')).toBe('');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(CaseUtil.toKebabCase('hello world')).toBe('hello-world');
      expect(CaseUtil.toKebabCase('Hello World')).toBe('hello-world');
      expect(CaseUtil.toKebabCase('hello_world')).toBe('hello-world');
      expect(CaseUtil.toKebabCase('helloWorld')).toBe('hello-world');
      expect(CaseUtil.toKebabCase('HelloWorld')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.toKebabCase('')).toBe('');
    });
  });

  describe('toUpperSnakeCase', () => {
    it('should convert to UPPER_SNAKE_CASE', () => {
      expect(CaseUtil.toUpperSnakeCase('hello world')).toBe('HELLO_WORLD');
      expect(CaseUtil.toUpperSnakeCase('Hello World')).toBe('HELLO_WORLD');
      expect(CaseUtil.toUpperSnakeCase('hello-world')).toBe('HELLO_WORLD');
      expect(CaseUtil.toUpperSnakeCase('helloWorld')).toBe('HELLO_WORLD');
    });

    it('should handle empty string', () => {
      expect(CaseUtil.toUpperSnakeCase('')).toBe('');
    });
  });

  describe('detectCase', () => {
    it('should detect camelCase', () => {
      expect(CaseUtil.detectCase('helloWorld')).toBe('CAMEL_CASE');
      expect(CaseUtil.detectCase('hello')).toBe('CAMEL_CASE');
    });

    it('should detect PascalCase', () => {
      expect(CaseUtil.detectCase('HelloWorld')).toBe('PASCAL_CASE');
      expect(CaseUtil.detectCase('Hello')).toBe('PASCAL_CASE');
    });

    it('should detect snake_case', () => {
      expect(CaseUtil.detectCase('hello_world')).toBe('SNAKE_CASE');
      expect(CaseUtil.detectCase('hello')).toBe('SNAKE_CASE');
    });

    it('should detect kebab-case', () => {
      expect(CaseUtil.detectCase('hello-world')).toBe('KEBAB_CASE');
      expect(CaseUtil.detectCase('hello')).toBe('KEBAB_CASE');
    });

    it('should detect UPPER_SNAKE_CASE', () => {
      expect(CaseUtil.detectCase('HELLO_WORLD')).toBe('UPPER_SNAKE_CASE');
    });

    it('should return unknown for invalid cases', () => {
      expect(CaseUtil.detectCase('hello-world_test')).toBe('unknown');
      expect(CaseUtil.detectCase('Hello-World')).toBe('unknown');
    });
  });

  describe('case checkers', () => {
    it('should check camelCase', () => {
      expect(CaseUtil.isCamelCase('helloWorld')).toBe(true);
      expect(CaseUtil.isCamelCase('HelloWorld')).toBe(false);
      expect(CaseUtil.isCamelCase('hello_world')).toBe(false);
    });

    it('should check PascalCase', () => {
      expect(CaseUtil.isPascalCase('HelloWorld')).toBe(true);
      expect(CaseUtil.isPascalCase('helloWorld')).toBe(false);
      expect(CaseUtil.isPascalCase('hello_world')).toBe(false);
    });

    it('should check snake_case', () => {
      expect(CaseUtil.isSnakeCase('hello_world')).toBe(true);
      expect(CaseUtil.isSnakeCase('helloWorld')).toBe(false);
      expect(CaseUtil.isSnakeCase('HelloWorld')).toBe(false);
    });

    it('should check kebab-case', () => {
      expect(CaseUtil.isKebabCase('hello-world')).toBe(true);
      expect(CaseUtil.isKebabCase('helloWorld')).toBe(false);
      expect(CaseUtil.isKebabCase('HelloWorld')).toBe(false);
    });
  });

  describe('splitByCase', () => {
    it('should split camelCase', () => {
      expect(CaseUtil.splitByCase('helloWorld')).toEqual(['hello', 'World']);
      expect(CaseUtil.splitByCase('helloWorldTest')).toEqual(['hello', 'World', 'Test']);
    });

    it('should split PascalCase', () => {
      expect(CaseUtil.splitByCase('HelloWorld')).toEqual(['Hello', 'World']);
      expect(CaseUtil.splitByCase('HelloWorldTest')).toEqual(['Hello', 'World', 'Test']);
    });

    it('should split snake_case', () => {
      expect(CaseUtil.splitByCase('hello_world')).toEqual(['hello', 'world']);
      expect(CaseUtil.splitByCase('hello_world_test')).toEqual(['hello', 'world', 'test']);
    });

    it('should split kebab-case', () => {
      expect(CaseUtil.splitByCase('hello-world')).toEqual(['hello', 'world']);
      expect(CaseUtil.splitByCase('hello-world-test')).toEqual(['hello', 'world', 'test']);
    });

    it('should handle empty string', () => {
      expect(CaseUtil.splitByCase('')).toEqual([]);
    });
  });
});
