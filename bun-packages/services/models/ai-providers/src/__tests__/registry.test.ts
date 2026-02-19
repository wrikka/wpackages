import { describe, expect, it } from "vitest";

import {
  anthropicProvider,
  createProviderRegistry,
  getProvider,
  googleProvider,
  groqProvider,
  ollamaProvider,
  openaiProvider
} from "../index";

describe("ai-providers registry", () => {
  it("creates a registry and retrieves providers", () => {
    const registry = createProviderRegistry([
      openaiProvider({ apiKey: "test-key" }),
      anthropicProvider({ apiKey: "test-key" }),
      googleProvider({ apiKey: "test-key" }),
      groqProvider({ apiKey: "test-key" }),
      ollamaProvider()
    ]);

    expect(getProvider(registry, "openai").name).toBe("openai");
    expect(getProvider(registry, "anthropic").name).toBe("anthropic");
  });
});
