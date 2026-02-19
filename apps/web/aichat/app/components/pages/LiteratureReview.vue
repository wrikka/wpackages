<script setup lang="ts">


interface Paper {
  id: string;
  paperTitle: string;
  authors: string[];
  publicationYear?: number;
  summary: string;
  sourceUrl?: string;
}
interface LiteratureReviewSummaryData {
  type: 'literature_review_summary';
  topic: string;
  papers: Paper[];
}
defineProps<{ 
  summary: LiteratureReviewSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Literature Review: {{ summary.topic }}</h3>
    <div class="space-y-4">
      <div v-for="paper in summary.papers" :key="paper.id" class="p-3 bg-gray-50 rounded-md border-l-4 border-gray-300">
        <h4 class="font-semibold text-gray-800">{{ paper.paperTitle }}</h4>
        <p class="mt-1 text-xs text-gray-500">
          <span class="font-medium">{{ paper.authors.join(', ') }}</span> ({{ paper.publicationYear }})
        </p>
        <p class="mt-2 text-xs text-gray-600">{{ paper.summary }}</p>
        <a v-if="paper.sourceUrl" :href="paper.sourceUrl" target="_blank" rel="noopener noreferrer" 
           class="inline-block mt-2 text-xs font-medium text-blue-600 hover:underline">
          Read Paper
        </a>
      </div>
    </div>
  </div>

</template>