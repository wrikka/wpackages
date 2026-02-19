import type { KnowledgeBase } from '#shared/types/chat';
import { defineStore } from 'pinia';

export const useKnowledgeBasesStore = defineStore('knowledgeBases', {
  state: () => ({
    knowledgeBases: [] as KnowledgeBase[],
    isLoading: false,
  }),
  actions: {
    async fetchKbs() {
      this.isLoading = true;
      try {
        this.knowledgeBases = await $fetch<KnowledgeBase[]>('/api/knowledge-bases');
      } catch (error) {
        console.error('Failed to fetch knowledge bases:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async createKb(data: { name: string; description?: string }) {
      const newKb = await $fetch<KnowledgeBase>('/api/knowledge-bases', {
        method: 'POST',
        body: data,
      });
      this.knowledgeBases.push(newKb);
      return newKb;
    },
    async updateKb(id: string, data: { name?: string; description?: string }) {
      const updatedKb = await $fetch<KnowledgeBase>(`/api/knowledge-bases/${id}`, {
        method: 'PUT',
        body: data,
      });
      const index = this.knowledgeBases.findIndex(kb => kb.id === id);
      if (index !== -1) {
        this.knowledgeBases[index] = updatedKb;
      }
      return updatedKb;
    },
    async deleteKb(id: string) {
      await $fetch(`/api/knowledge-bases/${id}`, {
        method: 'DELETE',
      });
      this.knowledgeBases = this.knowledgeBases.filter(kb => kb.id !== id);
    },
    async addSource(kbId: string, source: { type: 'file' | 'url'; uri: string }) {
      // This will be implemented later, for now just a placeholder
      console.log(`Adding source to ${kbId}:`, source);
    },
    async removeSource(kbId: string, sourceId: string) {
      // This will be implemented later, for now just a placeholder
      console.log(`Removing source ${sourceId} from ${kbId}`);
    },
  },
});
