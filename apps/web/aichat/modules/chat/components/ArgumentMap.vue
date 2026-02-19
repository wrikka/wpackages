<script setup lang="ts">


interface ArgumentMapSummaryData {
  type: 'argument_map_summary';
  conclusion: string;
  premises: string[];
  structure: string;
}
defineProps<{ 
  summary: ArgumentMapSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Argument Map</h3>
    <div class="relative p-4 border-t-2 border-b-2 border-gray-300">
      <div class="text-center">
        <p class="text-sm font-medium text-gray-700">Conclusion:</p>
        <p class="inline-block px-3 py-2 mt-1 text-sm font-semibold text-green-800 bg-green-100 rounded-lg">{{ summary.conclusion }}</p>
      </div>
      <div class="flex justify-center mt-4">
        <div class="w-px h-8 bg-gray-300"></div>
      </div>
      <p class="mt-4 text-sm font-medium text-center text-gray-700">Supporting Premises:</p>
      <div class="grid gap-4 mt-2" :class="`grid-cols-${summary.premises.length}`">
        <div v-for="(premise, index) in summary.premises" :key="index" class="p-3 text-xs text-center text-blue-800 bg-blue-100 rounded-lg">
          {{ premise }}
        </div>
      </div>
    </div>
    <p class="mt-3 text-xs text-right text-gray-500">Argument Structure: <span class="font-semibold">{{ summary.structure }}</span></p>
  </div>

</template>