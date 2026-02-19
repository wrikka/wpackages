import { describe, it, expect } from 'bun:test';
import { StringUtil } from '../../src/utils/string.util';

describe('StringUtil', () => {
  describe('trim', () => {
    it('should trim all whitespace', () => {
      expect(StringUtil.trim('  hello  ', { trimAll: true })).toBe('hello');
    });

    it('should trim start only', () => {
      expect(StringUtil.trim('  hello  ', { trimStart: true })).toBe('hello  ');
    });

    it('should trim end only', () => {
      expect(StringUtil.trim('  hello  ', { trimEnd: true })).toBe('  hello');
    });

    it('should handle empty string', () => {
      expect(StringUtil.trim('', { trimAll: true })).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(StringUtil.trim(null as any, { trimAll: true })).toBe('');
      expect(StringUtil.trim(undefined as any, { trimAll: true })).toBe('');
    });
  });

  describe('pad', () => {
    it('should pad at start', () => {
      expect(StringUtil.pad('test', { padStart: true, targetLength: 8 })).toBe('    test');
    });

    it('should pad at end', () => {
      expect(StringUtil.pad('test', { padEnd: true, targetLength: 8 })).toBe('test    ');
    });

    it('should pad at both sides', () => {
      expect(StringUtil.pad('test', { padStart: true, padEnd: true, targetLength: 8 })).toBe('  test  ');
    });

    it('should use custom fill string', () => {
      expect(StringUtil.pad('test', { padStart: true, targetLength: 8, fillString: '0' })).toBe('0000test');
    });

    it('should handle empty string', () => {
      expect(StringUtil.pad('', { padStart: true, targetLength: 5 })).toBe('     ');
    });
  });

  describe('truncate', () => {
    it('should truncate long string', () => {
      expect(StringUtil.truncate('Hello World', 5)).toBe('He...');
    });

    it('should not truncate short string', () => {
      expect(StringUtil.truncate('Hello', 10)).toBe('Hello');
    });

    it('should use custom suffix', () => {
      expect(StringUtil.truncate('Hello World', 5, '---')).toBe('He---');
    });

    it('should handle empty string', () => {
      expect(StringUtil.truncate('', 5)).toBe('');
    });
  });

  describe('reverse', () => {
    it('should reverse string', () => {
      expect(StringUtil.reverse('hello')).toBe('olleh');
    });

    it('should handle empty string', () => {
      expect(StringUtil.reverse('')).toBe('');
    });
  });

  describe('isEmpty', () => {
    it('should detect empty string', () => {
      expect(StringUtil.isEmpty('')).toBe(true);
      expect(StringUtil.isEmpty('   ')).toBe(true);
      expect(StringUtil.isEmpty('\t\n')).toBe(true);
    });

    it('should detect non-empty string', () => {
      expect(StringUtil.isEmpty('hello')).toBe(false);
      expect(StringUtil.isEmpty(' hello ')).toBe(false);
    });
  });

  describe('length', () => {
    it('should get string length', () => {
      expect(StringUtil.length('hello')).toBe(5);
    });

    it('should handle Unicode correctly', () => {
      expect(StringUtil.length('café')).toBe(4);
      expect(StringUtil.length('🌍')).toBe(1);
    });

    it('should handle empty string', () => {
      expect(StringUtil.length('')).toBe(0);
    });
  });

  describe('wordCount', () => {
    it('should count words', () => {
      expect(StringUtil.wordCount('hello world')).toBe(2);
      expect(StringUtil.wordCount('  hello   world  ')).toBe(2);
    });

    it('should handle empty string', () => {
      expect(StringUtil.wordCount('')).toBe(0);
      expect(StringUtil.wordCount('   ')).toBe(0);
    });
  });

  describe('charCount', () => {
    it('should count characters including whitespace', () => {
      expect(StringUtil.charCount('hello world', true)).toBe(11);
    });

    it('should count characters excluding whitespace', () => {
      expect(StringUtil.charCount('hello world', false)).toBe(10);
    });

    it('should handle empty string', () => {
      expect(StringUtil.charCount('')).toBe(0);
    });
  });

  describe('extractNumbers', () => {
    it('should extract numbers', () => {
      expect(StringUtil.extractNumbers('abc123def456')).toBe('123456');
    });

    it('should handle no numbers', () => {
      expect(StringUtil.extractNumbers('abcdef')).toBe('');
    });

    it('should handle empty string', () => {
      expect(StringUtil.extractNumbers('')).toBe('');
    });
  });

  describe('extractLetters', () => {
    it('should extract letters', () => {
      expect(StringUtil.extractLetters('abc123def456')).toBe('abcdef');
    });

    it('should handle no letters', () => {
      expect(StringUtil.extractLetters('123456')).toBe('');
    });

    it('should handle empty string', () => {
      expect(StringUtil.extractLetters('')).toBe('');
    });
  });

  describe('isASCII', () => {
    it('should detect ASCII strings', () => {
      expect(StringUtil.isASCII('hello')).toBe(true);
      expect(StringUtil.isASCII('Hello World 123')).toBe(true);
    });

    it('should detect non-ASCII strings', () => {
      expect(StringUtil.isASCII('café')).toBe(false);
      expect(StringUtil.isASCII('🌍')).toBe(false);
    });
  });

  describe('toFilename', () => {
    it('should convert to safe filename', () => {
      expect(StringUtil.toFilename('file<name>.txt')).toBe('file_name_.txt');
      expect(StringUtil.toFilename('file/name\\txt')).toBe('file_name_txt');
    });

    it('should handle empty string', () => {
      expect(StringUtil.toFilename('')).toBe('');
    });

    it('should use custom replacement', () => {
      expect(StringUtil.toFilename('file<name>.txt', '-')).toBe('file-name-.txt');
    });
  });
});
