<script setup lang="ts">


interface PrivacyFinding {
  title: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
}
interface PrivacyReviewSummary {
  type: 'privacy_review_summary';
  findings: PrivacyFinding[];
  recommendations: string[];
}
defineProps<{ summary: PrivacyReviewSummary }>();
const severityClass = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-50 border-red-200';
    case 'medium':
      return 'bg-yellow-50 border-yellow-200';
    case 'low':
      return 'bg-blue-50 border-blue-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Privacy Review</h3>

    <div class="mt-3">
      <h4 class="text-sm font-semibold text-gray-800">Findings</h4>
      <div v-if="summary.findings?.length" class="mt-2 space-y-2">
        <div v-for="(f, idx) in summary.findings" :key="idx" class="p-3 rounded border" :class="severityClass(f.severity)">
          <p class="text-sm font-medium">{{ f.title }}</p>
          <p class="mt-1 text-xs text-gray-700">{{ f.details }}</p>
        </div>
      </div>
      <p v-else class="mt-2 text-sm text-green-700">No obvious privacy issues detected.</p>
    </div>

    <div class="mt-4">
      <h4 class="text-sm font-semibold text-gray-800">Recommendations</h4>
      <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
        <li v-for="(r, idx) in summary.recommendations" :key="idx">{{ r }}</li>
      </ul>
    </div>
  </div>

</template>