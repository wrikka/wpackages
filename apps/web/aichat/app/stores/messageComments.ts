import type { MessageComment } from '#shared/types/chat';
import { defineStore } from 'pinia';

export const useMessageCommentsStore = defineStore('messageComments', {
  state: () => ({
    comments: {} as Record<string, MessageComment[]>, // messageId -> comments
    isLoading: false,
  }),
  actions: {
    async fetchComments(messageId: string) {
      this.isLoading = true;
      try {
        const data = await $fetch<MessageComment[]>(`/api/messages/${messageId}/comments`);
        this.comments[messageId] = data;
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async addComment(messageId: string, content: string) {
      const newComment = await $fetch<MessageComment>(`/api/messages/${messageId}/comments`, {
        method: 'POST',
        body: { content },
      });
      if (!this.comments[messageId]) {
        this.comments[messageId] = [];
      }
      this.comments[messageId].push(newComment);
    },
    async updateComment(messageId: string, commentId: string, content: string) {
      const updatedComment = await $fetch<MessageComment>(
        `/api/messages/${messageId}/comments/${commentId}`,
        {
          method: 'PUT',
          body: { content },
        },
      );
      const index = this.comments[messageId]?.findIndex(c => c.id === commentId);
      if (index !== -1 && this.comments[messageId]) {
        this.comments[messageId][index] = updatedComment;
      }
    },
    async deleteComment(messageId: string, commentId: string) {
      await $fetch(`/api/messages/${messageId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (this.comments[messageId]) {
        this.comments[messageId] = this.comments[messageId].filter(c => c.id !== commentId);
      }
    },
  },
});
