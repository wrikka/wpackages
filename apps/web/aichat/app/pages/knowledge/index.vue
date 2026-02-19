<script setup lang="ts">

import KnowledgeGraphVisualizer from '~/components/knowledge-graph/KnowledgeGraphVisualizer.vue';

</script>

<template>

  <div class="bg-gray-900 text-white min-h-screen p-8 flex flex-col">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-2">Knowledge Graph</h1>
      <p class="text-lg text-gray-400">Visualizing the agent's understanding of connected concepts.</p>
    </header>
    <div class="flex-grow bg-gray-800 rounded-lg p-4">
      <KnowledgeGraphVisualizer />
    </div>
  </div>

</template>