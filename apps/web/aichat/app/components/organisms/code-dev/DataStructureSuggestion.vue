<script setup lang="ts">

import CodeBlock from '~/components/CodeBlock.vue';

interface DataStructureSummaryData {
  type: 'data_structure_summary';
  problemDescription: string;
  suggestedStructure: string;
  pros: string[];
  cons: string[];
  codeExample: string;
}
defineProps<{ 
  summary: DataStructureSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Data Structure Suggester</h3>
    <p class="mb-4 text-sm text-gray-500">For your problem: "<span class="italic">{{ summary.problemDescription }}</span>"</p>

    <div class="p-3 bg-gray-50 rounded-md">
      <p class="text-sm font-medium text-gray-700">Suggested Structure:</p>
      <p class="text-xl font-bold mt-1 text-blue-600">{{ summary.suggestedStructure }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <h4 class="text-sm font-semibold text-green-700">Pros</h4>
        <ul class="mt-2 text-xs list-disc list-inside text-green-600 space-y-1">
          <li v-for="(pro, index) in summary.pros" :key="index">{{ pro }}</li>
        </ul>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-red-700">Cons</h4>
        <ul class="mt-2 text-xs list-disc list-inside text-red-600 space-y-1">
          <li v-for="(con, index) in summary.cons" :key="index">{{ con }}</li>
        </ul>
      </div>
    </div>

    <div class="mt-4">
        <p class="mb-2 text-sm font-medium text-gray-700">Code Example:</p>
        <CodeBlock 
          :language="'typescript'" 
          :originalCode="summary.codeExample"
          :refactoredCode="summary.codeExample"
          :explanation="''"
          :snippetId="''" 
        />
    </div>
  </div>

</template>