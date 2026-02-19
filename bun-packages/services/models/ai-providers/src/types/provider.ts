import type { EmbeddingResult, Message, Model, ToolMap, Usage } from "@wai/ai-core";

export type KnownProviderName =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "ollama"
  | "azure-openai"
  | "bedrock";

export type ProviderName = KnownProviderName | (string & {});

export interface GenerateTextRequest {
  readonly model: Model;
  readonly messages: readonly Message[];
  readonly tools?: ToolMap;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly signal?: AbortSignal;
}

export interface GenerateTextResponse {
  readonly text: string;
  readonly usage?: Usage;
  readonly raw?: unknown;
}

export interface StreamTextChunk {
  readonly type: "text_delta" | "tool_call" | "tool_result" | "event";
  readonly value: unknown;
}

export interface Provider<N extends ProviderName = ProviderName> {
  readonly name: N;

  generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>;
  streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk>;

  embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult>;
}
