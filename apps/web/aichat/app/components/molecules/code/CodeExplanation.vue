<script setup lang="ts">


interface CodeExplanationSummary {
  type: 'code_explanation_summary';
  language: string;
  explanation: string;
  keyPoints: string[];
  code: string;
}
defineProps<{ summary: CodeExplanationSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Code Explanation</h3>
    <p class="text-sm text-gray-700"><strong>Language:</strong> {{ summary.language }}</p>

    <p class="mt-3 text-sm text-gray-800">{{ summary.explanation }}</p>

    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Key points</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(p, idx) in summary.keyPoints" :key="idx">{{ p }}</li>
      </ul>
    </div>

    <div v-if="summary.code" class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Code</h4>
      <pre class="mt-2 p-2 text-xs bg-gray-900 text-white rounded"><code>{{ summary.code }}</code></pre>
    </div>
  </div>

</template>