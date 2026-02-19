import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromAnthropic } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";
import { safeStringify } from "../../utils/validation-utils";

export interface AnthropicProviderOptions extends BaseProviderOptions {}

type AnthropicMessage = {
  readonly role: "user" | "assistant";
  readonly content: Array<
    | { readonly type: "text"; readonly text: string }
    | { readonly type: "tool_use"; readonly id: string; readonly name: string; readonly input: Record<string, unknown> }
    | { readonly type: "tool_result"; readonly tool_use_id: string; readonly content: string; readonly is_error?: boolean }
  >;
};

function mapTools(tools: Record<string, unknown> | undefined): unknown[] | undefined {
  if (!tools) return undefined;
  const entries = Object.values(tools);
  if (entries.length === 0) return undefined;

  return entries.map((t: any) => ({
    name: t.name,
    description: t.description,
    input_schema: typeof t.inputSchema === "object" && t.inputSchema !== null ? t.inputSchema : { type: "object", additionalProperties: true }
  }));
}

function mapMessages(messages: readonly any[]): AnthropicMessage[] {
  const out: AnthropicMessage[] = [];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const role = msg.role === "assistant" ? "assistant" : "user";
      
      if (role === "user") {
        out.push({
          role: "user",
          content: [{ type: "text", text: msg.content }]
        });
      } else {
        out.push({
          role: "assistant",
          content: [{ type: "text", text: msg.content }]
        });
      }
      continue;
    }

    const parts = msg.content;
    const textParts = parts.filter((p: any) => p.type === "text");
    const toolCalls = parts.filter((p: any) => p.type === "tool_call");
    const toolResults = parts.filter((p: any) => p.type === "tool_result");

    const role = msg.role === "assistant" ? "assistant" : "user";
    const content: AnthropicMessage["content"] = [];

    if (textParts.length > 0) {
      const text = textParts.map((p: any) => p.text).join("");
      content.push({ type: "text", text });
    }

    if (role === "assistant" && toolCalls.length > 0) {
      for (const call of toolCalls) {
        content.push({
          type: "tool_use",
          id: call.id,
          name: call.name,
          input: typeof call.input === "object" && call.input !== null ? call.input as Record<string, unknown> : {}
        });
      }
    }

    if (role === "user" && toolResults.length > 0) {
      for (const result of toolResults) {
        content.push({
          type: "tool_result",
          tool_use_id: result.id,
          content: safeStringify(result.output),
          is_error: false
        });
      }
    }

    if (content.length > 0) {
      out.push({ role, content });
    }
  }

  return out;
}

export class AnthropicProvider extends BaseProvider<"anthropic"> {
  constructor(options: AnthropicProviderOptions = {}) {
    super("anthropic", options, {
      defaultBaseUrl: "https://api.anthropic.com",
      envKey: "ANTHROPIC_API_KEY",
      serviceName: "Anthropic"
    });
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = super.createHeaders(additionalHeaders);
    headers["anthropic-version"] = "2023-06-01";
    return headers;
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const messages = mapMessages(request.messages);
    
    if (messages.length === 0 || messages[0].role !== "user") {
      messages.unshift({ role: "user", content: [{ type: "text", text: "" }] });
    }

    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: messages,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature,
      stream: false
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const json = (await this.requestJson(
      "/v1/messages",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const content = json?.content || [];
    const textParts = content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    const usage = usageFromAnthropic(json?.usage);

    return { text: textParts, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const messages = mapMessages(request.messages);
    
    if (messages.length === 0 || messages[0].role !== "user") {
      messages.unshift({ role: "user", content: [{ type: "text", text: "" }] });
    }

    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: messages,
      max_tokens: request.maxTokens ?? 1024,
      temperature: request.temperature,
      stream: true
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const headers = this.createHeaders();
    const res = await fetch(`${this.auth.baseUrl}/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Anthropic stream request failed (${res.status}): ${body || res.statusText}`);
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

      const type = json?.type;
      if (type === "content_block_delta") {
        const delta = json?.delta;
        const text = delta?.text;
        if (typeof text === "string" && text.length > 0) {
          yield { type: "text_delta", value: text };
        }
      } else if (type === "content_block_start" && json?.content_block?.type === "tool_use") {
        yield { 
          type: "tool_call", 
          value: {
            id: json.content_block.id,
            name: json.content_block.name,
            input: json.content_block.input || {}
          }
        };
      }

      yield { type: "event", value: { type: "chunk", raw: json } };
    }
  }

  async embed(_request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    throw new Error("Anthropic does not support embedding models. Use OpenAI or other providers for embeddings.");
  }
}

export function anthropicProvider(options: AnthropicProviderOptions = {}): AnthropicProvider {
  return new AnthropicProvider(options);
}
