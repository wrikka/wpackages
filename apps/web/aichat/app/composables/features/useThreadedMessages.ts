import type { Message } from '#shared/types/chat';

export interface ThreadedMessage extends Message {
  children: ThreadedMessage[];
}

export const useThreadedMessages = (messages: Ref<Message[]>) => {
  const threadedMessages = computed(() => {
    const messageMap = new Map<string, ThreadedMessage>();
    const rootMessages: ThreadedMessage[] = [];

    // First pass: create map and add children array
    for (const message of messages.value) {
      messageMap.set(message.id, { ...message, children: [] });
    }

    // Second pass: build the tree
    for (const message of messageMap.values()) {
      if (message.parentMessageId && messageMap.has(message.parentMessageId)) {
        messageMap.get(message.parentMessageId)!.children.push(message);
      } else {
        rootMessages.push(message);
      }
    }

    // Optional: Sort children by timestamp
    for (const message of messageMap.values()) {
      message.children.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    return rootMessages.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  return {
    threadedMessages,
  };
};
