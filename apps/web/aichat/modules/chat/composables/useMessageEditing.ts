import type { Message } from '#shared/types/chat';

export function useMessageEditing() {
  const editingMessage = ref<Message | null>(null);
  const editingContent = ref('');

  function startEditing(message: Message) {
    editingMessage.value = message;
    editingContent.value = message.content ?? '';
  }

  function cancelEditing() {
    editingMessage.value = null;
    editingContent.value = '';
  }

  return {
    editingMessage,
    editingContent,
    startEditing,
    cancelEditing,
  };
}
