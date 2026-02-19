import type { Message } from '#shared/types/chat';

export const useMessagePinning = () => {
  const messagesStore = useMessagesStore();
  const toast = useToast();

  const togglePin = async (message: Message) => {
    try {
      const updatedMessage = await $fetch<{ id: string; isPinned: boolean }>(
        `/api/messages/${message.id}/pin`,
        {
          method: 'POST',
        },
      );
      messagesStore.updateMessage(message.id, { isPinned: updatedMessage.isPinned });
    } catch (_error) {
      toast.add({
        color: 'red',
        title: 'Error',
        description: 'Failed to update pin status. Please try again.',
      });
    }
  };

  return {
    togglePin,
  };
};
