<script setup lang="ts">


interface CitationItem {
  title: string;
  author: string;
  year: number;
  url?: string;
  citation: string;
}
interface CitationsSummary {
  type: 'citations_summary';
  style: string;
  citations: CitationItem[];
}
defineProps<{ summary: CitationsSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Citations</h3>
    <p class="text-sm text-gray-700"><strong>Style:</strong> {{ summary.style }}</p>

    <div class="mt-3 space-y-2">
      <div v-for="(c, idx) in summary.citations" :key="idx" class="p-3 bg-gray-50 rounded">
        <p class="text-sm font-medium text-gray-800">{{ c.title }}</p>
        <p class="text-xs text-gray-600">{{ c.author }} ({{ c.year }})</p>
        <p class="mt-2 text-sm text-gray-800">{{ c.citation }}</p>
        <a v-if="c.url" :href="c.url" target="_blank" class="text-xs text-blue-600 hover:underline">{{ c.url }}</a>
      </div>
    </div>
  </div>

</template>