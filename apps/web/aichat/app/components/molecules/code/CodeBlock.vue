<script setup lang="ts">

import { ref, computed } from 'vue';
import { useClipboard } from '@vueuse/core';
import { Codemirror } from 'vue-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';

const props = defineProps<{
  snippetId: string;
  language: string;
  originalCode: string;
  refactoredCode: string;
  explanation: string;
}>();
const emit = defineEmits(['profile-performance', 'generate-docs', 'generate-tests']);
const view = ref<'original' | 'refactored'>('refactored');
const currentCode = computed(() => {
  return view.value === 'original' ? props.originalCode : props.refactoredCode;
});
const { copy } = useClipboard();
const buttonText = ref('Copy');
const extensions = computed(() => {
  const langExt = [];
  switch (props.language?.toLowerCase()) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
      langExt.push(javascript());
      break;
    // Add other languages here as needed
    default:
      break;
  }
  return [
    ...langExt,
    oneDark,
    EditorView.lineWrapping,
    EditorView.editable.of(false),
  ];
});
const onCopy = () => {
  copy(currentCode.value);
  buttonText.value = 'Copied!';
  setTimeout(() => {
    buttonText.value = 'Copy';
  }, 2000);
};

</script>

<template>

  <div class="my-4 bg-gray-900 border border-gray-700 rounded-lg shadow-sm text-sm">
    <div class="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <span class="text-xs font-semibold text-gray-400">{{ language.toUpperCase() }}</span>
        <div class="bg-gray-700 rounded-md p-0.5 flex space-x-1">
          <button 
            @click="view = 'refactored'" 
            :class="[
              'px-2 py-0.5 text-xs rounded', 
              view === 'refactored' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-300 hover:bg-gray-600'
            ]"
          >
            Refactored
          </button>
          <button 
            @click="view = 'original'" 
            :class="[
              'px-2 py-0.5 text-xs rounded', 
              view === 'original' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-300 hover:bg-gray-600'
            ]"
          >
            Original
          </button>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="emit('profile-performance', snippetId)" 
          class="px-2 py-1 text-xs text-gray-300 bg-yellow-700 rounded hover:bg-yellow-600"
        >
          Profile
        </button>
        <button 
          @click="emit('generate-docs', snippetId)" 
          class="px-2 py-1 text-xs text-gray-300 bg-purple-700 rounded hover:bg-purple-600"
        >
          Generate Docs
        </button>
        <button 
          @click="emit('generate-tests', snippetId)" 
          class="px-2 py-1 text-xs text-gray-300 bg-green-700 rounded hover:bg-green-600"
        >
          Generate Tests
        </button>
        <button 
          @click="onCopy" 
          class="px-2 py-1 text-xs text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>

    <div class="code-container overflow-x-auto">
      <Codemirror
        :model-value="currentCode"
        :extensions="extensions"
        :disabled="true"
        :style="{ backgroundColor: '#282c34' }"
      />
    </div>

    <div v-if="explanation" class="px-4 py-3 text-xs text-gray-400 bg-gray-800 border-t border-gray-700">
      <p><span class="font-semibold">Explanation:</span> {{ explanation }}</p>
    </div>
  </div>

</template>

<style scoped>

.code-container :deep(.cm-editor) {
  background-color: #282c34;
}

.code-container :deep(.cm-gutters) {
  background-color: #282c34;
  border-right: 1px solid #3a3f4b;
}

</style>