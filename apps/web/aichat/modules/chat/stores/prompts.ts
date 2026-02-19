import { defineStore } from 'pinia';

interface Prompt {
  id: string;
  name: string;
  promptText: string;
  scope: 'personal' | 'group';
  groupId?: string;
}

export const usePromptsStore = defineStore('prompts', () => {
  const prompts = ref<Prompt[]>([]);
  const isLoading = ref(false);

  const fetchPrompts = async () => {
    if (prompts.value.length > 0) return;

    isLoading.value = true;
    try {
      const data = await $fetch<Prompt[]>('/api/prompts');
      prompts.value = data;
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    prompts,
    isLoading,
    fetchPrompts,
    async createPrompt(prompt: Omit<Prompt, 'id'>) {
      try {
        const newPrompt = await $fetch<Prompt>('/api/prompts', {
          method: 'POST',
          body: prompt,
        });
        prompts.value.push(newPrompt);
      } catch (error) {
        console.error('Failed to create prompt:', error);
      }
    },
    async updatePrompt(id: string, updates: Partial<Prompt>) {
      try {
        const updatedPrompt = await $fetch<Prompt>(`/api/prompts/${id}`, {
          method: 'PUT',
          body: updates,
        });
        const index = prompts.value.findIndex(p => p.id === id);
        if (index !== -1) {
          prompts.value[index] = updatedPrompt;
        }
      } catch (error) {
        console.error('Failed to update prompt:', error);
      }
    },
    async deletePrompt(id: string) {
      try {
        await $fetch(`/api/prompts/${id}`, { method: 'DELETE' });
        prompts.value = prompts.value.filter(p => p.id !== id);
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    },
  };
});
