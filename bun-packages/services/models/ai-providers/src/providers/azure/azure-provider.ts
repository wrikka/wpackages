import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromAzureOpenAI } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";
import { safeStringify } from "../../utils/validation-utils";

declare const process: {
  env: Record<string, string | undefined>;
};

export interface AzureOpenAIProviderOptions extends BaseProviderOptions {
  readonly apiVersion?: string;
  readonly deployment?: string;
}

type AzureOpenAIChatMessage =
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

function mapMessages(messages: readonly any[]): AzureOpenAIChatMessage[] {
  const out: AzureOpenAIChatMessage[] = [];

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

export class AzureOpenAIProvider extends BaseProvider<"azure-openai"> {
  private readonly apiVersion: string;
  private readonly deployment: string;

  constructor(options: AzureOpenAIProviderOptions = {}) {
    super("azure-openai", options, {
      defaultBaseUrl: "",
      envKey: "AZURE_OPENAI_API_KEY",
      serviceName: "Azure OpenAI"
    });
    this.apiVersion = options.apiVersion ?? process.env.AZURE_OPENAI_API_VERSION ?? "2024-02-15-preview";
    this.deployment = options.deployment ?? process.env.AZURE_OPENAI_DEPLOYMENT ?? "";

    if (!this.deployment) {
      throw new Error("Azure OpenAI deployment name is required. Set it in options or AZURE_OPENAI_DEPLOYMENT environment variable.");
    }
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = super.createHeaders(additionalHeaders);
    return headers;
  }

  protected async requestJson(
    path: string, 
    init: RequestInit & { readonly signal?: AbortSignal }, 
    retrySignal?: AbortSignal
  ): Promise<unknown> {
    const url = new URL(`${this.auth.baseUrl}${path}`);
    url.searchParams.set("api-version", this.apiVersion);
    
    const headers = this.createHeaders(init.headers as Record<string, string>);
    
    return super.requestJson(url.pathname + url.search, { ...init, headers }, retrySignal);
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const payload: Record<string, unknown> = {
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
      `/openai/deployments/${this.deployment}/chat/completions`,
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
    const usage = usageFromAzureOpenAI(json?.usage);

    return { text, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const payload: Record<string, unknown> = {
      messages: mapMessages(request.messages),
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      stream: true
    };

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const url = new URL(`${this.auth.baseUrl}/openai/deployments/${this.deployment}/chat/completions`);
    url.searchParams.set("api-version", this.apiVersion);

    const headers = this.createHeaders();
    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Azure OpenAI stream request failed (${res.status}): ${body || res.statusText}`);
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
      input: request.input
    };

    const json = (await this.requestJson(
      `/openai/deployments/${this.deployment}/embeddings`,
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
        model: request.model.id,
        vector: Array.isArray(item?.embedding) ? (item.embedding as readonly number[]) : ([] as readonly number[])
      }))
      .filter((e: any) => Array.isArray(e.vector));

    return {
      embeddings,
      usage: usageFromAzureOpenAI(json?.usage),
    };
  }
}

export function azureProvider(options: AzureOpenAIProviderOptions = {}): AzureOpenAIProvider {
  return new AzureOpenAIProvider(options);
}
