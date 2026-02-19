<script setup lang="ts">

import { ref } from 'vue';
import { useClipboard } from '@vueuse/core';

interface RegexBuilderSummaryData {
  type: 'regex_builder_summary';
  description: string;
  regex: string;
  explanation: string;
}
const props = defineProps<{ 
  summary: RegexBuilderSummaryData 
}>();
const { copy } = useClipboard();
const buttonText = ref('Copy');
const onCopy = () => {
  copy(props.summary.regex);
  buttonText.value = 'Copied!';
  setTimeout(() => {
    buttonText.value = 'Copy';
  }, 2000);
};

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Regular Expression Builder</h3>
    <p class="mb-4 text-sm text-gray-500">For your description: "<span class="italic">{{ summary.description }}</span>"</p>

    <div class="relative p-3 bg-gray-900 text-white rounded-md font-mono text-sm">
      {{ summary.regex }}
      <button @click="onCopy" class="absolute top-2 right-2 px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded hover:bg-gray-600">
        {{ buttonText }}
      </button>
    </div>

    <div class="mt-4">
      <p class="text-sm font-medium text-gray-700">Explanation:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.explanation }}</p>
    </div>
  </div>

</template>