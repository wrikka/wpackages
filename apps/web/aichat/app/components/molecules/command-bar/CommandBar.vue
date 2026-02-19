<script setup lang="ts">

import { ref, computed } from 'vue';
import { useCommandBarStore } from '~/stores/commandBarStore';
import { IconSearch, IconMicrophone, IconX } from '@tabler/icons-vue';

const store = useCommandBarStore();
const inputValue = ref('');
const suggestions = computed(() => {
  if (!inputValue.value) {
    return [
      { id: 1, title: 'Summarize my last meeting', category: 'Common Tasks' },
      { id: 2, title: 'Create a new spreadsheet', category: 'Common Tasks' },
    ];
  }
  // TODO: Implement actual suggestion logic
  return [
    { id: 3, title: `Search for "${inputValue.value}"`, category: 'Web' },
    { id: 4, title: `Run workflow: "${inputValue.value}"`, category: 'Workflows' },
  ];
});
const handleSubmit = () => {
  if (!inputValue.value) return;
  console.log('Executing command:', inputValue.value);
  store.hide();
  inputValue.value = '';
};
const handleClose = () => {
  store.hide();
  inputValue.value = '';
};

</script>

<template>

  <div v-if="store.isVisible" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start pt-20">
    <div class="w-full max-w-2xl bg-gray-800 rounded-lg shadow-2xl text-white transform transition-all" role="dialog">
      <div class="flex items-center p-4 border-b border-gray-700">
        <IconSearch class="h-5 w-5 text-gray-400 mr-3" />
        <input
          v-model="inputValue"
          type="text"
          placeholder="What can I do for you? (e.g., 'Summarize today's emails')"
          class="w-full bg-transparent focus:outline-none text-lg"
          @keydown.enter="handleSubmit"
          @keydown.esc="handleClose"
        />
        <button class="p-2 hover:bg-gray-700 rounded-full">
          <IconMicrophone class="h-5 w-5 text-gray-400" />
        </button>
        <button @click="handleClose" class="p-2 ml-2 hover:bg-gray-700 rounded-full">
          <IconX class="h-5 w-5 text-gray-400" />
        </button>
      </div>
      <div class="p-4 max-h-96 overflow-y-auto">
        <ul>
          <li v-for="suggestion in suggestions" :key="suggestion.id" class="p-3 flex justify-between items-center hover:bg-gray-700 rounded-md cursor-pointer">
            <span>{{ suggestion.title }}</span>
            <span class="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">{{ suggestion.category }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>