<script setup lang="ts">


interface Perspective {
  stance: 'for' | 'against' | 'neutral';
  title: string;
  summary: string;
  sourceUrl?: string;
}
interface PerspectiveSummaryData {
  type: 'perspective_summary';
  topic: string;
  perspectives: Perspective[];
}
defineProps<{ 
  summary: PerspectiveSummaryData 
}>();
const getStanceColor = (stance: 'for' | 'against' | 'neutral') => {
  switch (stance) {
    case 'for': return 'bg-green-50 border-green-500';
    case 'against': return 'bg-red-50 border-red-500';
    case 'neutral': return 'bg-yellow-50 border-yellow-500';
    default: return 'bg-gray-50 border-gray-500';
  }
};

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Multi-perspective Analysis: {{ summary.topic }}</h3>
    <p class="mb-4 text-sm text-gray-600">Here's a breakdown of different viewpoints on this topic:</p>
    <div class="space-y-4">
      <div v-for="perspective in summary.perspectives" :key="perspective.stance" 
           :class="['p-3 rounded-md border-l-4', getStanceColor(perspective.stance)]">
        <p class="font-semibold text-gray-700">{{ perspective.title }}</p>
        <p class="mt-1 text-xs text-gray-600">{{ perspective.summary }}</p>
        <a v-if="perspective.sourceUrl" :href="perspective.sourceUrl" target="_blank" rel="noopener noreferrer" 
           class="inline-block mt-2 text-xs font-medium text-blue-600 hover:underline">
          Read more
        </a>
      </div>
    </div>
  </div>

</template>