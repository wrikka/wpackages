<script setup lang="ts">


interface OutlineSection {
  title: string;
  bullets: string[];
}
interface OutlineSummary {
  type: 'outline_summary';
  topic: string;
  outline: OutlineSection[];
}
defineProps<{ summary: OutlineSummary }>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-2 text-lg font-semibold text-gray-800">Outline</h3>
    <p class="text-sm text-gray-700"><strong>Topic:</strong> {{ summary.topic }}</p>

    <div class="mt-3 space-y-3">
      <div v-for="(section, idx) in summary.outline" :key="idx" class="p-3 bg-gray-50 rounded">
        <p class="text-sm font-semibold text-gray-800">{{ section.title }}</p>
        <ul class="mt-2 list-disc list-inside text-sm text-gray-700">
          <li v-for="(b, j) in section.bullets" :key="j">{{ b }}</li>
        </ul>
      </div>
    </div>
  </div>

</template>