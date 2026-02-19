import type { EmbeddingResult, Message, Model, ToolMap } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromOpenAI } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";
import { safeStringify } from "../../utils/validation-utils";

export interface OpenAiProviderOptions extends BaseProviderOptions {}

type OpenAiChatMessage =
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

function mapTools(tools: ToolMap | undefined): unknown[] | undefined {
  if (!tools) return undefined;
  const entries = Object.values(tools);
  if (entries.length === 0) return undefined;

  return entries.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: typeof t.inputSchema === "object" && t.inputSchema !== null ? t.inputSchema : { type: "object", additionalProperties: true }
    }
  }));
}

function mapMessages(messages: readonly Message[]): OpenAiChatMessage[] {
  const out: OpenAiChatMessage[] = [];

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
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

    const toolCalls = parts.filter((p) => p.type === "tool_call");
    const toolResults = parts.filter((p) => p.type === "tool_result");

    const role = msg.role === "developer" ? "developer" : msg.role === "system" ? "system" : msg.role === "assistant" ? "assistant" : msg.role === "user" ? "user" : "tool";

    if (role === "assistant" && toolCalls.length > 0) {
      out.push({
        role: "assistant",
        content: text,
        tool_calls: toolCalls.map((p) => ({
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

export class OpenAIProvider extends BaseProvider<"openai"> {
  constructor(options: OpenAiProviderOptions = {}) {
    super("openai", options, {
      defaultBaseUrl: "https://api.openai.com/v1",
      envKey: "OPENAI_API_KEY",
      serviceName: "OpenAI"
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
    const usage = usageFromOpenAI(json?.usage);

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
      throw new Error(`OpenAI stream request failed (${res.status}): ${body || res.statusText}`);
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

  async embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    const payload = {
      model: request.model.id,
      input: request.input
    };

    const json = (await this.requestJson(
      "/embeddings",
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const data = Array.isArray(json?.data) ? json.data : [];
    const embeddings = data
      .map((item: any) => ({
        model: typeof json?.model === "string" ? json.model : request.model.id,
        vector: Array.isArray(item?.embedding) ? (item.embedding as readonly number[]) : ([] as readonly number[])
      }))
      .filter((e: any) => Array.isArray(e.vector));

    return {
      embeddings,
      usage: usageFromOpenAI(json?.usage),
    };
  }
}

export function openaiProvider(options: OpenAiProviderOptions = {}): OpenAIProvider {
  return new OpenAIProvider(options);
}
