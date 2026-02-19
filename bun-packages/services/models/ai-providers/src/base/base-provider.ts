import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, Provider, StreamTextChunk } from "../types/provider";
import { requestJsonWithRetry, RetryOptions } from "../utils/http-utils";
import { safeStringify } from "../utils/validation-utils";
import { createAuthHeaders, resolveAuthConfig } from "../utils/auth-utils";

export interface BaseProviderOptions {
  readonly apiKey?: string;
  readonly baseUrl?: string;
}

export interface ProviderConfig {
  readonly defaultBaseUrl: string;
  readonly envKey: string;
  readonly serviceName: string;
  readonly retryOptions?: RetryOptions;
}

export abstract class BaseProvider<N extends string> implements Provider<N> {
  public readonly name: N;
  protected readonly config: ProviderConfig;
  protected readonly options: BaseProviderOptions;
  protected readonly auth: { readonly apiKey: string; readonly baseUrl: string };

  constructor(name: N, options: BaseProviderOptions, config: ProviderConfig) {
    this.name = name;
    this.options = options;
    this.config = config;
    this.auth = resolveAuthConfig(options, config.envKey, config.defaultBaseUrl);
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return createAuthHeaders(this.auth.apiKey, additionalHeaders);
  }

  protected async requestJson(
    path: string, 
    init: RequestInit & { readonly signal?: AbortSignal }, 
    retrySignal?: AbortSignal
  ): Promise<unknown> {
    const headers = this.createHeaders(init.headers as Record<string, string>);
    
    return requestJsonWithRetry(
      `${this.auth.baseUrl}${path}`,
      { ...init, headers },
      { ...this.config.retryOptions, signal: retrySignal ?? init.signal }
    );
  }

  protected safeStringify(value: unknown): string {
    return safeStringify(value);
  }

  abstract generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>;
  abstract streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk>;
  abstract embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult>;
}
