<script setup lang="ts">

import { ref, onMounted } from 'vue';
import { usePromptsStore } from '~/stores/prompts';

interface Prompt {
  id: string;
  name: string;
  promptText: string;
  scope: 'personal' | 'group';
  groupId?: string;
}

const promptsStore = usePromptsStore();
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentPrompt = ref<Partial<Prompt>>({});

onMounted(() => {
  promptsStore.fetchPrompts();
});

const resetCurrentPrompt = () => {
  isEditing.value = false;
  currentPrompt.value = { name: '', promptText: '', scope: 'personal' };
};

const editPrompt = (prompt: Prompt) => {
  isEditing.value = true;
  currentPrompt.value = { ...prompt };
  isModalOpen.value = true;
};

const savePrompt = async () => {
  if (isEditing.value && currentPrompt.value.id) {
    await promptsStore.updatePrompt(currentPrompt.value.id, currentPrompt.value);
  } else {
    await promptsStore.createPrompt(currentPrompt.value as Omit<Prompt, 'id'>);
  }
  isModalOpen.value = false;
  resetCurrentPrompt();
};

const deletePrompt = async (id: string) => {
  if (confirm('Are you sure you want to delete this prompt?')) {
    await promptsStore.deletePrompt(id);
  }
};

watch(isModalOpen, (newValue) => {
  if (!newValue) {
    resetCurrentPrompt();
  }
});

</script>

<template>

  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Prompt Library</h1>
    
    <UButton @click="isModalOpen = true">Create New Prompt</UButton>

    <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="prompt in promptsStore.prompts" :key="prompt.id">
        <template #header>
          <h3 class="font-bold">{{ prompt.name }}</h3>
        
</template>