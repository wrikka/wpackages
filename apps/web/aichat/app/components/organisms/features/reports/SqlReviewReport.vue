<script setup lang="ts">


interface SqlIssue {
  title: string;
  severity: 'low' | 'medium' | 'high';
  details: string;
}
interface SqlReviewSummary {
  type: 'sql_review_summary';
  issues: SqlIssue[];
  improvedSql?: string;
  sql: string;
}
defineProps<{ summary: SqlReviewSummary }>();
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
    <h3 class="mb-2 text-lg font-semibold text-gray-800">SQL Review</h3>

    <div v-if="summary.issues?.length" class="mt-3 space-y-2">
      <div v-for="(i, idx) in summary.issues" :key="idx" class="p-3 rounded border" :class="severityClass(i.severity)">
        <p class="text-sm font-medium">{{ i.title }}</p>
        <p class="mt-1 text-xs text-gray-700">{{ i.details }}</p>
      </div>
    </div>
    <p v-else class="mt-2 text-sm text-green-700">No issues detected.</p>

    <div v-if="summary.improvedSql" class="mt-4">
      <h4 class="text-sm font-semibold text-gray-800">Improved SQL</h4>
      <pre class="mt-2 p-2 text-xs bg-gray-900 text-white rounded"><code>{{ summary.improvedSql }}</code></pre>
    </div>
  </div>

</template>