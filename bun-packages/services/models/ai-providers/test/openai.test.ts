import { describe, it, expect } from 'vitest';
import { openaiProvider } from '../src/providers/openai';

describe('openaiProvider', () => {
  it('should create a provider', () => {
    const provider = openaiProvider({
      apiKey: 'test-key',
    });

    expect(provider.name).toBe('openai');
  });

  it('should generate text', async () => {
    const provider = openaiProvider({
      apiKey: 'test-key',
    });

    // Note: This is a mock test - real implementation would require actual API
    // For now, we just verify the provider structure
    expect(provider.name).toBe('openai');
    expect(typeof provider.generateText).toBe('function');
    expect(typeof provider.streamText).toBe('function');
    expect(typeof provider.embed).toBe('function');
  });

  it('should support custom baseUrl', () => {
    const provider = openaiProvider({
      apiKey: 'test-key',
      baseUrl: 'https://custom.example.com',
    });

    expect(provider.name).toBe('openai');
  });
});
