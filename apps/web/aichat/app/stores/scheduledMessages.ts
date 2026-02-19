import { defineStore } from 'pinia';

export interface ScheduledMessage {
  id: string;
  userId: string;
  conversationId: string;
  content: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  conversation?: {
    id: string;
    title: string;
  };
}

export const useScheduledMessagesStore = defineStore('scheduledMessages', () => {
  const scheduledMessages = ref<ScheduledMessage[]>([]);
  const loading = ref(false);

  const fetchScheduledMessages = async () => {
    loading.value = true;
    try {
      const data = await $fetch<ScheduledMessage[]>('/api/scheduled-messages');
      scheduledMessages.value = data;
    } catch (error) {
      console.error('Failed to fetch scheduled messages:', error);
    } finally {
      loading.value = false;
    }
  };

  const scheduleMessage = async (message: {
    conversationId: string;
    content: string;
    scheduledAt: string;
  }) => {
    try {
      const newMessage = await $fetch<ScheduledMessage>('/api/scheduled-messages', {
        method: 'POST',
        body: message,
      });
      scheduledMessages.value.push(newMessage);
      return newMessage;
    } catch (error) {
      console.error('Failed to schedule message:', error);
      throw error;
    }
  };

  const deleteScheduledMessage = async (id: string) => {
    try {
      await $fetch('/api/scheduled-messages', {
        method: 'DELETE',
        query: { id },
      });
      scheduledMessages.value = scheduledMessages.value.filter(m => m.id !== id);
    } catch (error) {
      console.error('Failed to delete scheduled message:', error);
    }
  };

  return {
    scheduledMessages,
    loading,
    fetchScheduledMessages,
    scheduleMessage,
    deleteScheduledMessage,
  };
});
