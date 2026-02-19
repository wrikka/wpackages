<script setup lang="ts">


interface TableData {
  headers: string[];
  rows: string[][];
}
interface DataVisualizationSummaryData {
  type: 'data_visualization_summary';
  dataType: 'table' | 'chart';
  data: TableData; // Can be expanded to support other data structures
  title: string;
}
defineProps<{ 
  summary: DataVisualizationSummaryData 
}>();

</script>

<template>

  <div class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="mb-3 text-lg font-semibold text-gray-800">{{ summary.title }}</h3>
    <div v-if="summary.dataType === 'table'" class="overflow-x-auto">
      <table class="min-w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th v-for="(header, index) in summary.data.headers" :key="index" scope="col" class="px-4 py-2">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in summary.data.rows" :key="rowIndex" class="bg-white border-b">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="px-4 py-2">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Placeholder for other data types like charts -->
    <div v-else>
      <p>Unsupported data visualization type: {{ summary.dataType }}</p>
    </div>
  </div>

</template>