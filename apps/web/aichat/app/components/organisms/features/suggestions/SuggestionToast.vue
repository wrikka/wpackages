<script setup lang="ts">

import { useSuggestionStore } from '~/stores/suggestionStore';
import { IconBulb, IconCheck, IconX } from '@tabler/icons-vue';

const store = useSuggestionStore();
const currentSuggestion = computed(() => store.currentSuggestion);
const handleAccept = () => {
  if (currentSuggestion.value) {
    store.acceptSuggestion(currentSuggestion.value.id);
  }
};
const handleDismiss = () => {
  if (currentSuggestion.value) {
    store.dismissSuggestion(currentSuggestion.value.id);
  }
};

</script>

<template>

  <div v-if="currentSuggestion" class="fixed bottom-5 left-5 z-50 w-full max-w-sm bg-gray-800 border border-blue-500 rounded-lg shadow-2xl text-white p-4 transform transition-all animate-fade-in-up">
    <div class="flex items-start">
      <Icon name="lucide:lightbulb" class="h-7 w-7 text-yellow-400 mr-3 flex-shrink-0" />
      <div>
        <h3 class="font-bold">Intelligent Suggestion</h3>
        <p class="text-sm text-gray-300 mt-1">{{ currentSuggestion.text }}</p>
      </div>
    </div>
    <div class="flex justify-end space-x-3 mt-4">
      <button @click="handleDismiss" class="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-md flex items-center">
        <Icon name="lucide:x" class="h-4 w-4 mr-1" />
        Dismiss
      </button>
      <button @click="handleAccept" class="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-md font-bold flex items-center">
        <Icon name="lucide:check" class="h-4 w-4 mr-1" />
        Automate
      </button>
    </div>
  </div>

</template>