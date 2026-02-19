import type { Message } from '#shared/types/chat';
import type { UploadedAttachment } from './useMessageUpload';

const PLACEHOLDER_REMOVAL_OFFSET = 1;

export const useMessageAPI = () => {
  const messagesStore = useMessagesStore();

  const createUserMessage = async (
    sessionId: string,
    content: string,
    options: {
      parentMessageId?: string;
      attachmentIds?: string[];
      uploadedAttachments?: UploadedAttachment[];
      mentions?: string[];
    },
  ): Promise<Message> => {
    const userMessage = await $fetch<Message>(`/api/sessions/${sessionId}/messages`, {
      body: {
        attachmentIds: options.attachmentIds,
        content,
        mentions: options.mentions,
        parentMessageId: options.parentMessageId,
        role: 'user',
      },
      method: 'POST',
    });

    messagesStore.addMessage({
      ...userMessage,
      attachments: options.uploadedAttachments || [],
    });

    return userMessage;
  };

  const createAssistantMessage = async (options: {
    sessionId: string;
    content: string;
    parentMessageId: string;
    toolCalls?: any[];
    toolResults?: Record<string, unknown>;
  }): Promise<Message> => {
    const finalAssistantMessage = await $fetch<Message>(
      `/api/sessions/${options.sessionId}/messages`,
      {
        body: {
          attachmentIds: [],
          content: options.content,
          parentMessageId: options.parentMessageId,
          role: 'assistant',
          tool_calls: options.toolCalls?.filter(Boolean),
          tool_results: options.toolResults,
        },
        method: 'POST',
      },
    );

    messagesStore.addMessage(finalAssistantMessage);
    return finalAssistantMessage;
  };

  const addPlaceholderMessage = (sessionId: string, parentMessageId: string): string => {
    const assistantMessageId = Date.now().toString();
    messagesStore.addMessage({
      chatSessionId: sessionId,
      content: '...',
      id: assistantMessageId,
      parentMessageId,
      role: 'assistant',
      timestamp: new Date(),
    });
    return assistantMessageId;
  };

  const removePlaceholderMessage = (messageId: string) => {
    const placeholderIndex = messagesStore.allMessages.findIndex(message =>
      message.id === messageId
    );
    const NOT_FOUND = -1;
    if (placeholderIndex !== NOT_FOUND) {
      messagesStore.allMessages.splice(placeholderIndex, PLACEHOLDER_REMOVAL_OFFSET);
    }
  };

  return {
    addPlaceholderMessage,
    createAssistantMessage,
    createUserMessage,
    removePlaceholderMessage,
  };
};
