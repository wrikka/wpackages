<script setup lang="ts">

import { usePromptStore } from '~/stores/promptStore';
import { IconHelpCircle } from '@tabler/icons-vue';

const store = usePromptStore();
const currentRequest = computed(() => store.currentRequest);
const handleResponse = (response: string) => {
  if (currentRequest.value) {
    store.resolveRequest(currentRequest.value.id, response);
  }
};

</script>

<template>

  <div v-if="currentRequest" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
    <div class="w-full max-w-lg bg-gray-800 rounded-lg shadow-2xl text-white p-6">
      <div class="flex items-start mb-4">
        <Icon name="lucide:help-circle" class="h-8 w-8 text-blue-400 mr-4 flex-shrink-0" />
        <div>
          <h2 class="text-2xl font-bold">Agent Needs Help</h2>
          <p class="text-gray-400">The agent encountered a situation it's unsure how to handle.</p>
        </div>
      </div>

      <div class="bg-gray-900 p-4 rounded-md mb-6">
        <p class="font-semibold">{{ currentRequest.question }}</p>
        <p v-if="currentRequest.context" class="text-sm text-gray-400 mt-2">Context: {{ currentRequest.context }}</p>
      </div>

      <div class="flex flex-col space-y-3">
        <button 
          v-for="option in currentRequest.options"
          :key="option"
          @click="handleResponse(option)"
          class="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-md text-center font-bold transition-colors"
        >
          {{ option }}
        </button>
      </div>
    </div>
  </div>

</template>