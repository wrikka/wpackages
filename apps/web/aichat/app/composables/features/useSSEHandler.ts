import type { ChatSseEvent } from '@wai/ai-sdk';

export function useSSEHandler() {
  const activeAbortController = ref<AbortController | null>(null);

  function stopGenerating() {
    activeAbortController.value?.abort();
    activeAbortController.value = null;
  }

  async function handleSSEStream(
    response: Response,
    callbacks: {
      onContentChunk: (content: string) => void;
      onResearchEvent?: (event: any) => void;
      onToolResult?: (result: any) => void;
      onChatError?: (error: any) => void;
      onToolCall?: (toolCall: any) => void;
    },
  ) {
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let content = '';
    const toolCalls: any[] = [];
    const toolResults: Record<string, unknown> = {};

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.replace(/^data: /, '');
        if (data === '[DONE]') {
          break;
        }
        try {
          const parsed = JSON.parse(data) as ChatSseEvent | any;

          if (parsed?.type === 'research_event' && callbacks.onResearchEvent) {
            callbacks.onResearchEvent(parsed);
            continue;
          }

          if (parsed?.type === 'tool_result' && callbacks.onToolResult && parsed?.tool_call_id) {
            toolResults[String(parsed.tool_call_id)] = parsed.result;
            callbacks.onToolResult(parsed);
            continue;
          }

          if (parsed?.type === 'chat_error' && callbacks.onChatError) {
            callbacks.onChatError(parsed);
            continue;
          }

          const delta = parsed.choices[0]?.delta;
          if (delta?.content) {
            content += delta.content;
            callbacks.onContentChunk(content);
          }

          if (Array.isArray(delta?.tool_calls) && callbacks.onToolCall) {
            for (const tc of delta.tool_calls) {
              if (typeof tc?.index !== 'number') continue;
              if (!toolCalls[tc.index]) {
                toolCalls[tc.index] = {
                  id: tc.id,
                  type: tc.type,
                  function: { name: '', arguments: '' },
                };
              }
              const current = toolCalls[tc.index];
              if (tc.id) current.id = tc.id;
              if (tc.type) current.type = tc.type;
              if (tc.function?.name) current.function.name += tc.function.name;
              if (tc.function?.arguments) current.function.arguments += tc.function.arguments;
              callbacks.onToolCall(current);
            }
          }
        } catch {
          // Ignore parsing errors for now
        }
      }
    }

    return { content, toolCalls: toolCalls.filter(Boolean), toolResults };
  }

  return {
    activeAbortController,
    stopGenerating,
    handleSSEStream,
  };
}
