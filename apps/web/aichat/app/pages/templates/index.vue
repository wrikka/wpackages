<script setup lang="ts">

import { useTemplatesStore } from '~/stores/templates';
import type { SavedPrompt } from '#shared/types/chat';

definePageMeta({
  middleware: 'auth',
  layout: 'default'
});

const templatesStore = useTemplatesStore();
const isEditorModalOpen = ref(false);
const isConfirmModalOpen = ref(false);
const selectedTemplate = ref<SavedPrompt | null>(null);
const templateToDelete = ref<SavedPrompt | null>(null);

onMounted(() => {
  templatesStore.fetchTemplates();
});

const onNewTemplate = () => {
  selectedTemplate.value = null;
  isEditorModalOpen.value = true;
};

const onEditTemplate = (template: SavedPrompt) => {
  selectedTemplate.value = template;
  isEditorModalOpen.value = true;
};

const onTemplateSaved = () => {
  templatesStore.fetchTemplates();
};

const openDeleteConfirm = (template: SavedPrompt) => {
  templateToDelete.value = template;
  isConfirmModalOpen.value = true;
};

const confirmDelete = async () => {
  if (templateToDelete.value) {
    await templatesStore.deleteTemplate(templateToDelete.value.id);
    isConfirmModalOpen.value = false;
    templateToDelete.value = null;
  }
};

</script>

<template>

  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Chat Templates</h1>
      <UButton @click="onNewTemplate">New Template</UButton>
    </div>

    <div v-if="templatesStore.isLoading">Loading...</div>
    <div v-else-if="templatesStore.templates.length > 0" class="space-y-4">
      <UCard v-for="template in templatesStore.templates" :key="template.id">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">{{ template.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ template.promptText.substring(0, 100) }}...</p>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" @click="onEditTemplate(template)">Edit</UButton>
            <UButton color="red" variant="ghost" @click="openDeleteConfirm(template)">Delete</UButton>
          </div>
        </div>
      </UCard>
    </div>
    <div v-else class="text-gray-500">No templates found. Create one to get started.</div>

        <TemplateEditorModal 
      v-model="isEditorModalOpen" 
      :template="selectedTemplate" 
      @saved="onTemplateSaved" 
    />

    <UModal v-model="isConfirmModalOpen">
      <UCard v-if="templateToDelete">
        <template #header>
          <h3 class="text-lg font-semibold">Delete Template</h3>
        
</template>