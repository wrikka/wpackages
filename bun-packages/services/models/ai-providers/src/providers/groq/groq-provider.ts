import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromGroq } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";
import { safeStringify } from "../../utils/validation-utils";

export interface GroqProviderOptions extends BaseProviderOptions {}

type GroqChatMessage =
  | {
      readonly role: "system" | "developer" | "user" | "assistant";
      readonly content: string;
    }
  | {
      readonly role: "assistant";
      readonly content: string;
      readonly tool_calls: readonly {
        readonly id: string;
        readonly type: "function";
        readonly function: { readonly name: string; readonly arguments: string };
      }[];
    }
  | {
      readonly role: "tool";
      readonly tool_call_id: string;
      readonly content: string;
    };

function mapTools(tools: Record<string, unknown> | undefined): unknown[] | undefined {
  if (!tools) return undefined;
  const entries = Object.values(tools);
  if (entries.length === 0) return undefined;

  return entries.map((t: any) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: typeof t.inputSchema === "object" && t.inputSchema !== null ? t.inputSchema : { type: "object", additionalProperties: true }
    }
  }));
}

function mapMessages(messages: readonly any[]): GroqChatMessage[] {
  const out: GroqChatMessage[] = [];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const role = msg.role === "developer" ? "developer" : msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "tool";

      if (role === "tool") {
        out.push({ role: "tool", tool_call_id: msg.id ?? "tool", content: msg.content });
        continue;
      }

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

    const role = msg.role === "developer" ? "developer" : msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "tool";

    if (role === "assistant" && toolCalls.length > 0) {
      out.push({
        role: "assistant",
        content: text,
        tool_calls: toolCalls.map((p: any) => ({
          id: p.id,
          type: "function",
          function: { name: p.name, arguments: safeStringify(p.input) }
        }))
      });
    } else if (role === "tool") {
      for (const p of toolResults) {
        out.push({ role: "tool", tool_call_id: p.id, content: safeStringify(p.output) });
      }
      if (text.length > 0) {
        out.push({ role: "tool", tool_call_id: msg.id ?? "tool", content: text });
      }
    } else {
      out.push({ role, content: text });
    }
  }

  return out;
}

export class GroqProvider extends BaseProvider<"groq"> {
  constructor(options: GroqProviderOptions = {}) {
    super("groq", options, {
      defaultBaseUrl: "https://api.groq.com/openai/v1",
      envKey: "GROQ_API_KEY",
      serviceName: "Groq"
    });
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: mapMessages(request.messages),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: false
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const json = (await this.requestJson(
      "/chat/completions",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const choice = json?.choices?.[0];
    const message = choice?.message;
    const text = typeof message?.content === "string" ? message.content : "";
    const usage = usageFromGroq(json?.usage);

    return { text, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const payload: Record<string, unknown> = {
      model: request.model.id,
      messages: mapMessages(request.messages),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const headers = this.createHeaders();
    const res = await fetch(`${this.auth.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Groq stream request failed (${res.status}): ${body || res.statusText}`);
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

      const delta = json?.choices?.[0]?.delta;
      const content = delta?.content;
      if (typeof content === "string" && content.length > 0) {
        yield { type: "text_delta", value: content };
      }

      const toolCalls = delta?.tool_calls;
      if (Array.isArray(toolCalls) && toolCalls.length > 0) {
        yield { type: "tool_call", value: toolCalls };
      }

      yield { type: "event", value: { type: "chunk", raw: json } };
    }
  }

  async embed(_request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    throw new Error("Groq does not support embedding models. Use OpenAI or other providers for embeddings.");
  }
}

export function groqProvider(options: GroqProviderOptions = {}): GroqProvider {
  return new GroqProvider(options);
}
