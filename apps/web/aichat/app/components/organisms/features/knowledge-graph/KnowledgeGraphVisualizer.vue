<script setup lang="ts">

import { useKnowledgeGraphStore } from '~/stores/knowledgeGraphStore';

const store = useKnowledgeGraphStore();
onMounted(() => {
  store.fetchGraphData();
});
// This is a very basic visualization. A real library would handle positioning and rendering.
// We'll simulate positions for this mock.
const nodePositions = computed(() => {
  const positions: { [key: string]: { x: number; y: number } } = {};
  store.graph.nodes.forEach((node, index) => {
    positions[node.id] = {
      x: (index % 4) * 200 + 100,
      y: Math.floor(index / 4) * 150 + 100,
    };
  });
  return positions;
});

</script>

<template>

  <div class="w-full h-full relative">
    <svg class="absolute top-0 left-0 w-full h-full">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4b5563" />
        </marker>
      </defs>
      <g v-for="edge in store.graph.edges" :key="edge.id">
        <line
          :x1="nodePositions[edge.source]?.x"
          :y1="nodePositions[edge.source]?.y"
          :x2="nodePositions[edge.target]?.x"
          :y2="nodePositions[edge.target]?.y"
          class="stroke-current text-gray-700"
          stroke-width="2"
          marker-end="url(#arrow)"
        />
      </g>
    </svg>

    <div
      v-for="node in store.graph.nodes"
      :key="node.id"
      class="absolute p-3 rounded-lg shadow-lg text-center transform -translate-x-1/2 -translate-y-1/2"
      :style="{ left: `${nodePositions[node.id]?.x}px`, top: `${nodePositions[node.id]?.y}px`, backgroundColor: node.color }"
    >
      <p class="font-bold text-sm">{{ node.label }}</p>
      <p class="text-xs opacity-80">{{ node.type }}</p>
    </div>
  </div>

</template>