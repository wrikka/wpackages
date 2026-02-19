import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromOllama } from "../../utils/usage-utils";
import { streamNdjson } from "../../utils/http-utils";

export interface OllamaProviderOptions extends BaseProviderOptions {
  readonly timeout?: number;
}

type OllamaMessage = {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
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

function mapMessages(messages: readonly any[]): OllamaMessage[] {
  const out: OllamaMessage[] = [];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const role = msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : "user";
      out.push({ role, content: msg.content });
      continue;
    }

    const parts = msg.content;
    const text = parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

    const toolCalls = parts.filter((p: any) => p.type === "tool_call");
    const toolResults = parts.filter((p: any) => p.type === "tool_result");

    const role = msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : "user";

    if (role === "assistant" && toolCalls.length > 0) {
      const toolCallTexts = toolCalls.map((call: any) => 
        `Function call: ${call.name}(${JSON.stringify(call.input)})`
      ).join("\n");
      const fullContent = text + (text.length > 0 ? "\n" : "") + toolCallTexts;
      out.push({ role, content: fullContent });
    } else if (role === "user" && toolResults.length > 0) {
      const toolResultTexts = toolResults.map((result: any) => 
        `Function result for ${result.name}: ${JSON.stringify(result.output)}`
      ).join("\n");
      const fullContent = text + (text.length > 0 ? "\n" : "") + toolResultTexts;
      out.push({ role, content: fullContent });
    } else {
      out.push({ role, content: text });
    }
  }

  return out;
}

export class OllamaProvider extends BaseProvider<"ollama"> {
  private readonly timeout: number;

  constructor(options: OllamaProviderOptions = {}) {
    super("ollama", options, {
      defaultBaseUrl: "http://localhost:11434",
      envKey: "",
      serviceName: "Ollama"
    });
    this.timeout = options.timeout ?? 30000;
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = super.createHeaders(additionalHeaders);
    delete headers.authorization;
    return headers;
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: messages,
      stream: false
    };

    if (request.temperature !== undefined) {
      payload.options = {
        temperature: request.temperature,
        num_predict: request.maxTokens
      };
    } else if (request.maxTokens !== undefined) {
      payload.options = {
        num_predict: request.maxTokens
      };
    }

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const json = (await this.requestJson(
      "/api/chat",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const message = json?.message || {};
    const text = typeof message.content === "string" ? message.content : "";
    const usage = usageFromOllama(json);

    return { text, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: messages,
      stream: true
    };

    if (request.temperature !== undefined) {
      payload.options = {
        temperature: request.temperature,
        num_predict: request.maxTokens
      };
    } else if (request.maxTokens !== undefined) {
      payload.options = {
        num_predict: request.maxTokens
      };
    }

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const headers = this.createHeaders();
    const res = await fetch(`${this.auth.baseUrl}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Ollama stream request failed (${res.status}): ${body || res.statusText}`);
    }

    for await (const data of streamNdjson(res, { signal: request.signal })) {
      let json: any;
      try {
        json = JSON.parse(data);
      } catch {
        yield { type: "event", value: { type: "raw", data } };
        continue;
      }

      if (json.done) {
        yield { type: "event", value: { type: "done", usage: usageFromOllama(json) } };
        break;
      }

      const message = json?.message || {};
      const content = message.content;
      if (typeof content === "string" && content.length > 0) {
        yield { type: "text_delta", value: content };
      }

      yield { type: "event", value: { type: "chunk", raw: json } };
    }
  }

  async embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    const payload = {
      model: request.model.id,
      prompt: request.input.join("\n")
    };

    const json = (await this.requestJson(
      "/api/embeddings",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const vector = Array.isArray(json?.embedding) ? json.embedding : [];

    return {
      embeddings: [{
        model: request.model.id,
        vector
      }],
      usage: usageFromOllama(json),
    };
  }
}

export function ollamaProvider(options: OllamaProviderOptions = {}): OllamaProvider {
  return new OllamaProvider(options);
}
