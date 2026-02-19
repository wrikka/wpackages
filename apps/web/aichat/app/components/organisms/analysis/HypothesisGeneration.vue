<script setup lang="ts">


interface HypothesisSummaryData {
  type: 'hypothesis_summary';
  topic: string;
  hypothesis: string;
  validationApproach: string;
}
defineProps<{ 
  summary: HypothesisSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-purple-800">Hypothesis Generation</h3>
    <p class="mb-4 text-sm text-gray-500">For the topic: "<span class="italic">{{ summary.topic }}</span>"</p>

    <div class="mb-4">
      <p class="text-sm font-medium text-gray-700">Generated Hypothesis:</p>
      <blockquote class="p-2 mt-1 text-xs text-purple-800 bg-purple-100 rounded border-l-2 border-purple-300">
        {{ summary.hypothesis }}
      </blockquote>
    </div>

    <div>
      <p class="text-sm font-medium text-gray-700">Suggested Validation Approach:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.validationApproach }}</p>
    </div>
  </div>

</template>