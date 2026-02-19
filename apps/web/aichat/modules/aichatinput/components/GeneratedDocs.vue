<script setup lang="ts">

import { computed } from 'vue';
import { marked } from 'marked';

interface GeneratedDocsSummaryData {
  type: 'generated_docs_summary';
  snippetId: string;
  format: string;
  content: string;
}
const props = defineProps<{ 
  summary: GeneratedDocsSummaryData 
}>();
const renderedMarkdown = computed(() => {
  // Ensure that code blocks within the markdown are not escaped
  return marked(props.summary.content, { gfm: true, breaks: true });
});

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Generated Documentation</h3>
    <div class="prose prose-sm max-w-none" v-html="renderedMarkdown"></div>
  </div>

</template>

<style>

/* Basic prose styling for rendered markdown */
.prose h1, .prose h2, .prose h3 {
  font-weight: 600;
}
.prose code {
  background-color: #f3f4f6; /* bg-gray-100 */
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 3px;
}
.prose pre {
  background-color: #111827; /* bg-gray-900 */
  color: #e5e7eb; /* text-gray-200 */
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}
.prose pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  font-size: inherit;
}

</style>