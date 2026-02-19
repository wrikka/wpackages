<script setup lang="ts">


interface LogAnalysisSummary {
  type: 'log_analysis_summary';
  summary: string;
  rootCauses: string[];
  actions: string[];
}
defineProps<{ summary: LogAnalysisSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Log Analysis</h3>

    <p class="text-sm text-gray-800">{{ summary.summary }}</p>

    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Root causes</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(c, idx) in summary.rootCauses" :key="idx">{{ c }}</li>
      </ul>
    </div>

    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Recommended actions</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(a, idx) in summary.actions" :key="idx">{{ a }}</li>
      </ul>
    </div>
  </div>

</template>