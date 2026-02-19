<script setup lang="ts">


interface TestFixSummary {
  type: 'test_fix_summary';
  suspectedCause: string;
  suggestedFixes: string[];
}
defineProps<{ summary: TestFixSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Test Fix Suggestions</h3>

    <p class="text-sm text-gray-700"><strong>Suspected cause:</strong> {{ summary.suspectedCause }}</p>

    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Suggested fixes</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(s, idx) in summary.suggestedFixes" :key="idx">{{ s }}</li>
      </ul>
    </div>
  </div>

</template>