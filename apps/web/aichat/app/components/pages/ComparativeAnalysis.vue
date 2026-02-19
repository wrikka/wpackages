<script setup lang="ts">


interface Feature {
  name: string;
  values: string[];
}
interface ComparativeAnalysisSummaryData {
  type: 'comparative_analysis_summary';
  items: string[];
  features: Feature[];
  summary: string;
}
defineProps<{ 
  summary: ComparativeAnalysisSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">Comparative Analysis</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-2">Feature</th>
            <th v-for="(item, index) in summary.items" :key="index" scope="col" class="px-4 py-2 text-center">
              {{ item }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(feature, featureIndex) in summary.features" :key="featureIndex" class="bg-white border-b">
            <td class="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{{ feature.name }}</td>
            <td v-for="(value, valueIndex) in feature.values" :key="valueIndex" class="px-4 py-2 text-center">
              {{ value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4">
      <p class="text-sm font-medium text-gray-700">Summary:</p>
      <p class="mt-1 text-xs text-gray-600">{{ summary.summary }}</p>
    </div>
  </div>

</template>