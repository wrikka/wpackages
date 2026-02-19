<script setup lang="ts">

import CodeBlock from '~/components/molecules/code/CodeBlock.vue';

interface ApiIntegrationSummaryData {
  type: 'api_integration_summary';
  apiName: string;
  clientCode: string;
  usageExample: string;
}

defineProps<{ 
  summary: ApiIntegrationSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">API Integration Assistant: {{ summary.apiName }}</h3>
    
    <div class="mb-4">
      <p class="mb-2 text-sm font-medium text-gray-700">Client Setup Code:</p>
      <CodeBlock 
        :language="'typescript'" 
        :originalCode="summary.clientCode"
        :refactoredCode="summary.clientCode"
        :explanation="''"
        :snippetId="''" 
      />
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-gray-700">Usage Example:</p>
      <CodeBlock 
        :language="'typescript'" 
        :originalCode="summary.usageExample"
        :refactoredCode="summary.usageExample"
        :explanation="''"
        :snippetId="''" 
      />
    </div>
  </div>

</template>