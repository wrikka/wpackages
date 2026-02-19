import type { EmbeddingResult, Model } from "@wai/ai-core";

import type { GenerateTextRequest, GenerateTextResponse, StreamTextChunk } from "../../types/provider";
import { BaseProvider, BaseProviderOptions } from "../../base/base-provider";
import { usageFromBedrock } from "../../utils/usage-utils";
import { streamSse } from "../../utils/http-utils";
import { safeStringify } from "../../utils/validation-utils";

export interface BedrockProviderOptions extends BaseProviderOptions {}

type BedrockMessage = {
  readonly role: "user" | "assistant";
  readonly content: Array<
    { readonly type: "text"; readonly text: string }
    | { readonly type: "tool_use"; readonly toolUseId: string; readonly name: string; readonly input: Record<string, unknown> }
    | { readonly type: "tool_result"; readonly toolUseId: string; readonly content: string; readonly status: "success" | "error" }
  >;
};

type BedrockTool = {
  readonly toolSpec: {
    readonly name: string;
    readonly description: string;
    readonly inputSchema: { readonly json: Record<string, unknown> };
  };
};

function mapTools(tools: Record<string, unknown> | undefined): BedrockTool[] | undefined {
  if (!tools) return undefined;
  const entries = Object.values(tools);
  if (entries.length === 0) return undefined;

  return entries.map((t: any) => ({
    toolSpec: {
      name: t.name,
      description: t.description || "",
      inputSchema: {
        json: typeof t.inputSchema === "object" && t.inputSchema !== null ? t.inputSchema as Record<string, unknown> : { type: "object", additionalProperties: true }
      }
    }
  }));
}

function mapMessages(messages: readonly any[]): BedrockMessage[] {
  const out: BedrockMessage[] = [];

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      const role = msg.role === "assistant" ? "assistant" : "user";
      out.push({
        role,
        content: [{ type: "text", text: msg.content }]
      });
      continue;
    }

    const parts = msg.content;
    const textParts = parts.filter((p: any) => p.type === "text");
    const toolCalls = parts.filter((p: any) => p.type === "tool_call");
    const toolResults = parts.filter((p: any) => p.type === "tool_result");

    const role = msg.role === "assistant" ? "assistant" : "user";
    const content: BedrockMessage["content"] = [];

    if (textParts.length > 0) {
      const text = textParts.map((p: any) => p.text).join("");
      content.push({ type: "text", text });
    }

    if (role === "assistant" && toolCalls.length > 0) {
      for (const call of toolCalls) {
        content.push({
          type: "tool_use",
          toolUseId: call.id,
          name: call.name,
          input: typeof call.input === "object" && call.input !== null ? call.input as Record<string, unknown> : {}
        });
      }
    }

    if (role === "user" && toolResults.length > 0) {
      for (const result of toolResults) {
        content.push({
          type: "tool_result",
          toolUseId: result.id,
          content: safeStringify(result.output),
          status: "success"
        });
      }
    }

    if (content.length > 0) {
      out.push({ role, content });
    }
  }

  return out;
}

export class BedrockProvider extends BaseProvider<"bedrock"> {
  constructor(options: BedrockProviderOptions = {}) {
    super("bedrock", options, {
      defaultBaseUrl: "",
      envKey: "",
      serviceName: "AWS Bedrock"
    });
  }

  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = super.createHeaders(additionalHeaders);
    delete headers.authorization;
    headers["anthropic-version"] = "2023-06-01";
    return headers;
  }

  async generateText(request: GenerateTextRequest): Promise<GenerateTextResponse> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: request.maxTokens ?? 1024,
      messages: messages
    };

    if (request.temperature !== undefined) {
      payload.temperature = request.temperature;
    }

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const json = (await this.requestJson(
      `/model/${request.model.id}/converse`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        signal: request.signal
      },
      request.signal
    )) as any;

    const content = json?.output?.message?.content || [];
    const textParts = content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    const usage = usageFromBedrock(json?.usage);

    return { text: textParts, usage, raw: json };
  }

  async *streamText(request: GenerateTextRequest): AsyncIterable<StreamTextChunk> {
    const messages = mapMessages(request.messages);
    
    const payload: Record<string, unknown> = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: request.maxTokens ?? 1024,
      messages: messages,
      stream: true
    };

    if (request.temperature !== undefined) {
      payload.temperature = request.temperature;
    }

    const mappedTools = mapTools(request.tools);
    if (mappedTools) {
      payload.tools = mappedTools;
    }

    const headers = this.createHeaders();
    const res = await fetch(`${this.auth.baseUrl}/model/${request.model.id}/converse-stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: request.signal
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`AWS Bedrock stream request failed (${res.status}): ${body || res.statusText}`);
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

      const chunk = json?.chunk;
      if (chunk?.type === "content_block_delta") {
        const delta = chunk?.delta;
        const text = delta?.text;
        if (typeof text === "string" && text.length > 0) {
          yield { type: "text_delta", value: text };
        }
      } else if (chunk?.type === "content_block_start" && chunk?.content_block?.type === "tool_use") {
        yield { 
          type: "tool_call", 
          value: {
            id: chunk.content_block.tool_use_id,
            name: chunk.content_block.name,
            input: chunk.content_block.input || {}
          }
        };
      }

      yield { type: "event", value: { type: "chunk", raw: json } };
    }
  }

  async embed(request: { readonly model: Model; readonly input: readonly string[]; readonly signal?: AbortSignal }): Promise<EmbeddingResult> {
    const payload = {
      inputText: request.input.join("\n")
    };

    const json = (await this.requestJson(
      `/model/${request.model.id}/embed`,
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
      usage: usageFromBedrock(json?.usage),
    };
  }
}

export function bedrockProvider(options: BedrockProviderOptions = {}): BedrockProvider {
  return new BedrockProvider(options);
}
