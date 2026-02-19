<script setup lang="ts">

import CodeBlock from '../atoms/CodeBlock.vue';

interface CodeTranslationSummaryData {
  type: 'code_translation_summary';
  sourceLanguage: string;
  targetLanguage: string;
  sourceCode: string;
  translatedCode: string;
}
defineProps<{ 
  summary: CodeTranslationSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Code Translation</h3>
    <p class="mb-4 text-sm text-gray-500">Translated from <span class="font-semibold">{{ summary.sourceLanguage }}</span> to <span class="font-semibold">{{ summary.targetLanguage }}</span>.</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p class="mb-2 text-sm font-medium text-gray-700">Original Code:</p>
        <CodeBlock 
          :language="summary.sourceLanguage" 
          :originalCode="summary.sourceCode"
          :refactoredCode="summary.sourceCode"
          :explanation="''"
          :snippetId="''" 
        />
      </div>
      <div>
        <p class="mb-2 text-sm font-medium text-gray-700">Translated Code:</p>
        <CodeBlock 
          :language="summary.targetLanguage" 
          :originalCode="summary.translatedCode"
          :refactoredCode="summary.translatedCode"
          :explanation="''"
          :snippetId="''" 
        />
      </div>
    </div>
  </div>

</template>