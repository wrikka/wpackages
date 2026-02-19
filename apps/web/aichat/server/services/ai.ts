import type { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { ChatErrorEvent } from '@wai/ai-sdk';
import { logger } from '../utils/logger';
import { getLlmProvider } from './llm';
import { executeTool, getAvailableTools } from './plugins';
import { searchKnowledgeBase } from './rag';

type ResearchPhase = 'kb_search' | 'llm_stream' | 'tool_execute';
type ResearchStatus = 'start' | 'progress' | 'done' | 'error';

interface ResearchEvent {
  id: string;
  sessionId: string;
  phase: ResearchPhase;
  status: ResearchStatus;
  title: string;
  detail?: string;
  timestamp: number;
}

interface CallAIOptions {
  sessionId: string;
  message: string;
  provider: string;
  model: string;
  systemPrompt: string | null;
  history: ChatCompletionMessageParam[];
  knowledgeBaseId: string | null;
  attachments?: { fileType: string; dataUrl: string; fileName: string }[];
  tools?: any[];
  onEvent?: (event: ResearchEvent) => void;
}

export function callAIStream(options: CallAIOptions) {
  const {
    sessionId,
    message,
    provider,
    model,
    systemPrompt,
    history,
    knowledgeBaseId,
    attachments,
    tools: agentTools,
    onEvent,
  } = options;
  const tools = agentTools && agentTools.length > 0 ? agentTools : getAvailableTools();

  const sseLine = (payload: unknown) =>
    new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);

  const emitEvent = (
    event: Omit<ResearchEvent, 'id' | 'sessionId' | 'timestamp'> & { detail?: string },
  ) => {
    const full: ResearchEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      sessionId,
      timestamp: Date.now(),
      ...event,
    };
    onEvent?.(full);
    return full;
  };

  return new ReadableStream({
    async start(controller) {
      try {
        let finalSystemPrompt = systemPrompt || 'You are a helpful AI assistant.';

        if (knowledgeBaseId) {
          controller.enqueue(new TextEncoder().encode(`data: ${
            JSON.stringify({
              type: 'research_event',
              ...emitEvent({
                phase: 'kb_search',
                status: 'start',
                title: 'Searching knowledge base',
              }),
            })
          }\n\n`));
          const contextChunks = await searchKnowledgeBase(knowledgeBaseId, message);
          if (contextChunks.length > 0) {
            const context = contextChunks.join('\n\n');
            finalSystemPrompt =
              `You are a helpful AI assistant. Use the following context to answer the user's question.\n\nContext:\n${context}\n\n---\n\n${finalSystemPrompt}`;
          }
          controller.enqueue(new TextEncoder().encode(`data: ${
            JSON.stringify({
              type: 'research_event',
              ...emitEvent({
                phase: 'kb_search',
                status: 'done',
                title: 'Knowledge base search complete',
                detail: contextChunks.length > 0
                  ? `Found ${contextChunks.length} relevant chunks`
                  : 'No relevant context found',
              }),
            })
          }\n\n`));
        }

        const userMessage: ChatCompletionMessageParam = (() => {
          const images = (attachments || []).filter(a => a.fileType.startsWith('image/'));
          if (images.length === 0) {
            return { role: 'user', content: message };
          }

          const parts: any[] = [{ type: 'text', text: message }];
          for (const img of images) {
            parts.push({ type: 'image_url', image_url: { url: img.dataUrl } });
          }
          return { role: 'user', content: parts } as any;
        })();

        const initialMessages: ChatCompletionMessageParam[] = [
          { role: 'system', content: finalSystemPrompt },
          ...history,
          userMessage,
        ];

        const run = async (messages: ChatCompletionMessageParam[]) => {
          const llmProvider = getLlmProvider(provider);

          controller.enqueue(new TextEncoder().encode(`data: ${
            JSON.stringify({
              type: 'research_event',
              ...emitEvent({ phase: 'llm_stream', status: 'start', title: 'Generating answer' }),
            })
          }\n\n`));

          const stream = await llmProvider.chat({
            model,
            messages,
            tools,
          }) as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;

          const toolCalls: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[] = [];
          let hasToolCall = false;

          for await (const chunk of stream) {
            const choice = chunk.choices[0];
            if (!choice) continue;

            const delta = choice.delta;
            if (!delta) continue;

            if (delta.content || delta.tool_calls) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }

            if (delta.tool_calls) {
              hasToolCall = true;
              for (const toolCall of delta.tool_calls) {
                if (toolCall.index !== undefined) {
                  if (toolCall.index === toolCalls.length) {
                    toolCalls.push({
                      function: { name: '', arguments: '' },
                      index: toolCall.index,
                      id: toolCall.id,
                      type: 'function',
                    });
                  }
                  const currentToolCall = toolCalls[toolCall.index];
                  if (!currentToolCall?.function) {
                    continue;
                  }
                  {
                    if (toolCall.function?.name) {
                      currentToolCall.function.name += toolCall.function.name;
                    }
                    if (toolCall.function?.arguments) {
                      currentToolCall.function.arguments += toolCall.function.arguments;
                    }
                  }
                  if (toolCall.id) {
                    currentToolCall.id = toolCall.id;
                  }
                }
              }
            }
          }

          if (hasToolCall) {
            controller.enqueue(new TextEncoder().encode(`data: ${
              JSON.stringify({
                type: 'research_event',
                ...emitEvent({ phase: 'tool_execute', status: 'start', title: 'Executing tools' }),
              })
            }\n\n`));

            const newMessages: ChatCompletionMessageParam[] = [...messages];
            const assistantMessage: ChatCompletionMessageParam = {
              role: 'assistant',
              content: null,
              tool_calls: toolCalls
                .filter(tc => tc.id && tc.function?.name && tc.function.arguments)
                .map(tc => ({
                  id: tc.id!,
                  type: 'function',
                  function: {
                    name: tc.function!.name!,
                    arguments: tc.function!.arguments!,
                  },
                })),
            };
            newMessages.push(assistantMessage);

            for (const toolCall of toolCalls) {
              if (toolCall.id && toolCall.function?.name && toolCall.function.arguments) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                controller.enqueue(new TextEncoder().encode(`data: ${
                  JSON.stringify({
                    type: 'research_event',
                    ...emitEvent({
                      phase: 'tool_execute',
                      status: 'progress',
                      title: `Running ${functionName}`,
                    }),
                  })
                }\n\n`));

                const result = await executeTool(functionName, functionArgs);
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${
                      JSON.stringify({
                        type: 'tool_result',
                        tool_call_id: toolCall.id,
                        name: functionName,
                        result,
                      })
                    }\n\n`,
                  ),
                );
                newMessages.push({
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                });
              }
            }

            controller.enqueue(new TextEncoder().encode(`data: ${
              JSON.stringify({
                type: 'research_event',
                ...emitEvent({ phase: 'tool_execute', status: 'done', title: 'Tools complete' }),
              })
            }\n\n`));
            await run(newMessages);
          } else {
            controller.enqueue(new TextEncoder().encode(`data: ${
              JSON.stringify({
                type: 'research_event',
                ...emitEvent({ phase: 'llm_stream', status: 'done', title: 'Answer complete' }),
              })
            }\n\n`));
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          }
        };

        await run(initialMessages);
      } catch (error) {
        logger.error('Error in callAIStream', { error });
        const payload: ChatErrorEvent = {
          type: 'chat_error',
          sessionId,
          code: 'AI_STREAM_FAILED',
          message: 'An error occurred while generating the response.',
        };
        controller.enqueue(sseLine(payload));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    },
  });
}
