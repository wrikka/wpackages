import type { SavedPrompt } from '#shared/types/chat';
import { defineStore } from 'pinia';

export const useTemplatesStore = defineStore('templates', {
  state: () => ({
    templates: [] as SavedPrompt[],
    isLoading: false,
  }),
  actions: {
    async fetchTemplates() {
      this.isLoading = true;
      try {
        this.templates = await $fetch<SavedPrompt[]>('/api/templates');
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async createTemplate(data: Omit<SavedPrompt, 'id' | 'userId' | 'organizationId'>) {
      const newTemplate = await $fetch<SavedPrompt>('/api/templates', {
        method: 'POST',
        body: data,
      });
      this.templates.push(newTemplate);
      return newTemplate;
    },
    async updateTemplate(
      id: string,
      data: Partial<Omit<SavedPrompt, 'id' | 'userId' | 'organizationId'>>,
    ) {
      const updatedTemplate = await $fetch<SavedPrompt>(`/api/templates/${id}`, {
        method: 'PUT',
        body: data,
      });
      const index = this.templates.findIndex(t => t.id === id);
      if (index !== -1) {
        this.templates[index] = updatedTemplate;
      }
      return updatedTemplate;
    },
    async deleteTemplate(id: string) {
      await $fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      this.templates = this.templates.filter(t => t.id !== id);
    },
  },
});
