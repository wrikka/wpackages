import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromGoogle } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";

export interface GoogleProviderOptions extends BaseProviderOptions {}

type GoogleMessage = {
  readonly role: "user" | "model";
  readonly parts: Array<{ readonly text: string } | { readonly functionCall: { readonly name: string; readonly args: Record<string, unknown> } } | { readonly functionResponse: { readonly name: string; readonly response: Record<string, unknown> } }>;
};

function mapTools(tools: Record<string, unknown> | undefined): unknown[] | undefined {
  if (!tools) return undefined;
  const entries = Object.values(tools);
  if (entries.length === 0) return undefined;

  return entries.map((t: any) => ({
    name: t.name,
    description: t.description,
    parameters: typeof t.inputSchema === "object" && t.inputSchema !== null ? t.inputSchema : { type: "object", additionalProperties: true }
  }));
}

function mapMessages(messages: readonly any[]): GoogleMessage[] {
  const out: GoogleMessage[] = [];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const role = msg.role === "assistant" ? "model" : "user";
      out.push({
        role,
        parts: [{ text: msg.content }]
      });
      continue;
    }

    const parts = msg.content;
    const textParts = parts.filter((p: any) => p.type === "text");
    const toolCalls = parts.filter((p: any) => p.type === "tool_call");
    const toolResults = parts.filter((p: any) => p.type === "tool_result");

    const role = msg.role === "assistant" ? "model" : "user";
    const googleParts: GoogleMessage["parts"] = [];

    if (textParts.length > 0) {
      const text = textParts.map((p: any) => p.text).join("");
      googleParts.push({ text });
    }

    if (role === "model" && toolCalls.length > 0) {
      for (const call of toolCalls) {
        googleParts.push({
          functionCall: {
            name: call.name,
            args: typeof call.input === "object" && call.input !== null ? call.input as Record<string, unknown> : {}
          }
        });
      }
    }

    if (role === "user" && toolResults.length > 0) {
      for (const result of toolResults) {
        googleParts.push({
          functionResponse: {
            name: result.name,
            response: typeof result.output === "object" && result.output !== null ? result.output as Record<string, unknown> : {}
          }
        });
      }
    }

    if (googleParts.length > 0) {
      out.push({ role, parts: googleParts });
    }
  }

  return out;
}

export class GoogleProvider extends BaseProvider<"google"> {
  constructor(options: GoogleProviderOptions = {}) {
    super("google", options, {
      defaultBaseUrl: "https://generativelanguage.googleapis.com",
      envKey: "GOOGLE_API_KEY",
      serviceName: "Google"
    });
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = super.createHeaders(additionalHeaders);
    delete headers.authorization;
    return headers;
  }

  protected async requestJson(
    path: string, 
    init: RequestInit & { readonly signal?: AbortSignal }, 
    retrySignal?: AbortSignal
  ): Promise<unknown> {
    const url = new URL(`${this.auth.baseUrl}${path}`);
    url.searchParams.set("key", this.auth.apiKey);
    
    const headers = this.createHeaders(init.headers as Record<string, string>);
    
    return super.requestJson(url.pathname + url.search, { ...init, headers }, retrySignal);
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      contents: messages,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        stopSequences: []
      }
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const json = (await this.requestJson(
      "/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const candidates = json?.candidates || [];
    const content = candidates[0]?.content || {};
    const parts = content.parts || [];
    const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text).join("");
    const usage = usageFromGoogle(json?.usageMetadata);

    return { text: textParts, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      contents: messages,
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
        stopSequences: []
      }
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const url = new URL(`${this.auth.baseUrl}/v1beta/models/gemini-pro:streamGenerateContent`);
    url.searchParams.set("key", this.auth.apiKey);
    url.searchParams.set("alt", "sse");

    const headers = this.createHeaders();
    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Google stream request failed (${res.status}): ${body || res.statusText}`);
    }

    for await (const data of streamSse(res, { signal: request.signal })) {
      if (data === "[DONE]") {
        yield { type: "event", value: { type: "done" } };
        break;
      }

      let json: any;
      try {
        json = JSON.parse(data);
      } catch {
        yield { type: "event", value: { type: "raw", data } };
        continue;
      }

      const candidates = json?.candidates || [];
      const content = candidates[0]?.content || {};
      const parts = content.parts || [];
      
      for (const part of parts) {
        if (part.text) {
          yield { type: "text_delta", value: part.text };
        } else if (part.functionCall) {
          yield { 
            type: "tool_call", 
            value: {
              id: `call_${Date.now()}`,
              name: part.functionCall.name,
              input: part.functionCall.args || {}
            }
          };
        }
      }

      yield { type: "event", value: { type: "chunk", raw: json } };
    }
  }

  async embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    const payload = {
      model: `models/${request.model.id}`,
      content: {
        parts: request.input.map(text => ({ text }))
      }
    };

    const json = (await this.requestJson(
      "/v1beta/models/embedding-001:embedContent",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const embedding = json?.embedding || {};
    const vector = Array.isArray(embedding.values) ? embedding.values : [];

    return {
      embeddings: [{
        model: request.model.id,
        vector
      }],
      usage: usageFromGoogle(json?.usageMetadata),
    };
  }
}

export function googleProvider(options: GoogleProviderOptions = {}): GoogleProvider {
  return new GoogleProvider(options);
}
