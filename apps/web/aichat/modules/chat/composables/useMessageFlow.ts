import type { ChatMode } from '#shared/types/common';
import type { Message } from '#shared/types/message';

const LAST_MESSAGE_INDEX = -1;
const MENTION_GROUP_INDEX = 1;

export const useMessageFlow = () => {
  const sessionsStore = useSessionsStore();
  const messagesStore = useMessagesStore();
  const chatUIStore = useChatUIStore();
  const chatEventsStore = useChatEventsStore();
  const toast = useToast();
  const { stopGenerating, handleSSEStream } = useSSEHandler();
  const { uploadFiles } = useMessageUpload();
  const {
    createUserMessage,
    createAssistantMessage,
    addPlaceholderMessage,
    removePlaceholderMessage,
  } = useMessageAPI();

  const sendMessage = async (
    messageContent: string,
    options?: {
      parentMessageId?: string;
      files?: File[];
      mode?: ChatMode;
      model?: string;
      systemPrompt?: string;
    },
  ): Promise<void> => {
    if (!messageContent.trim()) {
      return;
    }

    let session = sessionsStore.currentSession;
    if (!session) {
      session = await sessionsStore.createSession({});
    }
    const sessionId = session.id;

    if (options?.mode === 'research' || options?.mode === 'agent') {
      chatEventsStore.clearResearchEvents(sessionId);
    }

    chatEventsStore.clearChatErrors(sessionId);

    if (options?.model && session.model !== options.model) {
      session.model = options.model;
    }

    chatUIStore.isLoading = true;
    chatUIStore.isTyping = true;

    const lastMessageId = messagesStore.messages.at(LAST_MESSAGE_INDEX)?.id;
    const { attachmentIds, uploadedAttachments } = await uploadFiles(options?.files || []);

    const mentionRegex = /@(\w+)/g;
    const mentions = [...messageContent.matchAll(mentionRegex)].map(match =>
      match[MENTION_GROUP_INDEX]
    );

    const userMessage = await createUserMessage(sessionId, messageContent, {
      attachmentIds,
      mentions,
      parentMessageId: options?.parentMessageId || lastMessageId,
      uploadedAttachments,
    });

    const assistantMessageId = addPlaceholderMessage(sessionId, userMessage.id);

    try {
      stopGenerating();
      const controller = new AbortController();

      const response = await fetch('/api/chat', {
        body: JSON.stringify({
          attachmentIds,
          message: messageContent,
          mode: options?.mode,
          model: options?.model,
          systemPrompt: options?.systemPrompt,
          sessionId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      });

      const { content, toolCalls, toolResults } = await handleSSEStream(response, {
        onChatError: (error) => {
          toast.add({
            color: 'red',
            description: error.message || 'Something went wrong.',
            title: 'Error',
          });
        },
        onContentChunk: (chunk) => {
          messagesStore.updateMessageContent(assistantMessageId, chunk);
        },
        onResearchEvent: (event) => {
          chatEventsStore.addResearchEvent(event);
        },
      });

      removePlaceholderMessage(assistantMessageId);

      const _assistantMessage = await createAssistantMessage({
        sessionId,
        content,
        parentMessageId: userMessage.id,
        toolCalls,
        toolResults,
      });

      // Generate title for new chats after the first exchange
      if (
        session && messagesStore.messages.length === 2
        && (session.title === 'New Chat' || !session.title)
      ) {
        try {
          const summary = await $fetch(`/api/sessions/${sessionId}/summarize`, { method: 'POST' });
          if (summary.title) {
            sessionsStore.updateSession(sessionId, { title: summary.title });
          }
        } catch (e) {
          console.error('Failed to generate session title', e);
        }
      }
    } catch (error) {
      const isAborted = error instanceof DOMException && error.name === 'AbortError';
      if (!isAborted) {
        toast.add({
          color: 'red',
          description: 'Failed to send message. Please try again.',
          title: 'Error',
        });
        messagesStore.updateMessageContent(
          assistantMessageId,
          'Sorry, something went wrong. Please try again.',
        );
      } else {
        messagesStore.updateMessageContent(assistantMessageId, 'Stopped.');
      }
    } finally {
      chatUIStore.isLoading = false;
      chatUIStore.isTyping = false;
    }
  };

  const regenerateResponse = async () => {
    const lastUserMessage = [...messagesStore.messages].reverse().find(message =>
      message.role === 'user'
    );

    if (lastUserMessage?.content && sessionsStore.currentSession) {
      const lastAssistantMessage = messagesStore.messages.at(LAST_MESSAGE_INDEX);
      if (lastAssistantMessage?.role === 'assistant') {
        await messagesStore.deleteMessage(sessionsStore.currentSession.id, lastAssistantMessage.id);
      }
      await sendMessage(lastUserMessage.content, {
        parentMessageId: lastUserMessage.parentMessageId
          ? lastUserMessage.parentMessageId
          : undefined,
      });
    }
  };

  const editAndResend = async (message: Message, newContent: string) => {
    if (!sessionsStore.currentSession) {
      return;
    }
    await messagesStore.deleteMessage(sessionsStore.currentSession.id, message.id);
    await sendMessage(newContent, {
      parentMessageId: message.parentMessageId ? message.parentMessageId : undefined,
    });
  };

  const forkAndSendMessage = async (message: Message, newContent: string) => {
    await sendMessage(newContent, { parentMessageId: message.id });
  };

  return {
    editAndResend,
    forkAndSendMessage,
    regenerateResponse,
    sendMessage,
    stopGenerating,
  };
};
