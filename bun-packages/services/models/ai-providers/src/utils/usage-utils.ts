import type { Usage } from "@wai/ai-core";

export function usageFromOpenAI(usage: any): Usage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined;
  const outputTokens = typeof usage.completion_tokens === "number" ? usage.completion_tokens : undefined;
  const totalTokens = typeof usage.total_tokens === "number" ? usage.total_tokens : undefined;
  return { inputTokens, outputTokens, totalTokens };
}

export function usageFromAnthropic(usage: any): Usage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.input_tokens === "number" ? usage.input_tokens : undefined;
  const outputTokens = typeof usage.output_tokens === "number" ? usage.output_tokens : undefined;
  const totalTokens = typeof inputTokens === "number" && typeof outputTokens === "number" 
    ? inputTokens + outputTokens 
    : undefined;
  return { inputTokens, outputTokens, totalTokens };
}

export function usageFromGoogle(usage: any): Usage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : undefined;
  const outputTokens = typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : undefined;
  const totalTokens = typeof usage.totalTokenCount === "number" ? usage.totalTokenCount : undefined;
  return { inputTokens, outputTokens, totalTokens };
}

export function usageFromOllama(usage: any): Usage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.prompt_eval_count === "number" ? usage.prompt_eval_count : undefined;
  const outputTokens = typeof usage.eval_count === "number" ? usage.eval_count : undefined;
  const totalTokens = typeof inputTokens === "number" && typeof outputTokens === "number" 
    ? inputTokens + outputTokens 
    : undefined;
  return { inputTokens, outputTokens, totalTokens };
}

export function usageFromAzureOpenAI(usage: any): Usage | undefined {
  return usageFromOpenAI(usage);
}

export function usageFromBedrock(usage: any): Usage | undefined {
  if (!usage || typeof usage !== "object") return undefined;
  const inputTokens = typeof usage.inputTokenCount === "number" ? usage.inputTokenCount : undefined;
  const outputTokens = typeof usage.outputTokenCount === "number" ? usage.outputTokenCount : undefined;
  const totalTokens = typeof inputTokens === "number" && typeof outputTokens === "number" 
    ? inputTokens + outputTokens 
    : undefined;
  return { inputTokens, outputTokens, totalTokens };
}

export function usageFromGroq(usage: any): Usage | undefined {
  return usageFromOpenAI(usage);
}
